from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    MedicationViewSet, MedicationLogViewSet,
    TodayMedicationsView,
    RegisterView, LogoutView,
    UserProfileView,
    AdherenceStatsView,
    NotificationHistoryView,
)

router = DefaultRouter()
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'logs', MedicationLogViewSet, basename='log')

urlpatterns = [
    path('', include(router.urls)),

    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),

    # User Profile
    path('profile/', UserProfileView.as_view(), name='profile'),

    # Today's medications
    path('today-medications/', TodayMedicationsView.as_view(), name='today-medications'),

    # Adherence Stats
    path('stats/', AdherenceStatsView.as_view(), name='stats'),

    # Notification History
    path('notifications/history/', NotificationHistoryView.as_view(), name='notification-history'),
]
