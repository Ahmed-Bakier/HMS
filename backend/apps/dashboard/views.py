from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, serializers
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from .models import Notification


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
        return Response([{'date': str(start + __import__('datetime').timedelta(days=i)), 'admissions': date_map.get(start + __import__('datetime').timedelta(days=i), 0)} for i in range(7)])


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id','type','title','body','is_read','created_at']


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})
