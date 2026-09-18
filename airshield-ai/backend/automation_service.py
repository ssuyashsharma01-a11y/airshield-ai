from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from datetime import datetime

router = APIRouter(prefix="/api/automation", tags=["SmartHome"])

class WebhookConfigRequest(BaseModel):
    webhook_url: str = ""
    target_entity: str = "switch.bedroom_hepa_purifier"
    lead_time_minutes: int = 45
    aqi_threshold: int = 100

class TriggerPayload(BaseModel):
    webhook_url: str = ""
    target_entity: str = "switch.bedroom_hepa_purifier"
    forecast_peak_hour: str = "06:00 AM"
    estimated_aqi: int = 137

state = {
    "auto_pilot_enabled": True,
    "target_entity": "switch.bedroom_hepa_purifier",
    "webhook_url": "",
    "lead_time_minutes": 45,
    "aqi_threshold": 100,
    "last_triggered": None,
    "last_event_log": "Armed for 05:15 AM pre-cleansing"
}

@router.get("/config")
def get_config():
    return {
        "status": "success",
        "config": {
            "webhook_url": state["webhook_url"],
            "target_entity": state["target_entity"],
            "lead_time_minutes": state["lead_time_minutes"],
            "aqi_threshold": state["aqi_threshold"]
        }
    }

@router.post("/config")
def save_config(config: WebhookConfigRequest):
    state["webhook_url"] = config.webhook_url.strip()
    state["target_entity"] = config.target_entity.strip() or "switch.bedroom_hepa_purifier"
    state["lead_time_minutes"] = config.lead_time_minutes
    state["aqi_threshold"] = config.aqi_threshold
    return {"status": "saved", "config": config.dict()}

@router.post("/toggle-autopilot")
def toggle_autopilot(data: dict):
    enabled = data.get("enabled", False)
    state["auto_pilot_enabled"] = enabled
    timestamp = datetime.now().strftime("%I:%M %p")
    if enabled:
        state["last_event_log"] = f"Auto-Pilot Active: Armed for 05:15 AM pre-cleansing before 6 AM peak."
    else:
        state["last_event_log"] = f"Auto-Pilot Disarmed manually at {timestamp}."
    return {"status": "success", "auto_pilot_enabled": state["auto_pilot_enabled"], "log": state["last_event_log"]}

@router.post("/test-trigger")
def trigger_purifier_webhook(payload: TriggerPayload):
    url = payload.webhook_url.strip() or state["webhook_url"]
    entity = payload.target_entity.strip() or state["target_entity"]
    
    event_data = {
        "event": "airshield_preemptive_cleansing",
        "entity_id": entity,
        "action": "turn_on",
        "reason": f"Predicted Stagnation Peak at {payload.forecast_peak_hour}",
        "forecast_aqi": payload.estimated_aqi,
        "mode": "high_circulation"
    }

    state["last_triggered"] = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")

    if url and url.startswith("http"):
        try:
            res = requests.post(url, json=event_data, timeout=5)
            return {
                "status": "dispatched",
                "http_code": res.status_code,
                "message": f"Signal live dispatched to {entity} via {url}"
            }
        except Exception as e:
            return {"status": "error", "detail": f"Failed to dispatch to {url}: {str(e)}"}

    return {
        "status": "simulated_success",
        "detail": "Dry-run mode (no URL configured): Webhook payload generated.",
        "payload": event_data
    }
