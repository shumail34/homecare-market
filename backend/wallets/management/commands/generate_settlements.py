from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from bookings.models import Booking
from wallets.models import ProviderWallet, WeeklySettlement, CommissionSetting
from django.db.models import Sum, Count
from decimal import Decimal

class Command(BaseCommand):
    help = 'Generates weekly settlements for all providers'

    def handle(self, *args, **options):
        self.stdout.write("Starting weekly settlement generation...")
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)
        
        providers = User.objects.filter(role='SERVICE_PROVIDER')
        config = CommissionSetting.objects.first()
        commission_percent = config.commission_percentage if config else Decimal('10.00')

        count = 0
        for provider in providers:
            # Aggregate booking data for the last 7 days
            stats = Booking.objects.filter(
                provider=provider,
                status='COMPLETED',
                updated_at__date__range=[start_date, end_date]
            ).aggregate(
                total_orders=Count('id'),
                total_amount=Sum('total_amount')
            )

            if stats['total_orders'] == 0:
                continue

            total_amount = stats['total_amount'] or Decimal('0.00')
            commission_amount = (total_amount * commission_percent) / 100
            net_payable = total_amount - commission_amount

            # Create settlement record
            WeeklySettlement.objects.create(
                provider=provider,
                start_date=start_date,
                end_date=end_date,
                total_orders=stats['total_orders'],
                total_order_amount=total_amount,
                total_commission=commission_amount,
                total_collected_cash=total_amount, # Assuming all was collected in cash
                net_payable=net_payable
            )
            count += 1
            self.stdout.write(f"Generated settlement for {provider.email}")

        self.stdout.write(self.style.SUCCESS(f"Successfully generated {count} settlements."))
