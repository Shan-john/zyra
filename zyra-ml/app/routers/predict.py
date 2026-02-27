"""Failure prediction endpoint."""

from fastapi import APIRouter, HTTPException
from app.schemas.request_schemas import FailurePredictionRequest
from app.schemas.response_schemas import FailurePredictionResponse
from app.services.prediction_service import predict_failure
from app.models.model_loader import get_metrics

router = APIRouter()


@router.post("/predict", response_model=FailurePredictionResponse)
async def predict_equipment_failure(request: FailurePredictionRequest):
    """
    Predict the probability of equipment failure.

    Returns:
    - failure_probability (0–1)
    - health_score (100 - probability × 100)
    - risk_level (low / medium / high / critical)
    - feature_importance (global RandomForest importance)
    - shap_explanation (per-prediction SHAP values)
    - recommended_actions (SHAP-driven recommendations)
    - model_metrics (accuracy, f1_score, roc_auc)
    """
    try:
        result = predict_failure(request)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/metrics")
async def get_model_metrics():
    """Return saved model evaluation metrics."""
    metrics = get_metrics()
    if metrics is None:
        raise HTTPException(status_code=404, detail="No model metrics available. Train the model first.")
    return {"success": True, "metrics": metrics}
