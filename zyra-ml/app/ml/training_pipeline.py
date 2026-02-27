"""
ML Training Pipeline
─────────────────────
1. Load / generate dataset
2. Preprocess (scaling)
3. Train/test split (80/20, stratified)
4. Train RandomForestClassifier
5. Evaluate: Accuracy, F1, ROC AUC
6. Save trained model + scaler + metrics to disk
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, classification_report

from app.data.dataset_generator import load_or_generate_dataset

# ─── Paths ────────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")
MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")
FEATURE_NAMES_PATH = os.path.join(MODEL_DIR, "feature_names.json")

FEATURE_COLUMNS = [
    "operating_hours",
    "temperature",
    "vibration",
    "pressure",
    "age_months",
    "maintenance_count",
    "load_percentage",
    "rpm",
    "humidity",
    "power_consumption",
]

TARGET_COLUMN = "failure"


def train_model() -> dict:
    """Full training pipeline. Returns evaluation metrics."""

    os.makedirs(MODEL_DIR, exist_ok=True)

    # ─── 1. Load dataset ──────────────────────────────────────────────
    df = load_or_generate_dataset()
    print(f"✅ Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"   Class distribution: {dict(df[TARGET_COLUMN].value_counts())}")

    X = df[FEATURE_COLUMNS].values
    y = df[TARGET_COLUMN].values

    # ─── 2. Preprocessing (Standard Scaling) ──────────────────────────
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ─── 3. Train/test split (80/20, stratified) ──────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")

    # ─── 4. Train RandomForestClassifier ──────────────────────────────
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)
    print("✅ Model trained: RandomForestClassifier (200 estimators)")

    # ─── 5. Evaluate ──────────────────────────────────────────────────
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    roc_auc = roc_auc_score(y_test, y_proba)

    # Feature importance from the forest
    importances = model.feature_importances_
    feature_importance = {
        name: round(float(imp), 4)
        for name, imp in sorted(
            zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True
        )
    }

    metrics = {
        "accuracy": round(accuracy, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "train_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "feature_importance": feature_importance,
    }

    print(f"   Accuracy : {metrics['accuracy']}")
    print(f"   F1 Score : {metrics['f1_score']}")
    print(f"   ROC AUC  : {metrics['roc_auc']}")
    print(f"\n📊 Classification Report:\n{classification_report(y_test, y_pred)}")

    # ─── 6. Save artifacts ────────────────────────────────────────────
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    with open(FEATURE_NAMES_PATH, "w") as f:
        json.dump(FEATURE_COLUMNS, f)

    print(f"💾 Model saved to {MODEL_PATH}")
    print(f"💾 Scaler saved to {SCALER_PATH}")
    print(f"💾 Metrics saved to {METRICS_PATH}")

    return metrics


# Run standalone
if __name__ == "__main__":
    train_model()
