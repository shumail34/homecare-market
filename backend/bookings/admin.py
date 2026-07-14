from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'service', 'provider', 'status', 'total_amount', 'scheduled_date', 'created_at']
    list_filter = ['status', 'created_at', 'scheduled_date']
    search_fields = ['customer__full_name', 'provider__full_name', 'service__title']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
