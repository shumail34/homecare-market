from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'provider', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['customer__full_name', 'provider__full_name', 'comment']
    readonly_fields = ['created_at', 'updated_at']
