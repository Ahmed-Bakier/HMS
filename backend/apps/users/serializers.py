from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['id','email','first_name','last_name','role','department','phone','password','password2']

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id','employee_id','full_name','first_name','last_name','email','phone','role','department','status','avatar_url','date_joined']
        read_only_fields = ['id','employee_id','date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name()

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['first_name','last_name','phone','department','avatar_url','status']

class MediCoreTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data