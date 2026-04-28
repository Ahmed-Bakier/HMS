from django.db import models
from django.conf import settings

class Department(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    head_doctor = models.ForeignKey('Doctor', null=True, blank=True, on_delete=models.SET_NULL, related_name='headed_departments')
    floor       = models.CharField(max_length=50, blank=True)
    phone       = models.CharField(max_length=20, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'departments'
        ordering = ['name']

    def __str__(self):
        return self.name

class Doctor(models.Model):
    STATUS_CHOICES = [
        ('available','Available'), ('in_surgery','In Surgery'),
        ('on_break','On Break'),   ('off_duty','Off Duty'),
    ]
    user           = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    specialty      = models.CharField(max_length=150)
    department     = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL, related_name='doctors')
    license_no     = models.CharField(max_length=100, unique=True)
    experience_yrs = models.IntegerField(default=0)
    rating         = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    schedule       = models.CharField(max_length=100, blank=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    bio            = models.TextField(blank=True)

    class Meta:
        db_table = 'doctors'
        ordering = ['user__first_name']

    def __str__(self):
        return f'Dr. {self.user.get_full_name()} — {self.specialty}'

    @property
    def full_name(self):
        return f'Dr. {self.user.get_full_name()}'