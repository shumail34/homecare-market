from rest_framework import serializers
from .models import ServiceCategory, Service
from accounts.serializers import UserSerializer


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer for ServiceCategory"""
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'icon_url', 'created_at']
        read_only_fields = ['id', 'created_at']


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service with provider details"""
    
    provider = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.ReadOnlyField()
    total_bookings = serializers.ReadOnlyField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'provider', 'category', 'category_name', 'title', 
            'description', 'price_per_hour', 'image', 'area', 'city', 'is_available',
            'average_rating', 'total_bookings', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'provider', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set provider from request user
        validated_data['provider'] = self.context['request'].user
        return super().create(validated_data)


class ServiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for service listings"""
    
    provider_name = serializers.CharField(source='provider.full_name', read_only=True)
    provider_picture = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.ReadOnlyField()
    provider_rating = serializers.FloatField(source='provider.average_rating', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'title', 'description', 'price_per_hour', 'image',
            'provider_name', 'provider_picture', 'provider_rating', 'category_name', 
            'average_rating', 'is_available', 'provider', 'area', 'city', 'total_bookings'
        ]

    def get_provider_picture(self, obj):
        request = self.context.get('request')
        if obj.provider.profile_picture:
            if request:
                return request.build_absolute_uri(obj.provider.profile_picture.url)
            return obj.provider.profile_picture.url
        return None
