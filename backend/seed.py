import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medicore.settings')
django.setup()

from apps.users.models   import User
from apps.doctors.models import Doctor, Department
from apps.patients.models import Patient

depts = [Department.objects.get_or_create(name=n)[0] for n in ['Cardiology','Neurology','Pediatrics','Orthopedics','Radiology','Surgery']]

if not User.objects.filter(email='admin@medicore.com').exists():
    User.objects.create_superuser(email='admin@medicore.com', password='Admin@123', first_name='Admin', last_name='Kumar')
    print('✅ Admin created')

for email, fn, ln, spec, di, lic, exp in [
    ('james.parker@medicore.com','James','Parker','Cardiologist',0,'LIC-JP001',12),
    ('priya.sharma@medicore.com','Priya','Sharma','Neurologist',1,'LIC-PS001',8),
    ('omar.hassan@medicore.com','Omar','Hassan','Pediatrician',2,'LIC-OH001',15),
]:
    if not User.objects.filter(email=email).exists():
        u = User.objects.create_user(email=email, password='Doctor@123', first_name=fn, last_name=ln, role='doctor')
        Doctor.objects.create(user=u, specialty=spec, department=depts[di], license_no=lic, experience_yrs=exp)
        print(f'✅ Dr. {fn} {ln}')

for fn, ln, dob, gender, blood, phone, email in [
    ('Sarah','Johnson','1985-03-15','female','A+','+1-555-0101','sarah.j@email.com'),
    ('Michael','Chen','1972-07-22','male','O-','+1-555-0102','mchen@email.com'),
    ('Emily','Rodriguez','1990-11-08','female','B+','+1-555-0103','emily.r@email.com'),
]:
    if not Patient.objects.filter(email=email).exists():
        Patient.objects.create(first_name=fn, last_name=ln, date_of_birth=dob, gender=gender, blood_type=blood, phone=phone, email=email)
        print(f'✅ Patient {fn} {ln}')

print('\n✅ Seed complete\nadmin@medicore.com / Admin@123\njames.parker@medicore.com / Doctor@123')