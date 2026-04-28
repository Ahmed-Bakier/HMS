from rest_framework import serializers
from .models import Appointment, Prescription

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name  = serializers.CharField(source='doctor.full_name',  read_only=True)

    class Meta:
        model  = Appointment
        fields = ['id','appt_uid','patient','patient_name','doctor','doctor_name','appt_date','appt_time','type','duration_min','status','notes','created_at']
        read_only_fields = ['id','appt_uid','created_at']

class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name  = serializers.CharField(source='doctor.full_name',  read_only=True)

    class Meta:
        model  = Prescription
        fields = ['id','patient','patient_name','doctor','doctor_name','admission','drug_name','dosage','frequency','start_date','end_date','status','notes','created_at']
        read_only_fields = ['id','created_at']