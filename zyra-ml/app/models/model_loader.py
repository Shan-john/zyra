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
        _model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
    else:
        print("⚠️  No trained model found — run training pipeline first")
        return False

    if os.path.exists(SCALER_PATH):
        _scaler = joblib.load(SCALER_PATH)
        print(f"✅ Scaler loaded from {SCALER_PATH}")

    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            _metrics = json.load(f)
        print(f"✅ Metrics loaded: Accuracy={_metrics.get('accuracy')}, F1={_metrics.get('f1_score')}, ROC-AUC={_metrics.get('roc_auc')}")

    if os.path.exists(FEATURE_NAMES_PATH):
        with open(FEATURE_NAMES_PATH, "r") as f:
            _feature_names = json.load(f)

    return True


def get_model():
    return _model


def get_scaler():
    return _scaler


def get_metrics():
    return _metrics


def get_feature_names():
    return _feature_names
