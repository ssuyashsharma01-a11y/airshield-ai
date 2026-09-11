import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# 1. Generate Synthetic Training Data (Realistic Indian Atmospheric Physics)
np.random.seed(42)
n_samples = 4000

hours = np.random.randint(0, 24, n_samples)
base_pm = np.random.uniform(20, 180, n_samples)
temp = np.random.uniform(15, 38, n_samples)
wind_speed = np.random.uniform(1.0, 12.0, n_samples)
humidity = np.random.uniform(30, 95, n_samples)

# Boundary layer & Traffic physics:
# - Night/Early Morning: low boundary layer (trapping)
# - 8-10 AM & 6-9 PM: Traffic spike
traffic_factor = np.where((hours >= 8) & (hours <= 10) | (hours >= 18) & (hours <= 21), 1.45, 1.0)
inversion_factor = np.where((hours >= 22) | (hours <= 6), 1.35, 0.85)
dispersion_factor = 1.0 / (wind_speed * 0.15 + 0.5)

target_pm = base_pm * traffic_factor * inversion_factor * dispersion_factor * (1 + (humidity - 50) * 0.003)
target_pm = np.clip(target_pm + np.random.normal(0, 5, n_samples), 10, 450)

X = pd.DataFrame({
    'base_pm': base_pm,
    'hour': hours,
    'temp': temp,
    'wind_speed': wind_speed,
    'humidity': humidity
})
y = target_pm

# 2. Train Model
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X, y)

# 3. Save Model Artifact
joblib.dump(model, "model/aqi_model.pkl")
print("ML Model trained and saved to backend/model/aqi_model.pkl successfully!")
