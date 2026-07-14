from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import ProviderWallet, LedgerEntry, CommissionSetting, PaymentSubmission
from bookings.models import Booking
from decimal import Decimal

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_provider_wallet(sender, instance, created, **kwargs):
    if created and instance.role == 'SERVICE_PROVIDER':
        config = CommissionSetting.objects.first()
        negative_limit = config.default_negative_limit if config else Decimal('-5000.00')
        ProviderWallet.objects.get_or_create(
            provider=instance,
            defaults={'negative_limit_threshold': negative_limit}
        )

@receiver(post_save, sender=Booking)
def handle_order_completion(sender, instance, created, **kwargs):
    """
    Triggered when a booking is COMPLETED.
    Creates 3 Ledger entries as per standard Double-Entry architecture:
    1. Credit: Full Order Amount (Provider Revenue)
    2. Debit: Platform Commission (Platform Fee)
    3. Debit: Cash Collection (The cash provider now holds)
    """
    if instance.status == 'COMPLETED':
        wallet, _ = ProviderWallet.objects.get_or_create(provider=instance.provider)
        
        config = CommissionSetting.objects.first()
        commission_percent = config.commission_percentage if config else Decimal('15.00')
        
        order_amount = instance.total_amount
        commission_amount = (order_amount * (commission_percent / Decimal('100'))).quantize(Decimal('0.01'))

        # Prevention check (using unique descriptions for this booking)
        base_desc = f"Booking #{instance.id}"
        if LedgerEntry.objects.filter(wallet=wallet, description__contains=base_desc).exists():
            return

        # 1. Credit: Full Revenue (Source of Truth for gross earnings)
        LedgerEntry.objects.create(
            wallet=wallet,
            transaction_type='ORDER_COMPLETED',
            credit=order_amount,
            running_balance=Decimal('0.00'),
            description=f"Gross Revenue from {base_desc}"
        )
        
        # 2. Debit: Commission (The 'debt' created for using the platform)
        LedgerEntry.objects.create(
            wallet=wallet,
            transaction_type='COMMISSION_DEDUCTED',
            debit=commission_amount,
            running_balance=Decimal('0.00'),
            description=f"Platform Commission fee for {base_desc} ({commission_percent}%)"
        )
        
        # 3. Debit: Cash Collection (Since provider handles cash, they 'took' the balance from system)
        LedgerEntry.objects.create(
            wallet=wallet,
            transaction_type='CASH_COLLECTED',
            debit=order_amount,
            running_balance=Decimal('0.00'),
            description=f"Cash Collected from Customer for {base_desc}"
        )
        
        # Synchronize cached totals
        wallet.recalculate_balance()

@receiver(post_save, sender=PaymentSubmission)
def handle_payment_approval(sender, instance, created, **kwargs):
    """
    Automatically updates the wallet when a PaymentSubmission is marked as APPROVED.
    This handles updates from API, Admin Actions, and manual Admin Save.
    """
    if instance.status == 'APPROVED':
        wallet, _ = ProviderWallet.objects.get_or_create(provider=instance.provider)
        
        # Check if ledger entry already exists for this transaction
        description = f"Manual Payment Approved: {instance.transaction_id}"
        if not LedgerEntry.objects.filter(wallet=wallet, description=description).exists():
            LedgerEntry.objects.create(
                wallet=wallet,
                transaction_type='MANUAL_PAYMENT',
                credit=instance.amount,
                running_balance=Decimal('0.00'), # Sync will fix this
                description=description
            )
            # Sync everything
            wallet.recalculate_balance()
