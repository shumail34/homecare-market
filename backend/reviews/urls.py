from django.urls import path
from .views import ReviewListCreateView, ServiceReviewsView, ProviderReviewsView

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list-create'),
    path('service/<int:service_id>/', ServiceReviewsView.as_view(), name='service-reviews'),
    path('provider/<uuid:provider_id>/', ProviderReviewsView.as_view(), name='provider-reviews'),
]
