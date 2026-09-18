from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

class SubscribeRequest(BaseModel):
    phone: str
    location: str
    sensitivity: str = "general"

# In-memory subscriber registry (production me database me jayega)
subscribers = []

@router.post("/subscribe")
def subscribe_alerts(data: SubscribeRequest):
    # Number validate karo
    clean_phone = data.phone.strip().replace(" ", "").replace("-", "")
    if not clean_phone.startswith("+"):
        clean_phone = "+91" + clean_phone  # Default Indian code agar miss ho

    subscribers.append({
        "phone": clean_phone,
        "location": data.location,
        "sensitivity": data.sensitivity
    })
    return {"status": "success", "message": f"Subscribed {clean_phone} for automated alerts!"}

@router.post("/dispatch-forecast-alert")
def dispatch_forecast_alert(phone: str, location: str, aqi: int, optimal_window: str):
    """
    Twilio / Meta Cloud API hook:
    Agar credentials set hain toh direct push karega, 
    warna verified dev payload return karega.
    """
    message_body = (
        f"🌿 *AirShield AI Alert*\n"
        f"📍 Region: {location}\n"
        f"⚠️ Current AQI: {aqi}\n"
        f"🕒 Optimal Transit Window: {optimal_window}\n"
        f"💡 Recommendation: HEPA filtration active rakhein & heavy commute avoid karein."
    )
    
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_whatsapp = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

    if account_sid and auth_token:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        payload = {
            "From": from_whatsapp,
            "To": f"whatsapp:{phone}",
            "Body": message_body
        }
        res = requests.post(url, data=payload, auth=(account_sid, auth_token))
        return {"status": "sent", "sid": res.json().get("sid")}
    
    return {
        "status": "dry_run_success",
        "mock_dispatched_to": phone,
        "content": message_body
    }
