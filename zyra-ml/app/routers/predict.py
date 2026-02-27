"""Failure prediction endpoint."""

from fastapi import APIRouter, HTTPException
from app.schemas.request_schemas import FailurePredictionRequest
from app.schemas.response_schemas import FailurePredictionResponse
from app.services.prediction_service import predict_failure

router = APIRouter()

@router.post("/failure", response_model=FailurePredictionResponse)
async def predict_equipment_failure(request: FailurePredictionRequest):
    """
    Predict the probability of equipment failure based on operational parameters.
    """
    try:
        result = predict_failure(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
