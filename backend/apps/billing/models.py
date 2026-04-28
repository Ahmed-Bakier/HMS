import random
from django.db import models
from django.utils import timezone
from rest_framework import viewsets, filters, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from apps.users.permissions import IsBillingClerk

class Invoice(models.Model):
    STATUS_CHOICES = [('paid','Paid'),('pending','Pending'),('overdue','Overdue'),('cancelled','Cancelled')]

    invoice_uid = models.CharField(max_length=20, unique=True, blank=True)
    patient     = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='invoices')
    doctor      = models.ForeignKey('doctors.Doctor', null=True, blank=True, on_delete=models.SET_NULL, related_name='invoices')
    service     = models.CharField(max_length=200, blank=True)
    amount      = models.DecimalField(max_digits=10, decimal_places=2)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    issued_at   = models.DateTimeField(auto_now_add=True)
    paid_at     = models.DateTimeField(null=True, blank=True)
    notes       = models.TextField(blank=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-issued_at']

    def save(self, *args, **kwargs):
        if not self.invoice_uid:
            self.invoice_uid = f'INV-{random.randint(1000,9999)}'
        super().save(*args, **kwargs)

class InvoiceSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name  = serializers.CharField(source='doctor.full_name',  read_only=True)

    class Meta:
        model  = Invoice
        fields = ['id','invoice_uid','patient','patient_name','doctor','doctor_name','service','amount','status','issued_at','paid_at','notes']
        read_only_fields = ['id','invoice_uid','issued_at']

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset           = Invoice.objects.select_related('patient','doctor').all()
    serializer_class   = InvoiceSerializer
    permission_classes = [IsBillingClerk]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['status','patient']
    search_fields      = ['invoice_uid','patient__first_name','patient__last_name']
    ordering_fields    = ['issued_at','amount']

    @action(detail=True, methods=['patch'])
    def pay(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == 'paid':
            return Response({'error': 'Already paid.'}, status=status.HTTP_400_BAD_REQUEST)
        invoice.status  = 'paid'
        invoice.paid_at = timezone.now()
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        today = timezone.now().date()
        paid  = Invoice.objects.filter(status='paid')
        def total(qs): return qs.aggregate(t=Sum('amount'))['t'] or 0
        return Response({
            'today':   total(paid.filter(paid_at__date=today)),
            'month':   total(paid.filter(paid_at__month=today.month, paid_at__year=today.year)),
            'pending': Invoice.objects.filter(status='pending').count(),
            'overdue': Invoice.objects.filter(status='overdue').count(),
        })