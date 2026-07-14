from rest_framework import serializers
from .models import ProviderWallet, LedgerEntry, PaymentSubmission, WeeklySettlement, CommissionSetting

class LedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerEntry
        fields = '__all__'

class ProviderWalletSerializer(serializers.ModelSerializer):
    ledger_entries = LedgerEntrySerializer(many=True, read_only=True)
    provider_name = serializers.CharField(source='provider.full_name', read_only=True)
    net_earnings = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining_credit_limit = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    account_status = serializers.CharField(read_only=True)

    class Meta:
        model = ProviderWallet
        fields = [
            'id', 'provider', 'provider_name', 'total_earning',
            'total_commission', 'commission_balance', 'net_earnings',
            'remaining_credit_limit', 'account_status',
            'cash_collected_from_customers', 'amount_transferred_to_platform',
            'negative_limit_threshold', 'updated_at', 'ledger_entries'
        ]

class PaymentSubmissionSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.full_name', read_only=True)

    class Meta:
        model = PaymentSubmission
        fields = '__all__'
        read_only_fields = ['provider', 'status', 'admin_notes', 'created_at']
        extra_kwargs = {
            'provider': {'required': False},
            'status': {'required': False},
            'admin_notes': {'required': False},
            'created_at': {'required': False},
        }

class WeeklySettlementSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklySettlement
        fields = '__all__'

class CommissionSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionSetting
        fields = '__all__'
