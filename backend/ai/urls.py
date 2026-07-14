from django.urls import path
from .views import GetRecommendationsView, ChatbotView, SmartSearchView

urlpatterns = [
    path('recommendations/', GetRecommendationsView.as_view(), name='ai-recommendations'),
    path('chat/', ChatbotView.as_view(), name='ai-chat'),
    path('smart-search/', SmartSearchView.as_view(), name='ai-smart-search'),
]
