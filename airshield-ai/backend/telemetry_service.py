from fastapi import APIRouter
import requests
from datetime import datetime

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])

DELHI_LAT = 28.6508
DELHI_LON = 77.3153

def fetch_live_meteorology(lat=DELHI_LAT, lon=DELHI_LON):
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure"
        )
        res = requests.get(url, timeout=4)
        if res.status_code == 200:
            data = res.json().get("current", {})
            return {
                "temp": data.get("temperature_2m", 28.5),
                "humidity": data.get("relative_humidity_2m", 58.0),
                "wind_speed": data.get("wind_speed_10m", 3.2),
                "pressure": data.get("surface_pressure", 1012.0),
                "hour": datetime.now().hour,
                "source": "Open-Meteo High-Resolution Telemetry"
            }
    except Exception as e:
        print("Telemetry Fetch Fallback:", e)
    
    return {
        "temp": 29.0,
        "humidity": 62.0,
        "wind_speed": 2.8,
        "pressure": 1011.5,
        "hour": datetime.now().hour,
        "source": "Standard Boundary Layer Baseline (Fallback)"
    }

@router.get("/live")
def get_live_covariates():
    meteo = fetch_live_meteorology()
    return {
        "status": "synchronized",
        "atmospheric_vector": meteo
    }
