from django.urls import path
from .views import (
    ServiceCategoryListView,
    ServiceListCreateView,
    ServiceDetailView,
    ProviderServicesView
)

urlpatterns = [
    path('categories/', ServiceCategoryListView.as_view(), name='service-categories'),
    path('', ServiceListCreateView.as_view(), name='service-list-create'),
    path('<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('my-services/', ProviderServicesView.as_view(), name='provider-services'),
]
