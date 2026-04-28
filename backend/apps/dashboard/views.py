from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.patients.models import Patient, Admission
        from apps.doctors.models import Doctor
        from apps.billing.models import Invoice
        today = timezone.now().date()
        return Response({
            'total_patients':    Patient.objects.count(),
            'new_today':         Patient.objects.filter(created_at__date=today).count(),
            'total_beds':        120,
            'occupied_beds':     Admission.objects.filter(status='admitted').count(),
            'available_beds':    120 - Admission.objects.filter(status='admitted').count(),
            'critical_patients': Admission.objects.filter(status='critical').count(),
            'doctors_on_duty':   Doctor.objects.filter(status='available').count(),
            'total_doctors':     Doctor.objects.count(),
            'admissions_today':  Admission.objects.filter(admitted_at__date=today).count(),
            'discharges_today':  Admission.objects.filter(discharged_at__date=today, status='discharged').count(),
            'revenue_today':     Invoice.objects.filter(status='paid', paid_at__date=today).aggregate(t=Sum('amount'))['t'] or 0,
            'pending_invoices':  Invoice.objects.filter(status='pending').count(),
        })

class DashboardAdmissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.patients.models import Admission
        from datetime import timedelta
        today = timezone.now().date()
        start = today - timedelta(days=6)
        data  = (
            Admission.objects
            .filter(admitted_at__date__gte=start)
            .annotate(date=TruncDate('admitted_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        date_map = {row['date']: row['count'] for row in data}
        return Response([{'date': str(start + timedelta(days=i)), 'admissions': date_map.get(start + timedelta(days=i), 0)} for i in range(7)])