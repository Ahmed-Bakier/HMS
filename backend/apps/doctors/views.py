from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Doctor, Department
from .serializers import DoctorSerializer, DoctorWriteSerializer, DepartmentSerializer
from apps.users.permissions import IsAdminUser, IsAdminOrDoctor

class DoctorViewSet(viewsets.ModelViewSet):
    queryset         = Doctor.objects.select_related('user','department').all()
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status','department','specialty']
    search_fields    = ['user__first_name','user__last_name','specialty','license_no']
    ordering_fields  = ['experience_yrs','rating']

    def get_serializer_class(self):
        if self.action in ('create','update','partial_update'):
            return DoctorWriteSerializer
        return DoctorSerializer

    def get_permissions(self):
        if self.action in ('create','update','partial_update','destroy'):
            return [IsAdminUser()]
        return [IsAdminOrDoctor()]

    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        from apps.appointments.models import Appointment
        from apps.appointments.serializers import AppointmentSerializer
        from django.utils import timezone
        doctor = self.get_object()
        appts  = Appointment.objects.filter(doctor=doctor, appt_date=timezone.now().date()).order_by('appt_time')
        return Response(AppointmentSerializer(appts, many=True).data)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset           = Department.objects.all()
    serializer_class   = DepartmentSerializer
    permission_classes = [IsAdminUser]