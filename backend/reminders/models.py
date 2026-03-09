from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    medical_conditions = models.TextField(blank=True, help_text="Comma-separated list e.g. Diabetes, Hypertension")
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}'s Profile"


class Medication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    reminder_time = models.TimeField()
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.dosage} ({self.user.username})"


class MedicationLog(models.Model):
    STATUS_CHOICES = (
        ('taken', 'Taken'),
        ('missed', 'Missed'),
        ('snoozed', 'Snoozed'),
    )
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medication.name} on {self.date} - {self.status}"


class NotificationHistory(models.Model):
    ACTION_CHOICES = (
        ('sent', 'Reminder Sent'),
        ('taken', 'Marked Taken'),
        ('missed', 'Marked Missed'),
        ('snoozed', 'Snoozed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_history')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, null=True, blank=True)
    medication_name = models.CharField(max_length=255, blank=True)  # cache name in case med deleted
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.medication_name} - {self.action} at {self.timestamp}"
