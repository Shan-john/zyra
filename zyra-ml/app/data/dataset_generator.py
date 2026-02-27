"""
Dataset generator — creates a synthetic machine sensor dataset
for equipment failure prediction if no real dataset is provided.

Features generated:
- operating_hours     (float: 0–12000)
- temperature         (float: 40–120 °C)
- vibration           (float: 0–8 mm/s)
- pressure            (float: 50–200 PSI)
- age_months          (int: 1–120)
- maintenance_count   (int: 0–20)
- load_percentage     (float: 10–100%)
- rpm                 (float: 500–5000)
- humidity            (float: 20–95%)
- power_consumption   (float: 100–2000 kW)

Target:
- failure  (binary: 0 = healthy, 1 = failed)
"""

import numpy as np
import pandas as pd
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "machine_data.csv")


def generate_dataset(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """Generate a realistic synthetic machine failure dataset."""
    rng = np.random.RandomState(seed)

    operating_hours = rng.uniform(0, 12000, n_samples)
    temperature = rng.uniform(40, 120, n_samples)
    vibration = rng.uniform(0, 8, n_samples)
    pressure = rng.uniform(50, 200, n_samples)
    age_months = rng.randint(1, 121, n_samples)
    maintenance_count = rng.randint(0, 21, n_samples)
    load_percentage = rng.uniform(10, 100, n_samples)
    rpm = rng.uniform(500, 5000, n_samples)
    humidity = rng.uniform(20, 95, n_samples)
    power_consumption = rng.uniform(100, 2000, n_samples)

    # ─── Failure logic (realistic weighted combination) ──────────────────
    failure_score = (
        0.25 * (temperature - 40) / 80
        + 0.20 * (operating_hours / 12000)
        + 0.15 * (vibration / 8)
        + 0.10 * (age_months / 120)
        + 0.10 * (load_percentage / 100)
        + 0.08 * (pressure / 200)
        + 0.05 * (humidity / 95)
        + 0.04 * (power_consumption / 2000)
        + 0.03 * (rpm / 5000)
        - 0.10 * (maintenance_count / 20)  # maintenance reduces failure
    )

    # Add noise and threshold
    failure_score += rng.normal(0, 0.08, n_samples)
    failure = (failure_score > 0.50).astype(int)

    df = pd.DataFrame({
        "operating_hours": np.round(operating_hours, 1),
        "temperature": np.round(temperature, 1),
        "vibration": np.round(vibration, 2),
        "pressure": np.round(pressure, 1),
        "age_months": age_months,
        "maintenance_count": maintenance_count,
        "load_percentage": np.round(load_percentage, 1),
        "rpm": np.round(rpm, 1),
        "humidity": np.round(humidity, 1),
        "power_consumption": np.round(power_consumption, 1),
        "failure": failure,
    })

    return df


def load_or_generate_dataset() -> pd.DataFrame:
    """Load dataset from disk if it exists, otherwise generate and save it."""
    if os.path.exists(DATASET_PATH):
        print(f"📂 Loading existing dataset from {DATASET_PATH}")
        return pd.read_csv(DATASET_PATH)

    print("🔄 Generating synthetic machine dataset (5000 samples)...")
    df = generate_dataset()

    os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
    df.to_csv(DATASET_PATH, index=False)
    print(f"💾 Dataset saved to {DATASET_PATH}")
    return df
