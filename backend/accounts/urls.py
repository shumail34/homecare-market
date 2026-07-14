from django.urls import path
from .views import (
    RegisterView, VerifyOTPView, LoginView, ProfileView, ContactView,
    ForgotPasswordView, ResetPasswordView, PublicUserDetailView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/<uuid:id>/', PublicUserDetailView.as_view(), name='user-detail'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]
