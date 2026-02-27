"""Pydantic request schemas."""

from pydantic import BaseModel, Field


class FailurePredictionRequest(BaseModel):
    equipment_id: str = Field(..., description="Unique equipment identifier")
    operating_hours: float = Field(..., ge=0, description="Total operating hours")
    temperature: float = Field(..., description="Current temperature in Celsius")
    vibration: float = Field(default=0.0, ge=0, description="Vibration level (mm/s)")
    pressure: float = Field(default=100.0, ge=0, description="Operating pressure (PSI)")
    age_months: int = Field(default=12, ge=0, description="Equipment age in months")
    maintenance_count: int = Field(default=0, ge=0, description="Past maintenance events")
    load_percentage: float = Field(default=50.0, ge=0, le=100, description="Current load %")
    rpm: float = Field(default=2500.0, ge=0, description="Rotations per minute")
    humidity: float = Field(default=50.0, ge=0, le=100, description="Ambient humidity %")
    power_consumption: float = Field(default=500.0, ge=0, description="Power consumption (kW)")

    class Config:
        json_schema_extra = {
            "example": {
                "equipment_id": "EQUIP-001",
                "operating_hours": 8500,
                "temperature": 92.5,
                "vibration": 4.8,
                "pressure": 165.0,
                "age_months": 48,
                "maintenance_count": 3,
                "load_percentage": 88.0,
                "rpm": 3200,
                "humidity": 72.0,
                "power_consumption": 1450.0,
            }
        }
