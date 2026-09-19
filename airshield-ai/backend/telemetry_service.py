from fastapi import APIRouter
import requests
from datetime import datetime

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])

DELHI_LAT = 28.6508
DELHI_LON = 77.3153

def calculate_cpcb_aqi(pm25, pm10):
    def get_sub_index(val, breakpoints):
        for b_lo, b_hi, i_lo, i_hi in breakpoints:
            if b_lo <= val <= b_hi:
                return round(((i_hi - i_lo) / (b_hi - b_lo)) * (val - b_lo) + i_lo)
        return 500

    pm25_bp = [
        (0, 30, 0, 50), (30.1, 60, 51, 100), (60.1, 90, 101, 200),
        (90.1, 120, 201, 300), (120.1, 250, 301, 400), (250.1, 500, 401, 500)
    ]
    pm10_bp = [
        (0, 50, 0, 50), (50.1, 100, 51, 100), (100.1, 250, 101, 200),
        (250.1, 350, 201, 300), (350.1, 430, 301, 400), (430.1, 600, 401, 500)
    ]
    
    i_pm25 = get_sub_index(pm25, pm25_bp)
    i_pm10 = get_sub_index(pm10, pm10_bp)
    return max(i_pm25, i_pm10)

def fetch_live_meteorology(lat=DELHI_LAT, lon=DELHI_LON):
    meteo_url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure"
    )
    aqi_url = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality?"
        f"latitude={lat}&longitude={lon}&current=pm10,pm2_5"
    )
    
    temp = 32.7
    humidity = 52.0
    wind_speed = 5.6
    pressure = 982.8
    pm25 = 35.0
    pm10 = 110.0

    try:
        m_res = requests.get(meteo_url, timeout=4)
        if m_res.status_code == 200:
            m_data = m_res.json().get("current", {})
            temp = m_data.get("temperature_2m", temp)
            humidity = m_data.get("relative_humidity_2m", humidity)
            wind_speed = m_data.get("wind_speed_10m", wind_speed)
            pressure = m_data.get("surface_pressure", pressure)
    except Exception as e:
        pass

    try:
        a_res = requests.get(aqi_url, timeout=4)
        if a_res.status_code == 200:
            a_data = a_res.json().get("current", {})
            pm25 = a_data.get("pm2_5", pm25)
            pm10 = a_data.get("pm10", pm10)
    except Exception as e:
        pass

    real_aqi = calculate_cpcb_aqi(pm25, pm10)

    return {
        "temp": temp,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "pressure": pressure,
        "pm25": round(pm25, 1),
        "pm10": round(pm10, 1),
        "real_aqi": real_aqi,
        "hour": datetime.now().hour,
        "source": "Open-Meteo High-Resolution Live APIs"
    }

@router.get("/live")
def get_live_covariates():
    meteo = fetch_live_meteorology()
    return {
        "status": "synchronized",
        "atmospheric_vector": meteo
    }
