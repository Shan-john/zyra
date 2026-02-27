"""Pydantic request schemas."""

from pydantic import BaseModel, Field
from typing import Optional

class FailurePredictionRequest(BaseModel):
    equipment_id: str = Field(..., description="Unique equipment identifier")
    operating_hours: float = Field(..., ge=0, description="Total operating hours")
    temperature: float = Field(..., description="Current temperature in Celsius")
    vibration: float = Field(default=0.0, ge=0, description="Vibration level (mm/s)")
    pressure: float = Field(default=0.0, ge=0, description="Operating pressure (PSI)")
    age_months: int = Field(default=12, ge=0, description="Equipment age in months")
    maintenance_count: int = Field(default=0, ge=0, description="Number of past maintenance events")
    load_percentage: float = Field(default=50.0, ge=0, le=100, description="Current load percentage")

    class Config:
        json_schema_extra = {
            "example": {
                "equipment_id": "EQUIP-001",
                "operating_hours": 4500,
                "temperature": 85.0,
                "vibration": 2.3,
                "pressure": 120.0,
                "age_months": 36,
                "maintenance_count": 5,
                "load_percentage": 78.0,
            }
        }
