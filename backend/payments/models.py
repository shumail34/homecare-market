from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator
from bookings.models import Booking
import uuid


class Payment(models.Model):
    """Payment model for booking transactions"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('CARD', 'Credit/Debit Card'),
        ('BANK', 'Bank Transfer'),
        ('WALLET', 'Digital Wallet'),
    ]
    
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='payment'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MaxValueValidator(10000)]
    )
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.transaction_id} - Rs. {self.amount}"
