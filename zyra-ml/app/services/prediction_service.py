"""
Prediction Service
───────────────────
- Scales input features using the persisted StandardScaler
- Runs inference through the RandomForestClassifier
- Computes SHAP values for per-prediction explainability
- Returns failure_probability, health_score, feature importance, and SHAP explanation
"""

import numpy as np
import shap

from app.models.model_loader import get_model, get_scaler, get_metrics, get_feature_names
from app.schemas.request_schemas import FailurePredictionRequest
from app.schemas.response_schemas import FailurePredictionResponse, FeatureExplanation


def predict_failure(request: FailurePredictionRequest) -> FailurePredictionResponse:
    """Run failure prediction with SHAP explanation."""

    model = get_model()
    scaler = get_scaler()
    metrics = get_metrics()
    feature_names = get_feature_names()

    if model is None or scaler is None:
        raise RuntimeError("Model not loaded. Run the training pipeline first.")

    # ─── 1. Build feature vector ──────────────────────────────────────
    raw_values = [
        request.operating_hours,
        request.temperature,
        request.vibration,
        request.pressure,
        request.age_months,
        request.maintenance_count,
        request.load_percentage,
        request.rpm,
        request.humidity,
        request.power_consumption,
    ]
    X_raw = np.array([raw_values])

    # ─── 2. Scale features ───────────────────────────────────────────
    X_scaled = scaler.transform(X_raw)

    # ─── 3. Predict failure probability ──────────────────────────────
    failure_probability = float(model.predict_proba(X_scaled)[0][1])
    health_score = round(100 - (failure_probability * 100), 2)

    # ─── 4. Risk classification ──────────────────────────────────────
    if failure_probability >= 0.75:
        risk_level = "critical"
    elif failure_probability >= 0.50:
        risk_level = "high"
    elif failure_probability >= 0.25:
        risk_level = "medium"
    else:
        risk_level = "low"

    # ─── 5. Random Forest feature importance (global) ────────────────
    global_importance = {
        name: round(float(imp), 4)
        for name, imp in zip(feature_names, model.feature_importances_)
    }

    # ─── 6. SHAP explanations (per-prediction) ──────────────────────
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_scaled)

    # Extract SHAP values for class 1 (failure)
    if isinstance(shap_values, list):
        failure_shap = shap_values[1][0]
    elif len(shap_values.shape) == 3:
        failure_shap = shap_values[0, :, 1]
    else:
        failure_shap = shap_values[0]

    shap_explanations = []
    for name, shap_val, raw_val in zip(feature_names, failure_shap, raw_values):
        direction = "increases" if shap_val > 0 else "decreases"
        impact = abs(float(shap_val))
        shap_explanations.append(
            FeatureExplanation(
                feature=name,
                value=round(raw_val, 2),
                shap_value=round(float(shap_val), 4),
                impact=round(impact, 4),
                direction=direction,
                description=f"{name}={round(raw_val, 1)} {direction} failure risk by {round(impact * 100, 1)}%",
            )
        )

    # Sort by absolute SHAP impact (most important first)
    shap_explanations.sort(key=lambda x: x.impact, reverse=True)

    # ─── 7. Recommended actions ──────────────────────────────────────
    actions = _generate_recommendations(risk_level, shap_explanations, request)

    return FailurePredictionResponse(
        equipment_id=request.equipment_id,
        failure_probability=round(failure_probability, 4),
        health_score=health_score,
        risk_level=risk_level,
        feature_importance=global_importance,
        shap_explanation=shap_explanations,
        recommended_actions=actions,
        model_metrics=metrics or {},
    )


def _generate_recommendations(
    risk_level: str,
    shap_explanations: list,
    request: FailurePredictionRequest,
) -> list:
    """Generate actionable recommendations based on SHAP analysis."""
    actions = []

    # Risk-level actions
    if risk_level == "critical":
        actions.append("🚨 CRITICAL: Schedule immediate maintenance shutdown")
        actions.append("Prepare contingency plan for potential downtime")
    elif risk_level == "high":
        actions.append("⚠️ Schedule preventive maintenance within 48 hours")
        actions.append("Reduce operational load to 60% until inspection")
    elif risk_level == "medium":
        actions.append("📋 Schedule inspection within 2 weeks")
    else:
        actions.append("✅ Equipment is healthy — next check in 30 days")

    # SHAP-driven specific recommendations
    top_factors = shap_explanations[:3]
    for factor in top_factors:
        if factor.direction == "increases" and factor.impact > 0.02:
            if factor.feature == "temperature":
                actions.append(f"🌡️ Temperature is {request.temperature}°C — inspect cooling system")
            elif factor.feature == "vibration":
                actions.append(f"📳 Vibration at {request.vibration} mm/s — check bearing alignment")
            elif factor.feature == "operating_hours":
                actions.append(f"⏱️ {request.operating_hours}h runtime — consider overhaul scheduling")
            elif factor.feature == "maintenance_count":
                actions.append("🔧 Review and increase maintenance frequency")
            elif factor.feature == "load_percentage":
                actions.append(f"📊 Load at {request.load_percentage}% — reduce to extend equipment life")
            elif factor.feature == "age_months":
                actions.append(f"📅 Equipment is {request.age_months} months old — evaluate replacement")
            elif factor.feature == "pressure":
                actions.append(f"🔴 Pressure at {request.pressure} PSI — check pressure relief valves")

    return actions
