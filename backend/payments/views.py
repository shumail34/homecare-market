from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer


class CreatePaymentView(generics.CreateAPIView):
    """Create a new payment"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentCreateSerializer
    
    def perform_create(self, serializer):
        # Only customers can create payments
        if self.request.user.role != 'CUSTOMER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only customers can create payments")
        serializer.save()


class PaymentDetailView(generics.RetrieveAPIView):
    """Retrieve a specific payment"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'CUSTOMER':
            return Payment.objects.filter(booking__customer=user).select_related('booking')
        else:
            return Payment.objects.filter(booking__provider=user).select_related('booking')


class PaymentHistoryView(generics.ListAPIView):
    """List all payments for the authenticated user"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'CUSTOMER':
            return Payment.objects.filter(
                booking__customer=user
            ).select_related('booking__service', 'booking__provider')
        else:
            return Payment.objects.filter(
                booking__provider=user
            ).select_related('booking__service', 'booking__customer')
