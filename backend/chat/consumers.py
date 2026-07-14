import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
from bookings.models import Booking

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.booking_id = self.scope['url_route']['kwargs']['booking_id']
        self.room_group_name = f'chat_{self.booking_id}'
        self.user = self.scope['user']

        if self.user.is_anonymous:
            await self.close()
            return

        if not await self.has_access():
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Mark messages as delivered when recipient connects
        await self.mark_messages_delivered()
        # Notify group that user is online/read messages
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'status_update',
                'user_id': str(self.user.id),
                'status': 'delivered'
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'chat_message':
            content = data.get('message')
            if content:
                msg = await self.save_message(content)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': content,
                        'message_id': msg.id,
                        'timestamp': msg.timestamp.isoformat(),
                        'sender': self.user.full_name,
                        'sender_id': str(self.user.id),
                    }
                )
                
                # Notify the OTHER person in the booking about the new message globally
                recipient_id = await self.get_recipient_id()
                if recipient_id:
                    from bookings.views import send_realtime_update
                    try:
                        send_realtime_update(recipient_id, 'NEW_MESSAGE', {
                            'booking_id': self.booking_id,
                            'sender': self.user.full_name
                        })
                    except Exception as e:
                        print(f"WS Global Notification Error: {e}")
        elif message_type == 'read_receipt':
            # Mark all messages in this room as read for this user
            await self.mark_messages_read()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'status_update',
                    'user_id': str(self.user.id),
                    'status': 'read'
                }
            )
        elif message_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_typing',
                    'user': self.user.full_name,
                    'is_typing': data.get('is_typing', False)
                }
            )

    async def chat_message(self, event):
        # When receiving a message, if it's not from us, it's "delivered" to our client
        if event['sender_id'] != str(self.user.id):
            await self.mark_message_delivered(event['message_id'])
            
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'message_id': event.get('message_id'),
            'timestamp': event.get('timestamp'),
            'sender': event['sender'],
            'sender_id': event['sender_id']
        }))

    async def status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'user_id': event['user_id'],
            'status': event['status']
        }))

    async def user_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing']
        }))

    @database_sync_to_async
    def mark_messages_delivered(self):
        Message.objects.filter(
            room__booking_id=self.booking_id
        ).exclude(sender=self.user).update(is_delivered=True)

    @database_sync_to_async
    def mark_message_delivered(self, message_id):
        Message.objects.filter(id=message_id).update(is_delivered=True)

    @database_sync_to_async
    def mark_messages_read(self):
        Message.objects.filter(
            room__booking_id=self.booking_id
        ).exclude(sender=self.user).update(is_read=True, is_delivered=True)

    @database_sync_to_async
    def save_message(self, content):
        room, _ = ChatRoom.objects.get_or_create(booking_id=self.booking_id)
        msg = Message(room=room, sender=self.user)
        msg.content = content
        msg.save()
        return msg

    @database_sync_to_async
    def has_access(self):
        try:
            booking = Booking.objects.get(id=self.booking_id)
            return self.user.is_staff or self.user.is_superuser or \
                   self.user == booking.customer or self.user == booking.provider
        except Booking.DoesNotExist:
            return False

    @database_sync_to_async
    def get_recipient_id(self):
        try:
            booking = Booking.objects.get(id=self.booking_id)
            if self.user == booking.customer:
                return booking.provider.id
            return booking.customer.id
        except Booking.DoesNotExist:
            return None

class NotificationConsumer(AsyncWebsocketConsumer):
    """Global notification consumer for real-time app updates"""
    async def connect(self):
        self.user = self.scope.get('user')
        
        if not self.user or self.user.is_anonymous:
            await self.close()
            return
            
        # Group name is uniquely linked to the user ID
        self.notification_group_name = f'notification_user_{self.user.id}'
        
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        await self.accept()
        
    async def disconnect(self, close_code):
        if hasattr(self, 'notification_group_name'):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
            
    async def app_notification(self, event):
        """Send notification to the client"""
        await self.send(text_data=json.dumps(event['payload']))
