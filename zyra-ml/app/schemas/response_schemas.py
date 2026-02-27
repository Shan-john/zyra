"""Pydantic response schemas."""

from pydantic import BaseModel
from typing import List, Dict


class FeatureExplanation(BaseModel):
    feature: str
    value: float
    shap_value: float
    impact: float
    direction: str  # "increases" | "decreases"
    description: str


class FailurePredictionResponse(BaseModel):
    equipment_id: str
    failure_probability: float
    health_score: float  # 100 - (probability * 100)
    risk_level: str  # "low" | "medium" | "high" | "critical"
    feature_importance: Dict[str, float]  # global RF importance
    shap_explanation: List[FeatureExplanation]  # per-prediction SHAP
    recommended_actions: List[str]
    model_metrics: Dict  # accuracy, f1, roc_auc

    class Config:
        json_schema_extra = {
            "example": {
                "equipment_id": "EQUIP-001",
                "failure_probability": 0.73,
                "health_score": 27.0,
                "risk_level": "high",
                "feature_importance": {
                    "temperature": 0.2541,
                    "operating_hours": 0.1823,
                    "vibration": 0.1456,
                },
                "shap_explanation": [
                    {
                        "feature": "temperature",
                        "value": 92.5,
                        "shap_value": 0.1234,
                        "impact": 0.1234,
                        "direction": "increases",
                        "description": "temperature=92.5 increases failure risk by 12.3%",
                    }
                ],
                "recommended_actions": [
                    "⚠️ Schedule preventive maintenance within 48 hours",
                    "🌡️ Temperature is 92.5°C — inspect cooling system",
                ],
                "model_metrics": {
                    "accuracy": 0.89,
                    "f1_score": 0.88,
                    "roc_auc": 0.94,
                },
            }
        }
