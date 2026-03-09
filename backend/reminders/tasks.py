from celery import shared_task
from django.utils import timezone
from .models import Medication
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_reminders():
    # In a real app this would notify via push notifications or email.
    # Since we use Browser Notifications, the frontend actually needs to know about reminders.
    # The frontend could just check when it loads, but we'll simulate the backend logic here
    # doing checks for "Right Now" reminders.
    now = timezone.localtime().time()
    today = timezone.localtime().date()
    # Simple check for the exact minute
    # Get medications for today
    valid_meds_today = Medication.objects.filter(
        start_date__lte=today
    ).exclude(
        end_date__lt=today
    )
    
    meds_due = []
    for med in valid_meds_today:
        if med.reminder_time.hour == now.hour and med.reminder_time.minute == now.minute:
            logger.info(f"Reminder triggered for: {med.name} at {med.reminder_time}")
            meds_due.append(med.name)
            
    return meds_due
