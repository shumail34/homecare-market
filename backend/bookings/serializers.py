from rest_framework import serializers
from decimal import Decimal
from .models import Booking
from services.serializers import ServiceListSerializer
from accounts.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Full booking serializer with related data"""
    
    customer = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    service = ServiceListSerializer(read_only=True)
    
    review_rating = serializers.IntegerField(source='review.rating', read_only=True, default=None)
    review_comment = serializers.CharField(source='review.comment', read_only=True, default=None)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'service', 'provider', 'scheduled_date', 'address',
            'status', 'duration_hours', 'total_amount', 'notes', 'created_at', 'updated_at',
            'is_otp_verified', 'review_rating', 'review_comment'
        ]
        read_only_fields = ['id', 'customer', 'provider', 'created_at', 'updated_at', 'is_otp_verified']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Show OTP only to the customer so they can give it to the provider
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user == instance.customer:
            # Emergency fallback: generate OTP if missing but status is active
            if instance.status in ['ACCEPTED', 'IN_PROGRESS'] and not instance.completion_otp:
                instance.generate_otp()
            ret['completion_otp'] = instance.completion_otp
        return ret


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    
    class Meta:
        model = Booking
        fields = ['service', 'scheduled_date', 'address', 'duration_hours', 'total_amount', 'notes']
    
    def validate_duration_hours(self, value):
        if value < 1 or value > 24:
            raise serializers.ValidationError("Duration must be between 1 and 24 hours.")
        return value

    def validate(self, data):
        service = data.get('service')
        duration = data.get('duration_hours', 1)
        
        # Auto-calculate total amount if not provided or to ensure correctness
        if service:
            data['total_amount'] = Decimal(service.price_per_hour) * Decimal(duration)
            
        return data
    
    def create(self, validated_data):
        # Set customer from request user
        user = self.context['request'].user
        validated_data['customer'] = user
        
        # Check if provider is restricted
        service = validated_data.get('service')
        if service:
            # 1. Prevent self-booking
            if service.provider == user:
                raise serializers.ValidationError(
                    {"service": "You cannot book your own service listing."}
                )
                
            # 2. Check provider wallet status
            provider = service.provider
            wallet = getattr(provider, 'wallet', None)
            if wallet and wallet.commission_balance <= wallet.negative_limit_threshold:
                raise serializers.ValidationError(
                    {"service": f"Service provider is currently not accepting new bookings due to an outstanding commission balance of {wallet.commission_balance} PKR."}
                )
        
        return super().create(validated_data)


class BookingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating booking status"""
    otp = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Booking
        fields = ['status', 'otp']
    
    def validate(self, data):
        user = self.context['request'].user
        instance = self.instance
        new_status = data.get('status')
        otp = data.get('otp')

        # Only providers can move it to ACCEPTED, IN_PROGRESS, or COMPLETED
        if new_status in ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] and instance.provider_id != user.id:
            raise serializers.ValidationError("Only the service provider can confirm or start this job.")

        if new_status == 'COMPLETED':
            if not otp:
                raise serializers.ValidationError({"otp": "OTP is required to complete the service."})
            
            # Robust comparison: strip whitespace and ensure both are strings
            expected_otp = str(instance.completion_otp or "").strip()
            input_otp = str(otp).strip()
            
            if not expected_otp or input_otp != expected_otp:
                raise serializers.ValidationError({"otp": "Invalid OTP. Please ask the customer to refresh their page and provide the 6-digit code again."})
        
        return data

    def validate_status(self, value):
        """Validate status transitions and enforce Wallet Gatekeeping"""
        instance = self.instance
        current_status = instance.status
        
        # Define valid transitions
        valid_transitions = {
            'PENDING': ['ACCEPTED', 'CANCELLED'],
            'ACCEPTED': ['IN_PROGRESS', 'CANCELLED'],
            'IN_PROGRESS': ['COMPLETED'],
            'COMPLETED': [],
            'CANCELLED': []
        }
        
        if value == current_status:
            return value
            
        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}"
            )

        # GATEKEEPER: Check if provider is allowed to accept new work
        if value == 'ACCEPTED':
            wallet = getattr(instance.provider, 'wallet', None)
            if wallet and wallet.commission_balance <= wallet.negative_limit_threshold:
                raise serializers.ValidationError(
                    f"You cannot accept this job because your account is restricted due to an outstanding commission balance of {wallet.commission_balance} PKR. Please clear your dues in the 'My Wallet' section to resume work."
                )
        
        return value

    def update(self, instance, validated_data):
        new_status = validated_data.get('status')
        if new_status == 'COMPLETED':
            instance.is_otp_verified = True
            
        return super().update(instance, validated_data)
