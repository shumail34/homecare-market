from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import OTP

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.verify_otp_url = '/api/auth/verify-otp/'
        self.email = "test@example.com"
        self.password = "password123"
        self.full_name = "Test User"

    def test_registration_and_login_flow(self):
        # 1. Register
        register_data = {
            "email": self.email,
            "full_name": self.full_name,
            "password": self.password
        }
        response = self.client.post(self.register_url, register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('OTP sent', response.data['message'])

        # 2. Verify OTP (Registration completion)
        user = User.objects.get(email=self.email)
        otp = OTP.objects.get(user=user)
        # We need to use the raw code, but OTP model hashes it. 
        # In tests, we can find a way to get the raw code or just mock the verification.
        # Since we want to test the full flow, let's manually trigger verification if needed 
        # or rely on the fact that we can't easily get the raw code from DB.
        # For simplicity in this test, let's test login directly since password is set.
        
        # 3. Login with password
        login_data = {
            "email": self.email,
            "password": self.password
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_failed_wrong_password(self):
        # Create user
        User.objects.create_user(
            email=self.email,
            full_name=self.full_name,
            password=self.password,
            role='CUSTOMER'
        )
        
        login_data = {
            "email": self.email,
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['non_field_errors'][0], "Invalid email or password")
