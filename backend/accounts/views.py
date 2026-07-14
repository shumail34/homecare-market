from rest_framework import status, generics, views, parsers
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    VerifyOTPSerializer, 
    LoginSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new customer and send OTP"""
    
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Registration successful. OTP sent to your email.',
            'user_id': str(user.id),
            'email': user.email
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(generics.GenericAPIView):
    """Verify OTP and return JWT tokens"""
    
    permission_classes = [AllowAny]
    serializer_class = VerifyOTPSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        otp = serializer.validated_data['otp']
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        # Mark user as verified
        user.is_verified = True
        user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'OTP verified successfully',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class LoginView(generics.CreateAPIView):
    """Login user by sending OTP (handles auto-registration)"""
    
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate JWT tokens directly
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile (supports image upload via multipart/form-data)"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    
    def get_object(self):
        return self.request.user

    def get_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_context()
        return super().get_serializer(*args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ContactView(views.APIView):
    """Allow authenticated users to send support emails"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject = request.data.get('subject')
        message = request.data.get('message')
        
        if not subject or not message:
            return Response({'error': 'Subject and message are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        full_message = f"From: {user.full_name} ({user.email})\nRole: {user.role}\n\nMessage:\n{message}"
        
        try:
            send_mail(
                subject=f"Contact Us: {subject}",
                message=full_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL], # Send to support email
                fail_silently=False,
            )
            return Response({'message': 'Message sent successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgotPasswordView(generics.GenericAPIView):
    """Request a password reset OTP"""
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate and Create OTP
        from .models import OTP
        raw_code = OTP.generate_code()
        OTP.objects.create(user=user, code=raw_code)
        
        # ALWAYS print to console for development
        print(f"\n[AUTH] Password Reset OTP for {user.email}: {raw_code}\n")
        
        # Send Email
        try:
            send_mail(
                'Reset your Home-Care Market Password',
                f'Your password reset code is: {raw_code}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")
            
        return Response({
            'message': 'Password reset OTP sent to your email.'
        }, status=status.HTTP_200_OK)


class ResetPasswordView(generics.GenericAPIView):
    """Reset password using OTP"""
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password reset successful. You can now login with your new password.'
        }, status=status.HTTP_200_OK)


class PublicUserDetailView(generics.RetrieveAPIView):
    """Retrieve public profile info of a specific user/provider"""
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'
