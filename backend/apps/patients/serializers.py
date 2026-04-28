from rest_framework import serializers
from .models import Patient, Admission, Vital, MedicalHistory

class VitalSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)

    class Meta:
        model  = Vital
        fields = ['id','admission','recorded_by','recorded_by_name','blood_pressure','heart_rate','temperature','o2_saturation','resp_rate','recorded_at']
        read_only_fields = ['id','recorded_at']

class AdmissionSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)

    class Meta:
        model  = Admission
        fields = ['id','patient','doctor','doctor_name','ward','bed_number','diagnosis','status','admitted_at','discharged_at','notes']
        read_only_fields = ['id','admitted_at']

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = MedicalHistory
        fields = ['id','patient','type','description','noted_at','noted_by']

class PatientSerializer(serializers.ModelSerializer):
    full_name        = serializers.CharField(read_only=True)
    age              = serializers.IntegerField(read_only=True)
    active_admission = serializers.SerializerMethodField()

    class Meta:
        model  = Patient
        fields = ['id','patient_uid','full_name','age','first_name','last_name','date_of_birth','gender','blood_type','phone','email','address','insurance_no','insurance_prov','emergency_name','emergency_rel','emergency_ph','active_admission','created_at']
        read_only_fields = ['id','patient_uid','created_at']

    def get_active_admission(self, obj):
        admission = obj.admissions.filter(status='admitted').first()
        if admission:
            return {'id': admission.id, 'ward': admission.ward, 'bed_number': admission.bed_number, 'status': admission.status, 'admitted_at': admission.admitted_at}
        return None