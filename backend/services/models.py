from django.db import models
from django.conf import settings


class ServiceCategory(models.Model):
    """Service categories like Plumberin, Electrical, etc."""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'service_categories'
        verbose_name = 'Service Category'
        verbose_name_plural = 'Service Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Service(models.Model):
    """Service listings created by providers"""
    
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='services',
        limit_choices_to={'role': 'SERVICE_PROVIDER'}
    )
    category = models.ForeignKey(
        ServiceCategory, 
        on_delete=models.CASCADE, 
        related_name='services'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    area = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'services'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.provider.full_name}"
    
    @property
    def average_rating(self):
        """Calculate average rating from reviews"""
        from django.db.models import Avg
        avg = self.bookings.filter(
            status='COMPLETED',
            review__isnull=False
        ).aggregate(Avg('review__rating'))['review__rating__avg']
        return round(avg, 2) if avg else 0
    
    @property
    def total_bookings(self):
        """Count total completed bookings"""
        return self.bookings.filter(status='COMPLETED').count()
