from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Patient, Admission, Vital, MedicalHistory
from .serializers import PatientSerializer, AdmissionSerializer, VitalSerializer, MedicalHistorySerializer
from apps.users.permissions import IsMedicalStaff, IsAdminOrDoctor

class PatientViewSet(viewsets.ModelViewSet):
    queryset           = Patient.objects.prefetch_related('admissions').all()
    serializer_class   = PatientSerializer
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['gender','blood_type']
    search_fields      = ['first_name','last_name','patient_uid','phone','email']
    ordering_fields    = ['created_at','last_name']

    def get_permissions(self):
        if self.action in ('create','update','partial_update','destroy'):
            return [IsAdminOrDoctor()]
        return [IsMedicalStaff()]

    @action(detail=True, methods=['get','post'])
    def vitals(self, request, pk=None):
        patient = self.get_object()
        if request.method == 'GET':
            admissions = Admission.objects.filter(patient=patient)
            vitals     = Vital.objects.filter(admission__in=admissions).order_by('-recorded_at')[:20]
            return Response(VitalSerializer(vitals, many=True).data)
        admission = Admission.objects.filter(patient=patient, status='admitted').first()
        if not admission:
            return Response({'error': 'No active admission.'}, status=status.HTTP_400_BAD_REQUEST)
        data = {**request.data, 'admission': admission.id, 'recorded_by': request.user.id}
        serializer = VitalSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def prescriptions(self, request, pk=None):
        from apps.appointments.models import Prescription
        from apps.appointments.serializers import PrescriptionSerializer
        return Response(PrescriptionSerializer(Prescription.objects.filter(patient_id=pk), many=True).data)

    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        from apps.appointments.models import Appointment
        from apps.appointments.serializers import AppointmentSerializer
        return Response(AppointmentSerializer(Appointment.objects.filter(patient_id=pk).order_by('-appt_date'), many=True).data)

    @action(detail=True, methods=['get'])
    def invoices(self, request, pk=None):
        from apps.billing.models import Invoice, InvoiceSerializer
        return Response(InvoiceSerializer(Invoice.objects.filter(patient_id=pk), many=True).data)

    @action(detail=True, methods=['post'])
    def discharge(self, request, pk=None):
        patient   = self.get_object()
        admission = Admission.objects.filter(patient=patient, status='admitted').first()
        if not admission:
            return Response({'error': 'No active admission.'}, status=status.HTTP_400_BAD_REQUEST)
        admission.status        = 'discharged'
        admission.discharged_at = timezone.now()
        admission.notes         = request.data.get('notes', admission.notes)
        admission.save()
        return Response({'message': 'Patient discharged.'})

    @action(detail=True, methods=['get','post'], url_path='history')
    def medical_history(self, request, pk=None):
        patient = self.get_object()
        if request.method == 'GET':
            return Response(MedicalHistorySerializer(MedicalHistory.objects.filter(patient=patient), many=True).data)
        serializer = MedicalHistorySerializer(data={**request.data, 'patient': patient.id})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)