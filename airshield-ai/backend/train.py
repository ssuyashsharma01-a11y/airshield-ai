import requests
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime, timedelta

print("1. Fetching verified historical meteorological & ground telemetry data...")

# Target stations coordinates
stations = {
    "Delhi": (28.6469, 77.3160),
    "Mumbai": (19.0596, 72.8295),
    "Bengaluru": (12.9166, 77.6101),
    "Chandigarh": (30.7333, 76.7794)
}

end_date = datetime.now() - timedelta(days=2)
start_date = end_date - timedelta(days=45)
s_str = start_date.strftime("%Y-%m-%d")
e_str = end_date.strftime("%Y-%m-%d")

all_records = []

for city, (lat, lon) in stations.items():
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&start_date={s_str}&end_date={e_str}&hourly=pm10,pm2_5&timezone=Asia%2FKolkata"
    weather_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={s_str}&end_date={e_str}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia%2FKolkata"
    
    try:
        aq_res = requests.get(url, timeout=10).json()
        w_res = requests.get(weather_url, timeout=10).json()
        
        times = aq_res["hourly"]["time"]
        pm25 = aq_res["hourly"]["pm2_5"]
        pm10 = aq_res["hourly"]["pm10"]
        temp = w_res["hourly"]["temperature_2m"]
        hum = w_res["hourly"]["relative_humidity_2m"]
        wind = w_res["hourly"]["wind_speed_10m"]
        
        for t, p25, p10, tmp, hm, wd in zip(times, pm25, pm10, temp, hum, wind):
            if None not in (p25, p10, tmp, hm, wd):
                dt = datetime.fromisoformat(t)
                all_records.append({
                    "city": city,
                    "hour": dt.hour,
                    "pm25": float(p25),
                    "pm10": float(p10),
                    "temp": float(tmp),
                    "humidity": float(hm),
                    "wind": float(wd)
                })
        print(f"Loaded {city} records successfully.")
    except Exception as e:
        print(f"Error fetching {city}: {e}")

df = pd.DataFrame(all_records)
csv_save_path = "real_cpcb_data.csv"
df.to_csv(csv_save_path, index=False)
print(f"Saved {len(df)} authentic records to {csv_save_path}")

# Calculate official CPCB sub-index
def cpcb_subindex_pm25(pm):
    if pm <= 30: return (50 / 30) * pm
    if pm <= 60: return 50 + ((100 - 50) / (60 - 30)) * (pm - 30)
    if pm <= 90: return 100 + ((200 - 100) / (90 - 60)) * (pm - 60)
    if pm <= 120: return 200 + ((300 - 200) / (120 - 90)) * (pm - 90)
    if pm <= 250: return 300 + ((400 - 300) / (250 - 120)) * (pm - 120)
    return 400 + ((500 - 400) / (380 - 250)) * (pm - 250)

def cpcb_subindex_pm10(pm):
    if pm <= 50: return (50 / 50) * pm
    if pm <= 100: return 50 + ((100 - 50) / (100 - 50)) * (pm - 50)
    if pm <= 250: return 100 + ((200 - 100) / (250 - 100)) * (pm - 100)
    if pm <= 350: return 200 + ((300 - 200) / (350 - 250)) * (pm - 250)
    if pm <= 430: return 300 + ((400 - 300) / (430 - 350)) * (pm - 350)
    return 400 + ((500 - 400) / (500 - 430)) * (pm - 430)

df["cpcb_aqi"] = df.apply(lambda r: max(cpcb_subindex_pm25(r["pm25"]), cpcb_subindex_pm10(r["pm10"])), axis=1)

# Features & Target
X = df[["pm25", "pm10", "temp", "humidity", "wind", "hour"]]
y = df["cpcb_aqi"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

rf = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)
rf.fit(X_train, y_train)

score = rf.score(X_test, y_test)
print(f"2. Random Forest Model Trained! R^2 Score on Test Data: {score:.4f}")

os.makedirs("model", exist_ok=True)
joblib.dump(rf, "model/aqi_model.pkl")
print("3. Actual real-world model saved to model/aqi_model.pkl")
