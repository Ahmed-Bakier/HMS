import random
from django.db import models
from django.conf import settings

class Patient(models.Model):
    GENDER_CHOICES = [('male','Male'),('female','Female'),('other','Other')]
    BLOOD_TYPES    = [('A+','A+'),('A-','A-'),('B+','B+'),('B-','B-'),('AB+','AB+'),('AB-','AB-'),('O+','O+'),('O-','O-')]

    patient_uid    = models.CharField(max_length=20, unique=True, blank=True)
    first_name     = models.CharField(max_length=100)
    last_name      = models.CharField(max_length=100)
    date_of_birth  = models.DateField()
    gender         = models.CharField(max_length=10, choices=GENDER_CHOICES)
    blood_type     = models.CharField(max_length=5,  choices=BLOOD_TYPES, blank=True)
    phone          = models.CharField(max_length=20, blank=True)
    email          = models.EmailField(blank=True)
    address        = models.TextField(blank=True)
    insurance_no   = models.CharField(max_length=100, blank=True)
    insurance_prov = models.CharField(max_length=150, blank=True)
    emergency_name = models.CharField(max_length=200, blank=True)
    emergency_rel  = models.CharField(max_length=100, blank=True)
    emergency_ph   = models.CharField(max_length=20,  blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'patients'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.patient_uid} — {self.first_name} {self.last_name}'

    def save(self, *args, **kwargs):
        if not self.patient_uid:
            uid = f'#P-{random.randint(1000,9999)}'
            while Patient.objects.filter(patient_uid=uid).exists():
                uid = f'#P-{random.randint(1000,9999)}'
            self.patient_uid = uid
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'

    @property
    def age(self):
        from django.utils import timezone
        today = timezone.now().date()
        dob   = self.date_of_birth
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

class Admission(models.Model):
    STATUS_CHOICES = [('admitted','Admitted'),('discharged','Discharged'),('transferred','Transferred'),('critical','Critical')]

    patient       = models.ForeignKey(Patient,          on_delete=models.CASCADE, related_name='admissions')
    doctor        = models.ForeignKey('doctors.Doctor', on_delete=models.PROTECT, related_name='admissions')
    ward          = models.CharField(max_length=100, blank=True)
    bed_number    = models.CharField(max_length=20,  blank=True)
    diagnosis     = models.TextField(blank=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='admitted')
    admitted_at   = models.DateTimeField(auto_now_add=True)
    discharged_at = models.DateTimeField(null=True, blank=True)
    notes         = models.TextField(blank=True)

    class Meta:
        db_table = 'admissions'
        ordering = ['-admitted_at']

class Vital(models.Model):
    admission      = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='vitals')
    recorded_by    = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='recorded_vitals')
    blood_pressure = models.CharField(max_length=20, blank=True)
    heart_rate     = models.IntegerField(null=True, blank=True)
    temperature    = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    o2_saturation  = models.IntegerField(null=True, blank=True)
    resp_rate      = models.IntegerField(null=True, blank=True)
    recorded_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vitals'
        ordering = ['-recorded_at']

class MedicalHistory(models.Model):
    TYPE_CHOICES = [('condition','Condition'),('allergy','Allergy'),('surgery','Surgery'),('family_history','Family History')]

    patient     = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_history')
    type        = models.CharField(max_length=30, choices=TYPE_CHOICES)
    description = models.TextField()
    noted_at    = models.DateField(null=True, blank=True)
    noted_by    = models.ForeignKey('doctors.Doctor', null=True, blank=True, on_delete=models.SET_NULL, related_name='noted_histories')

    class Meta:
        db_table = 'medical_history'
        ordering = ['-noted_at']