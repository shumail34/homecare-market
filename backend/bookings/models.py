import random
from django.db import models
from django.conf import settings
from services.models import Service


class Booking(models.Model):
    """Booking model for service requests"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_bookings',
        limit_choices_to={'role': 'CUSTOMER'}
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_bookings',
        limit_choices_to={'role': 'SERVICE_PROVIDER'}
    )
    scheduled_date = models.DateTimeField()
    address = models.TextField(blank=True, help_text="Service location address")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    duration_hours = models.PositiveIntegerField(default=1, help_text="Number of hours requested")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    completion_otp = models.CharField(max_length=6, blank=True, null=True)
    is_otp_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking #{self.id} - {self.service.title} by {self.customer.full_name}"

    def generate_otp(self):
        self.completion_otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        self.save()
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Check if provider is restricted
        if self.status == 'PENDING' and self.provider:
            wallet = getattr(self.provider, 'wallet', None)
            if wallet and wallet.current_balance <= wallet.negative_limit_threshold:
                raise ValidationError(f"Provider account is restricted due to outstanding balance ({wallet.current_balance} PKR).")

    def save(self, *args, **kwargs):
        # Auto-set provider from service
        if not self.provider_id:
            self.provider = self.service.provider
        
        # Initial OTP generation when accepted or started
        if self.status not in ['PENDING', 'CANCELLED'] and not self.completion_otp:
            self.completion_otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        super().save(*args, **kwargs)
