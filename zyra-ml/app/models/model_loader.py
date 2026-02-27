"""
Model Loader — loads trained model, scaler, metrics, and feature names from disk.
"""

import os
import json
import joblib

_model = None
_scaler = None
_metrics = None
_feature_names = None

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "rf_model.pkl")
SCALER_PATH = os.path.join(ARTIFACTS_DIR, "scaler.pkl")
METRICS_PATH = os.path.join(ARTIFACTS_DIR, "metrics.json")
FEATURE_NAMES_PATH = os.path.join(ARTIFACTS_DIR, "feature_names.json")


def load_model():
    """Load all ML artifacts from disk."""
    global _model, _scaler, _metrics, _feature_names

    if os.path.exists(MODEL_PATH):
        _model