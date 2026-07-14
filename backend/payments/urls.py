from django.urls import path
from .views import CreatePaymentView, PaymentDetailView, PaymentHistoryView

urlpatterns = [
    path('', CreatePaymentView.as_view(), name='create-payment'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),
    path('history/', PaymentHistoryView.as_view(), name='payment-history'),
]
