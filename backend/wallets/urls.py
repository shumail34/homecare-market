from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalletViewSet, PaymentSubmissionViewSet, CommissionSettingViewSet

router = DefaultRouter()
router.register(r'wallet', WalletViewSet, basename='wallet')
router.register(r'payments', PaymentSubmissionViewSet, basename='wallet-payments')
router.register(r'settings', CommissionSettingViewSet, basename='wallet-settings')

urlpatterns = [
    path('', include(router.urls)),
]
