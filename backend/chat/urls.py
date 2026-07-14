from django.urls import path
from .views import ChatHistoryView, UserChatsView, UnreadMessageCountView

urlpatterns = [
    path('history/<int:booking_id>/', ChatHistoryView.as_view(), name='chat-history'),
    path('my-chats/', UserChatsView.as_view(), name='user-chats'),
    path('unread-count/', UnreadMessageCountView.as_view(), name='chat-unread-count'),
]
