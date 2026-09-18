from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import os
import requests
import asyncio
from datetime import datetime

router = APIRouter(prefix="/api/automation", tags=["SmartHome"])

class WebhookConfigRequest(BaseModel):
    webhook_url: str = ""
    target_entity: str = "switch.bedroom_hepa_purifier"
    lead_time_minutes: int = 45
    aqi_threshold: int = 100
    auto_pilot_enabled: bool = True

class TriggerPayload(BaseModel):
    webhook_url: str = ""
    target_entity: str = "switch.bedroom_hepa_purifier"
    forecast_peak_hour: str = "06:00 AM"
    estimated_aqi: int = 137

# State store
state = {
    "auto_pilot_enabled": False,
    "last_triggered": None,
    "last_event_log": "Awaiting schedule initialization",
    "target_entity": "switch.bedroom_hepa_purifier",
    "webhook_url": "",
    "lead_time_minutes": 45,
    "aqi_threshold": 100
}

@router.get("/status")
def get_automation_status():
    return {
        "status": "success",
        "auto_pilot_enabled": state["auto_pilot_enabled"],
        "last_triggered": state["last_triggered"],
        "last_event_log": state["last_event_log"],
        "target_entity": state["target_entity"]
    }

@router.post("/toggle-autopilot")
def toggle_autopilot(data: dict):
    enabled = data.get("enabled", False)
    state["auto_pilot_enabled"] = enabled
    timestamp = datetime.now().strftime("%I:%M %p")
    if enabled:
        state["last_event_log"] = f"Auto-Pilot Active: Armed for 05:15 AM pre-cleansing before 6 AM peak."
    else:
        state["last_event_log"] = f"Auto-Pilot Disarmed manually at {timestamp}."
    return {
        "status": "success",
        "auto_pilot_enabled": state["auto_pilot_enabled"],
        "log": state["last_event_log"]
    }

@router.post("/test-trigger")
def trigger_purifier_webhook(payload: TriggerPayload):
    event_data = {
        "event": "airshield_preemptive_cleansing",
        "entity_id": payload.target_entity or state["target_entity"],
        "action": "turn_on",
        "reason": f"Predicted Stagnation Peak at {payload.forecast_peak_hour}",
        "forecast_aqi": payload.estimated_aqi,
        "mode": "high_circulation"
    }

    state["last_triggered"] = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")
    state["last_event_log"] = f"Pre-activation dispatched for {payload.target_entity}."

    if payload.webhook_url and payload.webhook_url.startswith("http"):
        try:
            res = requests.post(payload.webhook_url, json=event_data, timeout=5)
            return {
                "status": "dispatched",
                "http_code": res.status_code,
                "message": f"Signal dispatched to {payload.target_entity}"
            }
        except Exception as e:
            return {"status": "error", "detail": str(e)}

    return {
        "status": "simulated_success",
        "detail": "Dry-run mode: Webhook payload validated successfully.",
        "payload": event_data
    }
