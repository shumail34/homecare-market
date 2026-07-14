from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .recommendation_engine import RecommendationEngine
from services.models import Service
from .chatbot import Chatbot
from .smart_assistant import SmartHomeServiceAssistant
from .serializers import (
    RecommendationRequestSerializer,
    ChatMessageSerializer,
    SmartSearchRequestSerializer,
)
from services.serializers import ServiceListSerializer


class GetRecommendationsView(generics.GenericAPIView):
    """
    AI-powered service recommendations.
    Returns top services scored by rating, bookings, and availability.
    """
    permission_classes = [AllowAny]
    serializer_class = RecommendationRequestSerializer
    queryset = Service.objects.none()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        category_id = serializer.validated_data.get('category_id')
        limit = serializer.validated_data.get('limit', 6)

        recommendations = RecommendationEngine.get_recommendations(
            category_id=category_id,
            limit=limit
        )

        results = []
        for rec in recommendations:
            results.append({
                'service': ServiceListSerializer(rec['service'], context={'request': request}).data,
                'score': rec['score'],
                'explanation': rec['explanation']
            })

        return Response(results, status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        """GET support for easy frontend integration"""
        category_id = request.query_params.get('category_id')
        limit = int(request.query_params.get('limit', 6))
        city = request.query_params.get('city')
        max_price = request.query_params.get('max_price')

        recommendations = RecommendationEngine.get_recommendations(
            category_id=int(category_id) if category_id else None,
            limit=limit,
            location=city,
            max_price=max_price
        )

        results = []
        for rec in recommendations:
            results.append({
                'service': ServiceListSerializer(rec['service'], context={'request': request}).data,
                'score': rec['score'],
                'explanation': rec['explanation']
            })

        return Response(results, status=status.HTTP_200_OK)


class ChatbotView(generics.GenericAPIView):
    """
    Gemini 2.0 Flash powered AI Chatbot.
    Handles all user questions about the platform.
    """
    permission_classes = [AllowAny]
    serializer_class = ChatMessageSerializer
    queryset = Service.objects.none()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data.get('message')
        response_data = Chatbot.get_response(message)

        return Response(response_data, status=status.HTTP_200_OK)


class SmartSearchView(generics.GenericAPIView):
    """
    Gemini 2.0 Flash powered Smart Search.
    Converts natural language into structured service search intent.
    Example: "Find me a cheap plumber today" → {"category": "Plumbing", "max_budget": null, "urgency": "today"}
    """
    permission_classes = [AllowAny]
    serializer_class = SmartSearchRequestSerializer
    queryset = Service.objects.none()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data.get('message')
        structured_intent = SmartHomeServiceAssistant.process_request(message)

        return Response(structured_intent, status=status.HTTP_200_OK)
