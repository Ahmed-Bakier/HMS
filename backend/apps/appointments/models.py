import random
from django.db import models

class Appointment(models.Model):
    TYPE_CHOICES   = [('consultation','Consultation'),('follow_up','Follow-up'),('check_up','Check-up'),('procedure','Procedure'),('imaging','Imaging'),('post_op','Post-Op'),('emergency','Emergency')]
    STATUS_CHOICES = [('confirmed','Confirmed'),('pending','Pending'),('in_progress','In Progress'),('completed','Completed'),('cancelled','Cancelled')]

    appt_uid     = models.CharField(max_length=20, unique=True, blank=True)
    patient      = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='patient_appointments')
    doctor       = models.ForeignKey('doctors.Doctor',   on_delete=models.PROTECT,  related_name='doctor_appointments')
    appt_date    = models.DateField()
    appt_time    = models.TimeField()
    type         = models.CharField(max_length=20, choices=TYPE_CHOICES, default='consultation')
    duration_min = models.IntegerField(default=30)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes        = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['-appt_date','-appt_time']

    def save(self, *args, **kwargs):
        if not self.appt_uid:
            uid = f'#AP-{random.randint(100,999)}'
            while Appointment.objects.filter(appt_uid=uid).exists():
                uid = f'#AP-{random.randint(100,999)}'
            self.appt_uid = uid
        super().save(*args, **kwargs)

class Prescription(models.Model):
    STATUS_CHOICES = [('active','Active'),('completed','Completed'),('stopped','Stopped')]

    patient    = models.ForeignKey('patients.Patient',   on_delete=models.CASCADE, related_name='prescriptions')
    doctor     = models.ForeignKey('doctors.Doctor',     on_delete=models.PROTECT,  related_name='prescriptions')
    admission  = models.ForeignKey('patients.Admission', null=True, blank=True, on_delete=models.SET_NULL)
    drug_name  = models.CharField(max_length=200)
    dosage     = models.CharField(max_length=100, blank=True)
    frequency  = models.CharField(max_length=100, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date   = models.DateField(null=True, blank=True)
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prescriptions'
        ordering = ['-created_at']