from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone
import uuid

class ProviderWallet(models.Model):
    provider = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet',
        limit_choices_to={'role': 'SERVICE_PROVIDER'}
    )
    # Total Gross Revenue (Before any deductions)
    total_earning = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    # Cumulative sum of all 15% deductions
    total_commission = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    # The actual amount due to platform (Negative = Due, Positive = Credit)
    commission_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Internal cached fields for legacy compatibility or breakdown
    cash_collected_from_customers = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_transferred_to_platform = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    negative_limit_threshold = models.DecimalField(max_digits=12, decimal_places=2, default=-10000.00)
    is_manually_restricted = models.BooleanField(default=False)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet for {self.provider.full_name}"

    @property
    def net_earnings(self):
        """Total Earning - Total Commission (What the provider effectively kept)"""
        return self.total_earning - self.total_commission

    @property
    def remaining_credit_limit(self):
        """10000 + commission_balance"""
        return abs(self.negative_limit_threshold) + self.commission_balance

    @property
    def account_status(self):
        if self.is_manually_restricted:
            return "Restricted (Manual)"
        if self.commission_balance <= self.negative_limit_threshold:
            return "Restricted (Commission Limit)"
        return "Active"

    def recalculate_balance(self):
        from django.db.models import Sum
        
        # 1. Commission Balance from Ledger
        ledger_totals = self.ledger_entries.aggregate(
            total_credit=Sum('credit'),
            total_debit=Sum('debit')
        )
        active_credits = ledger_totals['total_credit'] or 0
        active_debits = ledger_totals['total_debit'] or 0
        self.commission_balance = active_credits - active_debits

        # 2. Total Earnings (Gross from ORDER_COMPLETED credits)
        self.total_earning = self.ledger_entries.filter(
            transaction_type='ORDER_COMPLETED'
        ).aggregate(Sum('credit'))['credit__sum'] or 0

        # 3. Total Commission (Deducted debits)
        self.total_commission = self.ledger_entries.filter(
            transaction_type='COMMISSION_DEDUCTED'
        ).aggregate(Sum('debit'))['debit__sum'] or 0

        # 4. Total Paid (Manual Payments)
        self.amount_transferred_to_platform = self.ledger_entries.filter(
            transaction_type='MANUAL_PAYMENT'
        ).aggregate(Sum('credit'))['credit__sum'] or 0
        
        # 5. Cash Collected
        self.cash_collected_from_customers = self.ledger_entries.filter(
            transaction_type='CASH_COLLECTED'
        ).aggregate(Sum('debit'))['debit__sum'] or 0

        self.save()

class LedgerEntry(models.Model):
    TRANSACTION_TYPES = [
        ('ORDER_COMPLETED', 'Order Completed'),
        ('COMMISSION_DEDUCTED', 'Commission Deducted'),
        ('CASH_COLLECTED', 'Cash Collected'),
        ('MANUAL_PAYMENT', 'Manual Payment'),
        ('ADJUSTMENT', 'Adjustment'),
    ]
    
    wallet = models.ForeignKey(ProviderWallet, on_delete=models.CASCADE, related_name='ledger_entries')
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    running_balance = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.transaction_type} - {self.wallet.provider.email}"

class PaymentSubmission(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_submissions'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(1)])
    screenshot = models.ImageField(upload_to='payment_proofs/')
    transaction_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.transaction_id} by {self.provider.email}"

class WeeklySettlement(models.Model):
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='weekly_settlements'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    total_orders = models.IntegerField()
    total_order_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_commission = models.DecimalField(max_digits=12, decimal_places=2)
    total_collected_cash = models.DecimalField(max_digits=12, decimal_places=2)
    net_payable = models.DecimalField(max_digits=12, decimal_places=2)
    report_pdf = models.FileField(upload_to='settlements/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Settlement {self.start_date} to {self.end_date} - {self.provider.email}"

class CommissionSetting(models.Model):
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    default_negative_limit = models.DecimalField(max_digits=12, decimal_places=2, default=-10000.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Commission: {self.commission_percentage}% | Limit: {self.default_negative_limit}"
    
    class Meta:
        verbose_name_plural = "Commission Settings"
