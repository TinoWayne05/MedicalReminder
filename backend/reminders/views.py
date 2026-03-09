from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Count, Q
from django.core.mail import send_mail
from django.conf import settings as django_settings

from .models import Medication, MedicationLog, UserProfile, NotificationHistory
from .serializers import (
    MedicationSerializer, MedicationLogSerializer,
    UserRegistrationSerializer, UserProfileSerializer,
    NotificationHistorySerializer,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _alert_kin_if_needed(user):
    """
    If the user has missed > MISSED_DOSE_ALERT_THRESHOLD doses in total,
    send a WhatsApp alert to their emergency contact via Twilio.
    Only sends once per 'crossing' (multiples of threshold).
    """
    threshold = getattr(django_settings, 'MISSED_DOSE_ALERT_THRESHOLD', 3)
    missed_count = MedicationLog.objects.filter(
        medication__user=user, status='missed'
    ).count()

    # Alert on every multiple of the threshold (3, 6, 9 …)
    if missed_count > 0 and missed_count % threshold == 0:
        try:
            profile = UserProfile.objects.get(user=user)
            kin_phone = profile.emergency_contact_phone
            kin_name  = profile.emergency_contact_name

            if not kin_phone:
                return

            # Format the number for WhatsApp (needs country code, defaulting to +44 if not present/simplistic)
            # In a real app you'd validate this forcefully on the frontend.
            if not kin_phone.startswith('+'):
                # Assuming UK for example purposes if no + is found, but normally you mandate + in the form.
                # Since we don't know the region, we'll try to send it as-is and let Twilio handle formatting if it can,
                # or just fail gracefully if the number is invalid.
                kin_phone = f"+{kin_phone.lstrip('0')}"

            # Twilio WhatsApp numbers require a 'whatsapp:' prefix
            to_number = f"whatsapp:{kin_phone}"
            
            # Use configured sender or a fallback demo number
            from_number = getattr(django_settings, 'TWILIO_WHATSAPP_NUMBER', '')
            if not from_number:
                # If no environment variable is set, just print to console for dev testing
                print(f"--- WHATSAPP ALERT (Dev Mode) ---")
                print(f"To: {kin_name} ({kin_phone})")
                print(f"Msg: ⚠️ MedReminder Alert: Patient {user.first_name or user.username} has missed {missed_count} medication doses. Please check in with them regarding their schedule.")
                print(f"-----------------------------------")
                return

            if not from_number.startswith('whatsapp:'):
                from_number = f"whatsapp:{from_number}"

            sid = getattr(django_settings, 'TWILIO_ACCOUNT_SID', '')
            token = getattr(django_settings, 'TWILIO_AUTH_TOKEN', '')

            if sid and token:
                from twilio.rest import Client
                client = Client(sid, token)
                
                message = (
                    f"⚠️ *MedReminder Alert*\n\n"
                    f"Hi {kin_name or 'there'},\n"
                    f"Patient *{user.get_full_name() or user.username}* has missed {missed_count} medication doses.\n\n"
                    f"Please check in with them regarding their schedule."
                )
                
                client.messages.create(
                    body=message,
                    from_=from_number,
                    to=to_number
                )
                
        except UserProfile.DoesNotExist:
            pass
        except Exception as e:
            print(f"Failed to send WhatsApp alert: {e}")

# ── Auth Views ────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Account created successfully.',
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'email': user.email,
                    'username': user.username,
                },
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ── Profile Views ─────────────────────────────────────────────────────────────

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user = request.user
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                user.last_name = request.data['last_name']
            user.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Medication Views ──────────────────────────────────────────────────────────

class MedicationViewSet(viewsets.ModelViewSet):
    serializer_class   = MedicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(user=self.request.user).order_by('reminder_time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TodayMedicationsView(generics.ListAPIView):
    serializer_class   = MedicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        today = timezone.localtime().date()
        return Medication.objects.filter(
            user=self.request.user,
            start_date__lte=today,
            is_active=True,
        ).exclude(end_date__lt=today).order_by('reminder_time')


# ── Log Views ──────────────────────────────────────────────────────────────────

class MedicationLogViewSet(viewsets.ModelViewSet):
    serializer_class   = MedicationLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MedicationLog.objects.filter(
            medication__user=self.request.user
        ).order_by('-timestamp')

    def perform_create(self, serializer):
        med = serializer.validated_data['medication']
        today = timezone.localtime().date()

        # Block duplicate taken/missed logs for the same medication today
        existing = MedicationLog.objects.filter(
            medication=med, date=today, status__in=['taken', 'missed']
        ).first()
        if existing:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                f"This medication was already marked as '{existing.status}' today."
            )

        log = serializer.save()

        # Record in notification history (skip duplicate snoozed entries)
        NotificationHistory.objects.get_or_create(
            user=self.request.user,
            medication=log.medication,
            action=log.status,
            defaults={'medication_name': log.medication.name},
        )

        # Email kin on repeated misses
        if log.status == 'missed':
            _alert_kin_if_needed(self.request.user)


# ── Adherence / Stats View ────────────────────────────────────────────────────

class AdherenceStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localtime().date()

        today_meds = Medication.objects.filter(
            user=request.user,
            start_date__lte=today,
            is_active=True,
        ).exclude(end_date__lt=today)

        today_logs    = MedicationLog.objects.filter(medication__user=request.user, date=today)
        taken_today   = today_logs.filter(status='taken').count()
        missed_today  = today_logs.filter(status='missed').count()
        total_today   = today_meds.count()
        remaining_today = max(0, total_today - taken_today - missed_today)
        today_adherence = round((taken_today / total_today * 100) if total_today > 0 else 0)

        all_logs         = MedicationLog.objects.filter(medication__user=request.user)
        total_taken      = all_logs.filter(status='taken').count()
        total_missed     = all_logs.filter(status='missed').count()
        total_logs       = total_taken + total_missed
        overall_adherence = round((total_taken / total_logs * 100) if total_logs > 0 else 0)

        return Response({
            'today': {
                'total':            total_today,
                'taken':            taken_today,
                'missed':           missed_today,
                'remaining':        remaining_today,
                'adherence_percent': today_adherence,
            },
            'all_time': {
                'total_taken':      total_taken,
                'total_missed':     total_missed,
                'adherence_percent': overall_adherence,
            }
        })


# ── Notification History View ─────────────────────────────────────────────────

class NotificationHistoryView(generics.ListAPIView):
    serializer_class   = NotificationHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NotificationHistory.objects.filter(user=self.request.user).order_by('-timestamp')
