from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer, BookingUpdateSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def send_realtime_update(user_id, type, payload):
    """Helper to send WebSocket notification to a specific user"""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notification_user_{user_id}',
        {
            'type': 'app_notification',
            'payload': {
                'type': type,
                'data': payload
            }
        }
    )



class BookingListCreateView(generics.ListCreateAPIView):
    """List all bookings or create a new booking"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q
        return Booking.objects.filter(
            Q(customer=user) | Q(provider=user)
        ).select_related('service', 'customer', 'provider')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingSerializer
    
    def perform_create(self, serializer):
        # Allow any authenticated user to create a booking (Customer, Provider, or Admin)
        # Note: A provider booking their own service is usually prevented in the serializer
        booking = serializer.save()
        
        # Notify provider about new booking in real-time
        try:
            send_realtime_update(
                booking.provider.id, 
                'NEW_BOOKING', 
                {'booking_id': str(booking.id), 'service': booking.service.title}
            )
        except Exception as e:
            print(f"WS Notification Error: {e}")


class BookingDetailView(generics.RetrieveAPIView):
    """Retrieve a specific booking"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q
        return Booking.objects.filter(
            Q(customer=user) | Q(provider=user)
        )


class CustomerBookingsView(generics.ListAPIView):
    """List all bookings for a customer"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).select_related('service', 'provider')


class ProviderBookingsView(generics.ListAPIView):
    """List all bookings for a provider"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering = ['-scheduled_date']
    
    def get_queryset(self):
        return Booking.objects.filter(
            provider=self.request.user
        ).select_related('service', 'customer')


class UpdateBookingStatusView(generics.GenericAPIView):
    """Explicit status update handler allowing both provider and customer."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = BookingUpdateSerializer
    queryset = Booking.objects.all()
    
    def patch(self, request, *args, **kwargs):
        user = request.user
        booking_id = kwargs.get('pk')
        
        try:
            booking = Booking.objects.get(Q(id=booking_id) & (Q(customer=user) | Q(provider=user)))
        except Booking.DoesNotExist:
            print(f"[StatusUpdate] Booking {booking_id} not found for user {user.email}")
            return Response({"detail": "Booking not found or access denied."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print(f"[StatusUpdate] Successfully updated Booking {booking.id} to {booking.status}")
            
            # Real-time WebSocket notifications for both parties
            update_data = {
                'booking_id': str(booking.id), 
                'status': booking.status,
                'updated_by': user.full_name
            }
            try:
                # Notify customer
                send_realtime_update(booking.customer.id, 'BOOKING_UPDATE', update_data)
                # Notify provider
                send_realtime_update(booking.provider.id, 'BOOKING_UPDATE', update_data)
            except Exception as e:
                print(f"WS Notification Error: {e}")
                
            return Response(BookingSerializer(booking, context={'request': request}).data)
        
        print(f"[StatusUpdate] Validation failed for Booking {booking.id}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
