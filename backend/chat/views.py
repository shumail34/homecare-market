from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import ChatRoom, Message
from .serializers import MessageSerializer, ChatRoomSerializer
from django.db.models import Q
from bookings.models import Booking
from django.shortcuts import get_object_or_404

class ChatHistoryView(generics.RetrieveAPIView):
    """Retrieve chat history for a specific booking"""
    serializer_class = ChatRoomSerializer
    
    def get_object(self):
        booking_id = self.kwargs.get('booking_id')
        booking = get_object_or_404(Booking, id=booking_id)
        
        # Security: Check if user has access
        if self.request.user != booking.customer and self.request.user != booking.provider:
            raise PermissionDenied("You do not have permission to access this chat history.")
            
        room, _ = ChatRoom.objects.get_or_create(booking=booking)
        return room

# Optional: List all chats for a user
class UserChatsView(generics.ListAPIView):
    serializer_class = ChatRoomSerializer
    
    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            Q(booking__customer=user) | Q(booking__provider=user)
        ).order_by('-created_at')


class UnreadMessageCountView(APIView):
    """Returns total unread message count across all chats for the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        rooms = ChatRoom.objects.filter(
            Q(booking__customer=user) | Q(booking__provider=user)
        )
        total_unread = Message.objects.filter(
            room__in=rooms,
            is_read=False
        ).exclude(sender=user).count()
        return Response({"unread": total_unread})
