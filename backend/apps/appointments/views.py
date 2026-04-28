from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Appointment
from .serializers import AppointmentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset           = Appointment.objects.select_related('patient','doctor').all()
    serializer_class   = AppointmentSerializer
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['status','type','doctor','appt_date']
    search_fields      = ['patient__first_name','patient__last_name','appt_uid']
    ordering_fields    = ['appt_date','appt_time']

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        appt   = self.get_object()
        new_st = request.data.get('status')
        valid  = [c[0] for c in Appointment.STATUS_CHOICES]
        if new_st not in valid:
            return Response({'error': f'Valid choices: {valid}'}, status=400)
        appt.status = new_st
        appt.save()
        return Response(AppointmentSerializer(appt).data)