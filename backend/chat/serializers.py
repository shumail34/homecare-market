from rest_framework import serializers
from .models import Message, ChatRoom

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    content = serializers.CharField() # Uses the property for decryption

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'content', 'timestamp', 'is_read', 'is_delivered']
        read_only_fields = ['id', 'sender', 'sender_name', 'timestamp']

class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    partner_name = serializers.SerializerMethodField()
    partner_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'booking', 'created_at', 'is_active', 'messages', 'last_message', 'unread_count', 'partner_name', 'partner_picture_url']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-timestamp').first()
        if last_msg:
            return {
                'content': last_msg.content[:50],
                'timestamp': last_msg.timestamp,
                'sender_name': last_msg.sender.full_name
            }
        return None

    def get_unread_count(self, obj):
        user = self.context.get('request').user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()

    def get_partner_name(self, obj):
        user = self.context.get('request').user
        if user == obj.booking.customer:
            return obj.booking.provider.full_name
        return obj.booking.customer.full_name

    def get_partner_picture_url(self, obj):
        user = self.context.get('request').user
        partner = obj.booking.provider if user == obj.booking.customer else obj.booking.customer
        if partner.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(partner.profile_picture.url)
            return partner.profile_picture.url
        return None
