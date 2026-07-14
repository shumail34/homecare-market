from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import ServiceCategory, Service
from .serializers import ServiceCategorySerializer, ServiceSerializer, ServiceListSerializer


from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class ServiceCategoryListView(generics.ListAPIView):
    """List all service categories"""
    permission_classes = [AllowAny]
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer

    @method_decorator(cache_page(60 * 5)) # Cache for 5 minutes
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class ServiceListCreateView(generics.ListCreateAPIView):
    """List all services or create a new service (provider only)"""
    
    @method_decorator(cache_page(60 * 2)) # Cache list for 2 minutes
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
        
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'category': ['exact'],
        'provider': ['exact'],
        'is_available': ['exact'],
        'price_per_hour': ['gte', 'lte'],
        'area': ['icontains'],
        'city': ['exact', 'icontains'],
    }
    search_fields = ['title', 'description', 'area', 'city', 'provider__address']
    ordering_fields = ['created_at', 'price_per_hour', 'avg_rating']
    
    def get_queryset(self):
        from django.db.models import Avg, Count, Q
        return Service.objects.filter(
            is_available=True,
            provider__status='APPROVED'
        ).annotate(
            avg_rating=Avg('bookings__review__rating', filter=Q(bookings__status='COMPLETED')),
            total_completed=Count('bookings', filter=Q(bookings__status='COMPLETED'))
        ).select_related('provider', 'category')
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ServiceListSerializer
        return ServiceSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        # Only service providers (and admins) can create services
        if user.role != 'SERVICE_PROVIDER' and user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only service providers can create services")
            
        # Check if provider is restricted due to commission balance
        wallet = getattr(user, 'wallet', None)
        if wallet and wallet.account_status == "Restricted":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                f"You cannot create new services because your account is restricted due to an outstanding commission balance of {wallet.commission_balance} PKR. Please clear your dues in the 'My Wallet' section."
            )
            
        serializer.save(provider=user)


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a service"""
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
        
    queryset = Service.objects.select_related('provider', 'category').all()
    serializer_class = ServiceSerializer
    
    def perform_update(self, serializer):
        # Only the service owner can update
        if serializer.instance.provider != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own services")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only the service owner can delete
        if instance.provider != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own services")
        instance.delete()


class ProviderServicesView(generics.ListAPIView):
    """List all services for the authenticated provider"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer
    
    def get_queryset(self):
        return Service.objects.filter(provider=self.request.user).select_related('category')
