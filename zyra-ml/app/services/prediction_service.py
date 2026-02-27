"""
Prediction service — feature engineering + inference.
Uses a trained scikit-learn model if available,
otherwise applies a rule-based heuristic.
"""

import numpy as np
from app.models.model_loader import get_model
from app.schemas.request_schemas import FailurePredictionRequest
from app.schemas.response_schemas import FailurePredictionResponse


def predict_failure(request: FailurePredictionRequest) -> FailurePredictionResponse:
    """Run failure prediction on the given equipment features."""

    # Feature vector
    features = np.array([[
        request.operating_hours,
        request.temperature,
        request.vibration,
        request.pressure,
        request.age_months,
        request.maintenance_count,
        request.load_percentage,
    ]])

    model = get_model()

    if model is not None:
        # Use trained model
        probability = float(model.predict_proba(features)[0][1])
        confidence = 0.92
    else:
        # Heuristic fallback
        probability = _heuristic_score(request)
        confidence = 0.70

    risk_level = _classify_risk(probability)
    factors = _identify_factors(request)
    actions = _recommend_actions(risk_level, factors)

    return FailurePredictionResponse(
        equipment_id=request.equipment_id,
        failure_probability=round(probability, 4),
        risk_level=risk_level,
        contributing_factors=factors,
        recommended_actions=actions,
        confidence=confidence,
    )


def _heuristic_score(req: FailurePredictionRequest) -> float:
    """Rule-based failure probability estimation."""
    score = 0.0

    # Temperature factor
    if req.temperature > 90:
        score += 0.25
    elif req.temperature > 75:
        score += 0.15
    elif req.temperature > 60:
        score += 0.05

    # Operating hours factor
    if req.operating_hours > 8000:
        score += 0.20
    elif req.operating_hours > 5000:
        score += 0.12
    elif req.operating_hours > 2000:
        score += 0.05

    # Vibration factor
    if req.vibration > 5.0:
        score += 0.20
    elif req.vibration > 3.0:
        score += 0.10

    # Age factor
    if req.age_months > 60:
        score += 0.15
    elif req.age_months > 36:
        score += 0.08

    # Load factor
    if req.load_percentage > 90:
        score += 0.10
    elif req.load_percentage > 75:
        score += 0.05

    # Maintenance factor (less maintenance = higher risk)
    if req.maintenance_count < 2 and req.operating_hours > 3000:
        score += 0.10

    return min(score, 0.99)


def _classify_risk(probability: float) -> str:
    if probability >= 0.75:
        return "critical"
    elif probability >= 0.50:
        return "high"
    elif probability >= 0.25:
        return "medium"
    return "low"


def _identify_factors(req: FailurePredictionRequest) -> list:
    factors = []
    if req.temperature > 75:
        factors.append(f"High operating temperature ({req.temperature}°C > 75°C threshold)")
    if req.operating_hours > 5000:
        factors.append(f"Extended operating hours ({req.operating_hours}h)")
    if req.vibration > 3.0:
        factors.append(f"Elevated vibration level ({req.vibration} mm/s)")
    if req.age_months > 36:
        factors.append(f"Equipment age ({req.age_months} months)")
    if req.load_percentage > 80:
        factors.append(f"High load percentage ({req.load_percentage}%)")
    if req.maintenance_count < 2 and req.operating_hours > 3000:
        factors.append("Insufficient maintenance history")
    if not factors:
        factors.append("All parameters within normal operating range")
    return factors


def _recommend_actions(risk_level: str, factors: list) -> list:
    actions = []
    if risk_level in ("critical", "high"):
        actions.append("Schedule preventive maintenance within 48 hours")
        actions.append("Reduce operational load to 60% until inspection")
    if risk_level == "critical":
        actions.append("Prepare contingency plan for potential downtime")
    if any("temperature" in f.lower() for f in factors):
        actions.append("Inspect cooling system efficiency")
    if any("vibration" in f.lower() for f in factors):
        actions.append("Check bearing alignment and lubrication")
    if any("maintenance" in f.lower() for f in factors):
        actions.append("Review and update maintenance schedule")
    if risk_level == "low":
        actions.append("Continue normal operations — next check in 30 days")
    return actions
