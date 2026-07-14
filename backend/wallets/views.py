from rest_framework import viewsets, permissions, status, decorators, parsers
from rest_framework.response import Response
from .models import ProviderWallet, LedgerEntry, PaymentSubmission, WeeklySettlement, CommissionSetting
from .serializers import (
    ProviderWalletSerializer, LedgerEntrySerializer, 
    PaymentSubmissionSerializer, WeeklySettlementSerializer, 
    CommissionSettingSerializer
)
from django.shortcuts import get_object_or_404
from decimal import Decimal

class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProviderWalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return ProviderWallet.objects.all()
        return ProviderWallet.objects.filter(provider=self.request.user)

class PaymentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return PaymentSubmission.objects.all()
        return PaymentSubmission.objects.filter(provider=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"\n[!!!] PAYMENT SUBMISSION ERROR: {serializer.errors}\n")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # On Web, blobs might not have a proper filename, DRF needs a name for ImageField
        screenshot = self.request.FILES.get('screenshot')
        if screenshot and not hasattr(screenshot, 'name'):
            screenshot.name = 'submission.jpg'
        serializer.save(provider=self.request.user)

    @decorators.action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        from django.db import transaction
        
        with transaction.atomic():
            submission = self.get_object()
            if submission.status != 'PENDING':
                return Response({'error': 'Submission is already processed'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update submission
            submission.status = 'APPROVED'
            submission.admin_notes = request.data.get('admin_notes', '')
            submission.save()

            # Update Wallet with select_for_update to handle concurrency
            wallet, created = ProviderWallet.objects.select_for_update().get_or_create(provider=submission.provider)
            
            # Create Ledger Entry FIRST
            LedgerEntry.objects.create(
                wallet=wallet,
                transaction_type='MANUAL_PAYMENT',
                credit=submission.amount,
                running_balance=Decimal('0.00'), # Will be fixed by recalculate_balance below
                description=f"Manual Payment Approved: {submission.transaction_id}"
            )

            # Sync everything from source (Submissions + Ledger)
            wallet.recalculate_balance()

        return Response({'status': 'Payment approved and wallet updated'})

    @decorators.action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        submission = self.get_object()
        if submission.status != 'PENDING':
            return Response({'error': 'Submission is already processed'}, status=status.HTTP_400_BAD_REQUEST)
        
        submission.status = 'REJECTED'
        submission.admin_notes = request.data.get('admin_notes', '')
        submission.save()
        return Response({'status': 'Payment rejected'})

class CommissionSettingViewSet(viewsets.ModelViewSet):
    queryset = CommissionSetting.objects.all()
    serializer_class = CommissionSettingSerializer
    permission_classes = [permissions.IsAdminUser]

    def list(self, request, *args, **kwargs):
        # Always return the first setting or create default
        instance, created = CommissionSetting.objects.get_or_create(pk=1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
