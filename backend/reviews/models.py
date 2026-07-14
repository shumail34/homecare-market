from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from bookings.models import Booking


class Review(models.Model):
    """Review and rating model for completed bookings"""
    
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='review',
        limit_choices_to={'status': 'COMPLETED'}
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given',
        limit_choices_to={'role': 'CUSTOMER'}
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_received',
        limit_choices_to={'role': 'SERVICE_PROVIDER'}
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Review by {self.customer.full_name} - {self.rating} stars"
    
    def save(self, *args, **kwargs):
        # Auto-set customer and provider from booking
        if not self.customer_id:
            self.customer = self.booking.customer
        if not self.provider_id:
            self.provider = self.booking.provider
        super().save(*args, **kwargs)
