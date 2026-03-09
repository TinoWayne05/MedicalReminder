from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Medication, MedicationLog, UserProfile, NotificationHistory


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegistrationSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    first_name       = serializers.CharField(required=True)
    username         = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model  = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'This email is already registered.'})
        return data

    def create(self, validated_data):
        username = validated_data.pop('username', None) or validated_data['email']
        base = username; counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}_{counter}"; counter += 1
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        UserProfile.objects.get_or_create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username']


# ── Profile ───────────────────────────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model  = UserProfile
        fields = [
            'id', 'user_details',
            'age', 'gender', 'weight', 'medical_conditions',
            'emergency_contact_name', 'emergency_contact_phone',
        ]


# ── Medications ───────────────────────────────────────────────────────────────

class MedicationSerializer(serializers.ModelSerializer):
    """
    Adds `today_status` — the status of today's log for this medication.
    null  → not yet logged today
    taken / missed / snoozed → already recorded
    """
    today_status = serializers.SerializerMethodField()

    class Meta:
        model  = Medication
        fields = '__all__'
        read_only_fields = ['user']

    def get_today_status(self, obj):
        today = timezone.localtime().date()
        log = MedicationLog.objects.filter(medication=obj, date=today).order_by('-timestamp').first()
        return log.status if log else None

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ── Logs ──────────────────────────────────────────────────────────────────────

class MedicationLogSerializer(serializers.ModelSerializer):
    medication_name   = serializers.ReadOnlyField(source='medication.name')
    medication_dosage = serializers.ReadOnlyField(source='medication.dosage')

    class Meta:
        model  = MedicationLog
        fields = '__all__'


# ── Notification History ──────────────────────────────────────────────────────

class NotificationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = NotificationHistory
        fields = '__all__'
        read_only_fields = ['user', 'timestamp']
