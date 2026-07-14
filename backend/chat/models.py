from django.db import models
from django.conf import settings
from bookings.models import Booking
from cryptography.fernet import Fernet
import base64

# Key should be in .env in production
# For now we use a fixed key or generate one if not provided
# In a real app, this would be config('CHAT_ENCRYPTION_KEY')
ENCRYPTION_KEY = b'G6pWp-JkP6oF7T7D8q-ZpY_Wk-X9B_8_D6v6v_v6v6v=' # Example key

class ChatRoom(models.Model):
    """Room for chat between customer and provider for a specific booking"""
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='chat_room')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'chat_rooms'

    def __str__(self):
        return f"Chat for Booking #{self.booking.id}"

class Message(models.Model):
    """Individual message in a chat room"""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    encrypted_content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_delivered = models.BooleanField(default=False)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['timestamp']

    def __str__(self):
        return f"Message by {self.sender.full_name} at {self.timestamp}"

    @property
    def content(self):
        """Decrypt content on access"""
        try:
            f = Fernet(ENCRYPTION_KEY)
            return f.decrypt(self.encrypted_content.encode()).decode()
        except Exception:
            return "[Decryption Error]"

    @content.setter
    def content(self, value):
        """Encrypt content on save"""
        f = Fernet(ENCRYPTION_KEY)
        self.encrypted_content = f.encrypt(value.encode()).decode()
