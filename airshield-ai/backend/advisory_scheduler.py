import os
import json
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import requests

SUBSCRIBERS_FILE = "subscribers.json"

def get_subscribers():
    if not os.path.exists(SUBSCRIBERS_FILE):
        return []
    try:
        with open(SUBSCRIBERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_subscriber(phone: str, station: str):
    subs = get_subscribers()
    # Normalize phone
    clean_phone = phone.strip().replace(" ", "").replace("-", "")
    if not any(s.get("phone") == clean_phone for s in subs):
        subs.append({
            "phone": clean_phone,
            "station": station,
            "registered_at": datetime.now().isoformat()
        })
        with open(SUBSCRIBERS_FILE, "w", encoding="utf-8") as f:
            json.dump(subs, f, indent=2)
        return True, "Subscribed successfully"
    return False, "Already subscribed"

def dispatch_daily_morning_advisory():
    """Autonomous job that runs at 07:00 AM IST daily"""
    subs = get_subscribers()
    if not subs:
        print("[Advisory Scheduler] No registered subscribers.")
        return

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_whatsapp = os.getenv("TWILIO_PHONE_NUMBER", "whatsapp:+14155238886")

    print(f"[Advisory Scheduler] Starting 07:00 AM broadcast for {len(subs)} subscribers...")

    for sub in subs:
        phone = sub["phone"]
        station = sub.get("station", "Live Location")
        
        # WhatsApp message body
        body = (
            f"🌿 *AirShield AI Daily Advisory* 🌿\n\n"
            f"📍 *Location:* {station}\n"
            f"⏰ *Schedule:* Morning Briefing (07:00 AM IST)\n\n"
            f"🚶 *Optimal Transit Window:* 12:00 PM - 02:00 PM\n"
            f"🛡️ *HEPA Recommendation:* Pre-cleanse indoor air before peak diurnal hours.\n\n"
            f"Stay safe and monitor live telemetry at AirShield AI."
        )

        if account_sid and auth_token:
            try:
                from twilio.rest import Client
                client = Client(account_sid, auth_token)
                target = f"whatsapp:{phone}" if not phone.startswith("whatsapp:") else phone
                msg = client.messages.create(body=body, from_=from_whatsapp, to=target)
                print(f"[Advisory Scheduler] Sent to {phone}: SID {msg.sid}")
            except Exception as e:
                print(f"[Advisory Scheduler] Delivery failed for {phone}: {e}")
        else:
            print(f"[Advisory Scheduler (Simulation)] Dispatched to {phone}:\n{body}\n---")

scheduler = BackgroundScheduler(timezone="Asia/Kolkata")

def start_scheduler():
    if not scheduler.running:
        # Run daily at 07:00 AM IST
        scheduler.add_job(
            dispatch_daily_morning_advisory,
            trigger=CronTrigger(hour=7, minute=0, timezone="Asia/Kolkata"),
            id="morning_air_advisory",
            replace_existing=True
        )
        scheduler.start()
        print("[Advisory Scheduler] Daemon initialized for 07:00 AM IST daily triggers.")
