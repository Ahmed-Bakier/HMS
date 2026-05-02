from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views        import UserViewSet, MediCoreLoginView
from apps.doctors.views      import DoctorViewSet, DepartmentViewSet
from apps.patients.views     import PatientViewSet
from apps.appointments.views import AppointmentViewSet
from apps.pharmacy.models    import InventoryViewSet
from apps.billing.models     import InvoiceViewSet
from apps.dashboard.views    import NotificationViewSet

router = DefaultRouter()
router.register('users',        UserViewSet,        basename='users')
router.register('doctors',      DoctorViewSet,      basename='doctors')
router.register('departments',  DepartmentViewSet,  basename='departments')
router.register('patients',     PatientViewSet,     basename='patients')
router.register('appointments', AppointmentViewSet, basename='appointments')
router.register('inventory',    InventoryViewSet,   basename='inventory')
router.register('invoices',     InvoiceViewSet,     basename='invoices')
router.register('notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/login/',   MediCoreLoginView.as_view(), name='token_obtain'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(),  name='token_refresh'),
    path('api/v1/auth/',         include('apps.users.urls')),
    path('api/v1/',              include(router.urls)),
    path('api/v1/dashboard/',    include('apps.dashboard.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
