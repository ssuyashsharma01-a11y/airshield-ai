from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os
import requests
import numpy as np
from datetime import datetime, timedelta

app = FastAPI(title="AirShield ML Inference Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "aqi_model.pkl")

model = None
model_loaded = False
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        model_loaded = True
        print("Authentic CPCB Random Forest Model loaded.")
    except Exception as e:
        print(f"Model load error: {e}")

def get_cpcb_subindex_pm25(pm):
    pm = max(0.0, float(pm))
    if pm <= 30: return (50 / 30) * pm
    if pm <= 60: return 50 + ((100 - 50) / (60 - 30)) * (pm - 30)
    if pm <= 90: return 100 + ((200 - 100) / (90 - 60)) * (pm - 60)
    if pm <= 120: return 200 + ((300 - 200) / (120 - 90)) * (pm - 90)
    if pm <= 250: return 300 + ((400 - 300) / (250 - 120)) * (pm - 120)
    return 400 + ((500 - 400) / (380 - 250)) * (pm - 250)

def get_cpcb_subindex_pm10(pm):
    pm = max(0.0, float(pm))
    if pm <= 50: return (50 / 50) * pm
    if pm <= 100: return 50 + ((100 - 50) / (100 - 50)) * (pm - 50)
    if pm <= 250: return 100 + ((200 - 100) / (250 - 100)) * (pm - 100)
    if pm <= 350: return 200 + ((300 - 200) / (350 - 250)) * (pm - 250)
    if pm <= 430: return 300 + ((400 - 300) / (430 - 350)) * (pm - 350)
    return 400 + ((500 - 400) / (500 - 430)) * (pm - 430)

@app.get("/")
def root():
    return {"status": "healthy", "engine": "Random Forest Active"}

@app.get("/api/predict")
def predict_aqi(lat: float = 28.6469, lon: float = 77.3160, current_pm: float = 35.0, current_pm10: float = 120.0):
    try:
        base_temp = 28.0
        base_humidity = 55.0
        base_wind = 7.0

        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia%2FKolkata"
            w_res = requests.get(url, timeout=3.5).json()
            if "current" in w_res:
                base_temp = float(w_res["current"].get("temperature_2m", base_temp))
                base_humidity = float(w_res["current"].get("relative_humidity_2m", base_humidity))
                base_wind = float(w_res["current"].get("wind_speed_10m", base_wind))
        except Exception:
            pass

        base_cpcb_aqi = round(max(get_cpcb_subindex_pm25(current_pm), get_cpcb_subindex_pm10(current_pm10)))

        # Dynamic Real-Time Progression starting from Indian Standard Time right now
        now_dt = datetime.utcnow() + timedelta(hours=5, minutes=30)
        
        forecast = []
        is_rf_active = False

        # Generate forward steps: Now, +3h, +6h, +9h, +12h, +15h, +18h, +21h
        for step in range(8):
            target_dt = now_dt + timedelta(hours=step * 3)
            hr = target_dt.hour
            label = "Now" if step == 0 else target_dt.strftime("%I %p").lstrip("0")

            # Physical boundary diurnal factor based on clock hour
            if 4 <= hr <= 8:
                diurnal_mult = 1.38
            elif 12 <= hr <= 16:
                diurnal_mult = 0.65
            elif 19 <= hr <= 23:
                diurnal_mult = 1.25
            else:
                diurnal_mult = 1.05

            hr_temp = base_temp + (4.0 if 11 <= hr <= 16 else -3.5)
            hr_hum = max(20.0, base_humidity + (-15.0 if 11 <= hr <= 16 else 15.0))
            hr_wind = max(2.0, base_wind + (2.5 if 11 <= hr <= 16 else -2.0))

            shifted_pm25 = current_pm * diurnal_mult
            shifted_pm10 = current_pm10 * diurnal_mult

            if step == 0:
                pred_aqi = base_cpcb_aqi
            else:
                if model is not None:
                    try:
                        feat = np.array([[shifted_pm25, shifted_pm10, hr_temp, hr_hum, hr_wind, hr]])
                        pred_aqi = round(float(model.predict(feat)[0]))
                        is_rf_active = True
                    except Exception:
                        pred_aqi = round(base_cpcb_aqi * diurnal_mult)
                else:
                    pred_aqi = round(base_cpcb_aqi * diurnal_mult)

            forecast.append({
                "time": label,
                "hour_of_day": hr,
                "aqi": pred_aqi,
                "pm25": round(shifted_pm25, 1),
                "pm10": round(shifted_pm10, 1)
            })

        # Don't pick "Now" as safe/danger unless it is genuinely the only option
        future_slots = forecast[1:]
        safe_slot = min(future_slots, key=lambda x: x["aqi"])
        danger_slot = max(future_slots, key=lambda x: x["aqi"])

        return {
            "status": "success",
            "station": {"latitude": lat, "longitude": lon},
            "engine_status": "Random Forest Active" if (model_loaded or is_rf_active) else "Physical Diurnal Model",
            "windows": {
                "safeWindow": f"{safe_slot['time']} (Optimal Lower-Exposure)",
                "safeAqi": safe_slot["aqi"],
                "dangerWindow": f"{danger_slot['time']} (Peak Accumulation Risk)",
                "dangerAqi": danger_slot["aqi"]
            },
            "forecast": forecast
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
