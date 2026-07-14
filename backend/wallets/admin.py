from django.contrib import admin
from .models import ProviderWallet, LedgerEntry, PaymentSubmission, WeeklySettlement, CommissionSetting

@admin.register(ProviderWallet)
class ProviderWalletAdmin(admin.ModelAdmin):
    list_display = ['provider', 'commission_balance', 'account_status', 'is_manually_restricted', 'updated_at']
    search_fields = ['provider__email', 'provider__full_name']
    list_filter = ['is_manually_restricted', 'updated_at']
    readonly_fields = [
        'total_earning', 'total_commission', 
        'commission_balance', 'cash_collected_from_customers', 
        'amount_transferred_to_platform'
    ]
    actions = ['manual_restrict', 'manual_unrestrict']

    def manual_restrict(self, request, queryset):
        queryset.update(is_manually_restricted=True)
    manual_restrict.short_description = "Manually Restrict selected wallets"

    def manual_unrestrict(self, request, queryset):
        queryset.update(is_manually_restricted=False)
    manual_unrestrict.short_description = "Remove manual restriction"

@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'transaction_type', 'debit', 'credit', 'timestamp']
    list_filter = ['transaction_type', 'timestamp']
    search_fields = ['wallet__provider__email']

@admin.register(PaymentSubmission)
class PaymentSubmissionAdmin(admin.ModelAdmin):
    list_display = ['provider', 'amount', 'transaction_id', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['provider__email', 'transaction_id']
    actions = ['approve_payments', 'reject_payments']

    def approve_payments(self, request, queryset):
        for submission in queryset.filter(status='PENDING'):
            # This logic should ideally be in a service layer or viewset method reused here
            # For simplicity in admin, we call the same logic
            submission.status = 'APPROVED'
            submission.save()
            
            wallet, _ = ProviderWallet.objects.get_or_create(provider=submission.provider)
            
            # Create Ledger Entry FIRST
            from decimal import Decimal
            LedgerEntry.objects.create(
                wallet=wallet,
                transaction_type='MANUAL_PAYMENT',
                credit=submission.amount,
                running_balance=Decimal('0.00'), # Sync will fix this
                description=f"Admin Approved Payment: {submission.transaction_id}"
            )
            
            # Sync everything
            wallet.recalculate_balance()
    approve_payments.short_description = "Approve selected payments"

    def reject_payments(self, request, queryset):
        queryset.filter(status='PENDING').update(status='REJECTED')
    reject_payments.short_description = "Reject selected payments"

@admin.register(WeeklySettlement)
class WeeklySettlementAdmin(admin.ModelAdmin):
    list_display = ['provider', 'start_date', 'end_date', 'net_payable', 'created_at']
    list_filter = ['created_at']

@admin.register(CommissionSetting)
class CommissionSettingAdmin(admin.ModelAdmin):
    list_display = ['commission_percentage', 'default_negative_limit', 'updated_at']

    def has_add_permission(self, request):
        return not CommissionSetting.objects.exists()
