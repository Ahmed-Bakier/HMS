from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email required')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff',     True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role',         'super_admin')
        extra_fields.setdefault('first_name',   'Super')
        extra_fields.setdefault('last_name',    'Admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLES = [
        ('super_admin','Super Admin'), ('admin','Admin'),
        ('doctor','Doctor'),           ('nurse','Nurse'),
        ('receptionist','Receptionist'),('pharmacist','Pharmacist'),
        ('lab_tech','Lab Tech'),       ('billing_clerk','Billing Clerk'),
    ]
    employee_id = models.CharField(max_length=20, unique=True, blank=True)
    first_name  = models.CharField(max_length=100)
    last_name   = models.CharField(max_length=100)
    email       = models.EmailField(unique=True)
    phone       = models.CharField(max_length=20, blank=True)
    role        = models.CharField(max_length=30, choices=ROLES, default='nurse')
    department  = models.CharField(max_length=100, blank=True)
    status      = models.CharField(max_length=20, default='active')
    avatar_url  = models.URLField(blank=True)
    is_staff    = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login  = models.DateTimeField(null=True, blank=True)

    objects = UserManager()
    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.get_full_name()} ({self.role})'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'

    @property
    def is_admin(self):
        return self.role in ('super_admin', 'admin')

    def save(self, *args, **kwargs):
        if not self.employee_id:
            self.employee_id = f'EMP-{uuid.uuid4().hex[:6].upper()}'
        super().save(*args, **kwargs)