from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    profile_picture_url = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()
    service_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'status', 'is_verified', 'phone', 'bio', 'address', 'profile_picture', 'profile_picture_url', 'average_rating', 'services', 'service_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'average_rating', 'services', 'service_count', 'created_at', 'updated_at']
    
    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

    def get_services(self, obj):
        """Return list of services belong to this provider"""
        if obj.role != 'SERVICE_PROVIDER':
            return []
        
        # Import here to avoid circular import
        from services.serializers import ServiceListSerializer
        services = obj.services.filter(is_available=True)
        return ServiceListSerializer(services, many=True, context=self.context).data

    def get_service_count(self, obj):
        """Return total count of services for this provider"""
        if obj.role != 'SERVICE_PROVIDER':
            return 0
        return obj.services.filter(is_available=True).count()


class RegisterSerializer(serializers.Serializer):
    """Serializer for self-registration"""
    
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='CUSTOMER')
    password = serializers.CharField(write_only=True, min_length=6)
    
    def validate_email(self, value):
        """Allow unverified users to 're-register' to get a new OTP"""
        try:
            user = User.objects.get(email=value)
            if user.is_verified:
                raise serializers.ValidationError("User with this email already exists and is verified.")
            return value
        except User.DoesNotExist:
            return value
    
    def create(self, validated_data):
        """Create user (or get unverified one) and send OTP"""
        email = validated_data['email']
        full_name = validated_data['full_name']
        password = validated_data['password']
        role = validated_data.get('role', 'CUSTOMER')
        phone = validated_data.get('phone')
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': full_name,
                'role': role,
                'status': 'APPROVED' if role == 'CUSTOMER' else 'PENDING',
                'phone': phone
            }
        )
        
        if not created:
            # Update info for unverified user re-attempting
            user.full_name = full_name
            user.set_password(password)
            user.phone = phone
            user.save()

        # Generate and Create OTP
        raw_code = OTP.generate_code()
        OTP.objects.create(user=user, code=raw_code)
        
        # ALWAYS print to console for development
        print(f"\n[AUTH] OTP for {user.email}: {raw_code}\n")
        
        # Send Email
        try:
            send_mail(
                'Verify your Home-Care Market Account',
                f'Your verification code is: {raw_code}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")
        
        return user


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    
    def validate(self, data):
        """Validate OTP and user status"""
        email = data.get('email')
        otp_code = data.get('otp_code')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
        # Get the latest OTP
        try:
            otp = user.otps.filter(is_used=False).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError("No active OTP found for this user")
            
        if not otp.is_valid():
            raise serializers.ValidationError("OTP has expired")
            
        if not otp.check_otp(otp_code):
            raise serializers.ValidationError("Invalid OTP code")
        
        data['user'] = user
        data['otp'] = otp
        return data


class LoginSerializer(serializers.Serializer):
    """Serializer for Email/Password login"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Authenticate user with email and password"""
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})
            
        if not user.check_password(password):
            raise serializers.ValidationError({"password": "Incorrect password. Please try again."})
            
        # Check role and status for Providers
        if user.role == 'SERVICE_PROVIDER':
            if user.status == 'PENDING':
                raise serializers.ValidationError("Your account is not approved yet. Please contact admin.")
            if user.status == 'REJECTED':
                raise serializers.ValidationError("Your account application was rejected.")
        
        if not user.is_active:
            raise serializers.ValidationError("Account is disabled.")

        data['user'] = user
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer to request a password reset OTP"""
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer to reset password using OTP"""
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        email = data.get('email')
        otp_code = data.get('otp_code')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        # Get the latest OTP
        try:
            otp = user.otps.filter(is_used=False).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError("No active OTP found for this user")

        if not otp.is_valid():
            raise serializers.ValidationError("OTP has expired")

        if not otp.check_otp(otp_code):
            raise serializers.ValidationError("Invalid OTP code")

        data['user'] = user
        data['otp'] = otp
        return data
