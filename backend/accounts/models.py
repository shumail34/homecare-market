import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from datetime import timedelta


from django.contrib.auth.hashers import make_password, check_password

class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, full_name, role, password=None, status='APPROVED', phone=None):
        if not email:
            raise ValueError('Users must have an email address')
        
        user = self.model(
            email=self.normalize_email(email),
            full_name=full_name,
            role=role,
            status=status,
            phone=phone
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, full_name, password=None):
        user = self.create_user(
            email=email,
            full_name=full_name,
            role='ADMIN',
            password=password,
            status='APPROVED'
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_verified = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with email authentication"""
    
    ROLE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('SERVICE_PROVIDER', 'Service Provider'),
        ('ADMIN', 'Admin'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPROVED')
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Profile fields
    bio = models.TextField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    @property
    def average_rating(self):
        """Calculate absolute career rating for service provider (Average of all reviews)"""
        if self.role != 'SERVICE_PROVIDER':
            return 0.0
        
        from django.db.models import Avg
        avg = self.reviews_received.aggregate(Avg('rating'))['rating__avg']
        return round(float(avg), 1) if avg else 0.0

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class OTP(models.Model):
    """OTP model for email verification (hashed)"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    code = models.CharField(max_length=255) # Storing hashed code
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'otps'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.user.email}"
    
    def is_valid(self):
        """Check if OTP is still valid"""
        return not self.is_used and timezone.now() < self.expires_at
    
    def check_otp(self, raw_code):
        """Check if the raw code matches the hashed code"""
        return check_password(raw_code, self.code)
    
    @staticmethod
    def generate_code():
        """Generate a 6-digit OTP code"""
        import random
        import string
        return ''.join(random.choices(string.digits, k=6))
    
    def save(self, *args, **kwargs):
        # Generate code if missing
        if not self.code:
            self.code = self.generate_code()
            
        # Hash code if it's not already hashed (assuming 6 digits means raw)
        if self.code and len(self.code) == 6:
            self.code = make_password(self.code)
            
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)
