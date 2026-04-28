from rest_framework import serializers
from .models import Doctor, Department
from apps.users.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    doctor_count = serializers.SerializerMethodField()

    class Meta:
        model  = Department
        fields = ['id','name','floor','phone','doctor_count','created_at']

    def get_doctor_count(self, obj):
        return obj.doctors.count()

class DoctorSerializer(serializers.ModelSerializer):
    user            = UserSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name       = serializers.CharField(read_only=True)

    class Meta:
        model  = Doctor
        fields = ['id','user','full_name','specialty','department','department_name','license_no','experience_yrs','rating','schedule','status','bio']

class DoctorWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Doctor
        fields = ['user','specialty','department','license_no','experience_yrs','schedule','status','bio']