from rest_framework import serializers
from .models import Review
from accounts.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    """Full review serializer with user details"""
    
    customer = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    service_title = serializers.CharField(source='booking.service.title', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'customer', 'provider', 'service_title',
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer', 'provider', 'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    
    class Meta:
        model = Review
        fields = ['booking', 'rating', 'comment']
    
    def validate_booking(self, value):
        """Validate booking is completed and belongs to user"""
        user = self.context['request'].user
        
        # Check if booking belongs to user
        if value.customer != user:
            raise serializers.ValidationError("You can only review your own bookings")
        
        # Check if booking is completed
        if value.status != 'COMPLETED':
            raise serializers.ValidationError("You can only review completed bookings")
        
        # Check if review already exists
        if hasattr(value, 'review'):
            raise serializers.ValidationError("You have already reviewed this booking")
        
        return value
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
