from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    """List all reviews or create a new review"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.select_related('customer', 'provider', 'booking__service').all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def perform_create(self, serializer):
        # Only customers can create reviews
        if self.request.user.role != 'CUSTOMER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only customers can create reviews")
        serializer.save()


class ServiceReviewsView(generics.ListAPIView):
    """List all reviews for a specific service"""
    
    permission_classes = [AllowAny]
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        service_id = self.kwargs['service_id']
        return Review.objects.filter(
            booking__service_id=service_id
        ).select_related('customer', 'provider')


class ProviderReviewsView(generics.ListAPIView):
    """List all reviews for a specific provider"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        provider_id = self.kwargs['provider_id']
        return Review.objects.filter(
            provider_id=provider_id
        ).select_related('customer', 'booking__service')
