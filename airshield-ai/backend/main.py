from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os
import requests
import numpy as np

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
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("Random Forest model successfully loaded.")
    except Exception as e:
        print(f"Error loading model: {e}")

def calculate_indian_aqi(pm):
    c = max(0.0, float(pm))
    if c <= 30:
        return round((50 / 30) * c)
    elif c <= 60:
        return round(50 + ((100 - 50) / (60 - 30)) * (c - 30))
    elif c <= 90:
        return round(100 + ((200 - 100) / (90 - 60)) * (c - 60))
    elif c <= 120:
        return round(200 + ((300 - 200) / (120 - 90)) * (c - 90))
    elif c <= 250:
        return round(300 + ((400 - 300) / (250 - 120)) * (c - 120))
    else:
        return min(500, round(400 + ((500 - 400) / (380 - 250)) * (c - 250)))

@app.get("/")
def root():
    return {"status": "healthy", "service": "AirShield AI Live ML"}

@app.get("/api/predict")
def predict_aqi(lat: float = 28.6469, lon: float = 77.3160, current_pm: float = 45.0):
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

        # Realistic coupled atmospheric inversion weights per diurnal cycle
        timeline = [
            ("Now", 0, 1.00),
            ("3 AM", 3, 1.34),
            ("6 AM", 6, 1.58),
            ("9 AM", 9, 1.18),
            ("12 PM", 12, 0.72),
            ("3 PM", 15, 0.62),
            ("6 PM", 18, 1.05),
            ("9 PM", 21, 1.42)
        ]

        forecast = []
        for label, hr, diurnal_mult in timeline:
            shifted_pm = current_pm * diurnal_mult
            hr_temp = base_temp + (4.5 if 10 <= hr <= 16 else -3.5)
            hr_hum = max(20.0, base_humidity + (-15.0 if 10 <= hr <= 16 else 15.0))
            hr_wind = max(2.0, base_wind + (2.5 if 10 <= hr <= 16 else -1.5))

            pred_val = shifted_pm
            if model is not None:
                try:
                    feat = np.array([[shifted_pm, hr_temp, hr_hum, hr_wind, hr]])
                    model_pred = float(model.predict(feat)[0])
                    # Ensure realistic bound from regression
                    if model_pred > 0:
                        pred_val = model_pred
                except Exception:
                    pred_val = shifted_pm

            aqi = calculate_indian_aqi(pred_val)
            forecast.append({
                "time": label,
                "aqi": aqi,
                "pm25": round(pred_val, 1)
            })

        safe_slot = min(forecast, key=lambda x: x["aqi"])
        danger_slot = max(forecast, key=lambda x: x["aqi"])

        return {
            "status": "success",
            "station": {"latitude": lat, "longitude": lon},
            "input_pm25": current_pm,
            "windows": {
                "safeWindow": f"{safe_slot['time']} (Safe Valley)",
                "safeAqi": safe_slot["aqi"],
                "dangerWindow": f"{danger_slot['time']} (Peak Thermal Inversion)",
                "dangerAqi": danger_slot["aqi"]
            },
            "forecast": forecast
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
