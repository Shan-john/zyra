"""Pydantic response schemas."""

from pydantic import BaseModel
from typing import List, Optional

class FailurePredictionResponse(BaseModel):
    equipment_id: str
    failure_probability: float
    risk_level: str  # "low" | "medium" | "high" | "critical"
    contributing_factors: List[str]
    recommended_actions: List[str]
    confidence: float
    model_version: str = "1.0.0"

    class Config:
        json_schema_extra = {
            "example": {
                "equipment_id": "EQUIP-001",
                "failure_probability": 0.73,
                "risk_level": "high",
                "contributing_factors": [
                    "High operating temperature (85°C > 75°C threshold)",
                    "Extended operating hours without maintenance",
                    "Vibration level above normal range",
                ],
                "recommended_actions": [
                    "Schedule preventive maintenance within 48 hours",
                    "Reduce load to 60% until inspection",
                    "Check cooling system efficiency",
                ],
                "confidence": 0.89,
                "model_version": "1.0.0",
            }
        }
