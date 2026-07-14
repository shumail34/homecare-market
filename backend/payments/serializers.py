from rest_framework import serializers
from .models import Payment
from bookings.serializers import BookingSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Full payment serializer with booking details"""
    
    booking = BookingSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'amount', 'payment_method', 'transaction_id',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments"""
    
    class Meta:
        model = Payment
        fields = ['booking', 'amount', 'payment_method']
    
    def validate_amount(self, value):
        """Validate amount doesn't exceed Rs. 10,000"""
        if value > 10000:
            raise serializers.ValidationError("Payment amount cannot exceed Rs. 10,000")
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than 0")
        return value
    
    def validate_booking(self, value):
        """Validate booking exists and belongs to user"""
        user = self.context['request'].user
        
        # Check if booking belongs to user (customer)
        if value.customer != user:
            raise serializers.ValidationError("You can only pay for your own bookings")
        
        # Check if booking is accepted
        if value.status not in ['ACCEPTED', 'COMPLETED']:
            raise serializers.ValidationError("You can only pay for accepted or completed bookings")
        
        # Check if payment already exists
        if hasattr(value, 'payment'):
            raise serializers.ValidationError("Payment already exists for this booking")
        
        # Validate amount matches booking amount
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        booking = data.get('booking')
        amount = data.get('amount')
        
        if booking and amount:
            if amount != booking.total_amount:
                raise serializers.ValidationError({
                    'amount': f"Amount must match booking total: Rs. {booking.total_amount}"
                })
        
        return data
    
    def create(self, validated_data):
        """Create payment and simulate payment processing"""
        payment = super().create(validated_data)
        
        # In production, integrate with payment gateway here
        # For now, we'll auto-complete the payment
        payment.status = 'COMPLETED'
        payment.save()
        
        return payment
