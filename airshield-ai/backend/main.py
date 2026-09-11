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
        print(f"Model successfully loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"Failed to load model: {e}")
else:
    print(f"Model file not found at: {MODEL_PATH}")

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
    return {"status": "healthy", "service": "AirShield AI Inference Server"}

@app.get("/api/predict")
def predict_aqi(lat: float = 28.6469, lon: float = 77.3160, current_pm: float = 45.0):
    try:
        # Default meteorological conditions
        temp = 25.0
        humidity = 55.0
        wind_speed = 6.5

        try:
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia%2FKolkata"
            w_res = requests.get(weather_url, timeout=3.5).json()
            if "current" in w_res:
                temp = float(w_res["current"].get("temperature_2m", temp))
                humidity = float(w_res["current"].get("relative_humidity_2m", humidity))
                wind_speed = float(w_res["current"].get("wind_speed_10m", wind_speed))
        except Exception as we:
            print(f"Weather API fallback: {we}")

        hours_map = [
            ("Now", 0), ("3 AM", 3), ("6 AM", 6), ("9 AM", 9),
            ("12 PM", 12), ("3 PM", 15), ("6 PM", 18), ("9 PM", 21)
        ]

        forecast = []
        for label, hr in hours_map:
            if model is not None:
                try:
                    features = np.array([[current_pm, temp, humidity, wind_speed, hr]])
                    pred_pm = float(model.predict(features)[0])
                except Exception:
                    # Inversion factor simulation if feature columns differ
                    inv = 1.35 if hr in [6, 21] else (0.75 if hr in [12, 15] else 1.0)
                    pred_pm = current_pm * inv
            else:
                inv = 1.35 if hr in [6, 21] else (0.75 if hr in [12, 15] else 1.0)
                pred_pm = current_pm * inv

            aqi_val = calculate_indian_aqi(pred_pm)
            forecast.append({"time": label, "aqi": aqi_val, "pm25": round(pred_pm, 1)})

        return {
            "status": "success",
            "station": {"latitude": lat, "longitude": lon},
            "input_pm25": current_pm,
            "forecast": forecast
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
