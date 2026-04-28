from django.urls import path
from .views import DashboardStatsView, DashboardAdmissionsView

urlpatterns = [
    path('stats/',      DashboardStatsView.as_view(),      name='dashboard_stats'),
    path('admissions/', DashboardAdmissionsView.as_view(), name='dashboard_admissions'),
]