from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import requests
import numpy as np
import datetime

app = FastAPI(title="AirShield ML Inference Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("model/aqi_model.pkl")

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

@app.get("/api/predict")
def predict_aqi(lat: float, lon: float, current_pm: float):
    # Fetch live weather forecast for features
    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia%2FKolkata&forecast_days=2"
    resp = requests.get(weather_url).json()

    now = datetime.datetime.now()
    current_hour = now.hour

    forecast = [{"time": "Now", "aqi": calculate_indian_aqi(current_pm)}]

    for i in range(1, 8):
        future_idx = current_hour + (i * 3)
        future_hour = future_idx % 24
        time_label = f"{future_hour % 12 or 12} {'PM' if future_hour >= 12 else 'AM'}"

        temp = resp["hourly"]["temperature_2m"][future_idx] if future_idx < len(resp["hourly"]["temperature_2m"]) else 28.0
        humidity = resp["hourly"]["relative_humidity_2m"][future_idx] if future_idx < len(resp["hourly"]["relative_humidity_2m"]) else 60.0
        wind = resp["hourly"]["wind_speed_10m"][future_idx] if future_idx < len(resp["hourly"]["wind_speed_10m"]) else 5.0

        features = pd.DataFrame([{
            'base_pm': current_pm,
            'hour': future_hour,
            'temp': temp,
            'wind_speed': wind,
            'humidity': humidity
        }])

        pred_pm = model.predict(features)[0]
        forecast.append({
            "time": time_label,
            "aqi": calculate_indian_aqi(pred_pm)
        })

    return {
        "source": "AirShield Trained Random Forest",
        "current_aqi": calculate_indian_aqi(current_pm),
        "forecast": forecast
    }
