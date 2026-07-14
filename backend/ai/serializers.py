from rest_framework import serializers
from services.serializers import ServiceListSerializer

class RecommendationRequestSerializer(serializers.Serializer):
    category_id = serializers.IntegerField(required=False, allow_null=True)
    limit = serializers.IntegerField(default=10, min_value=1, max_value=50)

class RecommendationResponseSerializer(serializers.Serializer):
    service = ServiceListSerializer()
    score = serializers.FloatField()
    explanation = serializers.DictField()

class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000)

class ChatResponseSerializer(serializers.Serializer):
    reply = serializers.CharField()
    intent = serializers.CharField()

class SmartSearchRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000)

class SmartSearchResponseSerializer(serializers.Serializer):
    category = serializers.CharField()
    max_budget = serializers.IntegerField(allow_null=True)
    urgency = serializers.CharField()
    preferences = serializers.ListField(child=serializers.CharField())
