from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTP


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'role', 'status', 'is_staff')
    list_filter = ('role', 'status', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'full_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'bio', 'address', 'profile_picture')}),
        ('Permissions', {'fields': ('role', 'status', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'is_used', 'expires_at', 'created_at']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__phone', 'code']
    readonly_fields = ['created_at']
