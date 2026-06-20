from datetime import date

from distributions.models import DistributionRecord
from funders.models import ProcurementOrder

from .models import ImpactReport


def generate_national_report(period_start: date, period_end: date) -> ImpactReport:
    """Recomputes and stores a national-scope snapshot. Call from a
    scheduled task (e.g. weekly) or on-demand from the Admin console."""
    records = DistributionRecord.objects.filter(
        verification_status="verified", timestamp__date__range=(period_start, period_end)
    )
    pads = sum(r.quantity for r in records)
    schools = records.exclude(school__isnull=True).values("school").distinct().count()
    contributions = ProcurementOrder.objects.filter(
        status="completed", completed_at__date__range=(period_start, period_end)
    )
    total_contribution = sum(o.total_amount for o in contributions)

    # girls_reached_estimate: simple proxy = pads distributed / avg pads per girl per cycle
    # (refine with real survey data as it becomes available)
    girls_reached = round(pads / 6) if pads else 0
    cost_per_girl = round(total_contribution / girls_reached, 2) if girls_reached else None

    return ImpactReport.objects.create(
        scope=ImpactReport.Scope.NATIONAL,
        scope_reference="national",
        period_start=period_start,
        period_end=period_end,
        girls_reached_estimate=girls_reached,
        pads_distributed_count=pads,
        schools_covered_count=schools,
        total_funder_contribution=total_contribution,
        cost_per_girl=cost_per_girl,
    )
