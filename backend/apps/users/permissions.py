from rest_framework.permissions import BasePermission

ADMIN_ROLES   = ('super_admin', 'admin')
MEDICAL_ROLES = ('super_admin', 'admin', 'doctor', 'nurse')

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'super_admin'

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ADMIN_ROLES

class IsAdminOrDoctor(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.role in ('super_admin', 'admin', 'doctor')

class IsMedicalStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in MEDICAL_ROLES

class IsPharmacist(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('super_admin', 'admin', 'pharmacist')

class IsBillingClerk(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('super_admin', 'admin', 'billing_clerk')

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role in ADMIN_ROLES or obj == request.user