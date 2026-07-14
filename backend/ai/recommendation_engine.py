"""
AI Recommendation Engine for Home-Care Market

This module implements a weighted scoring algorithm to recommend
services and providers based on:
- Average rating (40% weight)
- Completed bookings count (30% weight)
- Availability (30% weight)
"""

from services.models import Service
from django.db.models import Avg, Count, Q


class RecommendationEngine:
    """Service recommendation engine with explainable scoring"""
    
    RATING_WEIGHT = 0.4
    BOOKINGS_WEIGHT = 0.3
    AVAILABILITY_WEIGHT = 0.3
    
    @staticmethod
    def calculate_score(service):
        """
        Calculate recommendation score for a service
        
        Returns:
            dict: {
                'score': float (0-1),
                'explanation': dict with breakdown
            }
        """
        # Get average rating
        avg_rating = service.average_rating or 0
        rating_score = (avg_rating / 5.0) * RecommendationEngine.RATING_WEIGHT
        
        # Get completed bookings count (normalize to 0-1, cap at 100)
        completed_count = service.total_bookings
        bookings_score = (min(completed_count, 100) / 100.0) * RecommendationEngine.BOOKINGS_WEIGHT
        
        # Availability score
        availability_score = (1 if service.is_available else 0) * RecommendationEngine.AVAILABILITY_WEIGHT
        
        # Total score
        total_score = rating_score + bookings_score + availability_score
        
        return {
            'score': round(total_score, 3),
            'explanation': {
                'rating': {
                    'value': avg_rating,
                    'score': round(rating_score, 3),
                    'weight': RecommendationEngine.RATING_WEIGHT
                },
                'completed_bookings': {
                    'value': completed_count,
                    'score': round(bookings_score, 3),
                    'weight': RecommendationEngine.BOOKINGS_WEIGHT
                },
                'availability': {
                    'value': service.is_available,
                    'score': round(availability_score, 3),
                    'weight': RecommendationEngine.AVAILABILITY_WEIGHT
                }
            }
        }
    
    @staticmethod
    def get_recommendations(category_id=None, limit=10, location=None, max_price=None):
        """
        Get recommended services with optional filters
        """
        # Build query
        queryset = Service.objects.select_related('provider', 'category')
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        if location:
            queryset = queryset.filter(city__icontains=location)
            
        if max_price:
            queryset = queryset.filter(price_per_hour__lte=max_price)
        
        # Get all services
        services = list(queryset)
        
        # Calculate scores for each service
        recommendations = []
        for service in services:
            score_data = RecommendationEngine.calculate_score(service)
            recommendations.append({
                'service': service,
                'score': score_data['score'],
                'explanation': score_data['explanation']
            })
        
        # Sort by score (descending)
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top N
        return recommendations[:limit]
    
    @staticmethod
    def get_provider_recommendations(limit=10):
        """
        Get recommended providers based on their services
        
        Returns:
            list: Recommended providers with scores
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        providers = User.objects.filter(role='SERVICE_PROVIDER')
        
        provider_scores = []
        for provider in providers:
            # Get all services for this provider
            services = provider.services.all()
            
            if not services:
                continue
            
            # Calculate average score across all services
            total_score = 0
            for service in services:
                score_data = RecommendationEngine.calculate_score(service)
                total_score += score_data['score']
            
            avg_score = total_score / len(services) if services else 0
            
            provider_scores.append({
                'provider': provider,
                'score': round(avg_score, 3),
                'service_count': len(services)
            })
        
        # Sort by score
        provider_scores.sort(key=lambda x: x['score'], reverse=True)
        
        return provider_scores[:limit]
