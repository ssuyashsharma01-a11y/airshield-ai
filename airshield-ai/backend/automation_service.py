from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests

router = APIRouter(prefix="/api/automation", tags=["SmartHome"])

class WebhookConfigRequest(BaseModel):
    webhook_url: str
    target_entity: str = "switch.air_purifier"
    lead_time_minutes: int = 45
    aqi_threshold: int = 100

class TriggerPayload(BaseModel):
    webhook_url: str
    target_entity: str
    forecast_peak_hour: str
    estimated_aqi: int

# In-memory config storage
active_config = {
    "webhook_url": "",
    "target_entity": "switch.air_purifier",
    "lead_time_minutes": 45,
    "aqi_threshold": 100,
    "auto_pilot_enabled": True
}

@router.get("/config")
def get_config():
    return active_config

@router.post("/config")
def save_config(config: WebhookConfigRequest):
    active_config["webhook_url"] = config.webhook_url
    active_config["target_entity"] = config.target_entity
    active_config["lead_time_minutes"] = config.lead_time_minutes
    active_config["aqi_threshold"] = config.aqi_threshold
    return {"status": "saved", "config": active_config}

@router.post("/test-trigger")
def trigger_purifier_webhook(payload: TriggerPayload):
    """
    Home Assistant Webhook / Matter Rest Bridge trigger.
    Payload me pre-activation directive bheji jati hai.
    """
    event_data = {
        "event": "airshield_preemptive_cleansing",
        "entity_id": payload.target_entity,
        "action": "turn_on",
        "reason": f"Predicted Stagnation Peak at {payload.forecast_peak_hour}",
        "forecast_aqi": payload.estimated_aqi,
        "mode": "high_circulation"
    }

    if payload.webhook_url and payload.webhook_url.startswith("http"):
        try:
            res = requests.post(payload.webhook_url, json=event_data, timeout=5)
            return {
                "status": "dispatched",
                "http_code": res.status_code,
                "message": f"Pre-activation signal dispatched to {payload.target_entity}"
            }
        except Exception as e:
            return {"status": "error", "detail": str(e)}

    return {
        "status": "simulated_success",
        "detail": "Dry-run mode: Webhook payload validated successfully.",
        "payload": event_data
    }
