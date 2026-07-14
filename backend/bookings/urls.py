from django.urls import path
from .views import (
    BookingListCreateView,
    BookingDetailView,
    CustomerBookingsView,
    ProviderBookingsView,
    UpdateBookingStatusView
)

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking-list-create'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('customer/', CustomerBookingsView.as_view(), name='customer-bookings'),
    path('provider/', ProviderBookingsView.as_view(), name='provider-bookings'),
    path('<int:pk>/status/', UpdateBookingStatusView.as_view(), name='update-booking-status'),
]
