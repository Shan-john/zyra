"""
Zyra ML Microservice — FastAPI Entry Point

Features:
  - Equipment failure prediction (RandomForestClassifier)
  - SHAP-based per-prediction explainability
  - Health score computation: 100 - (failure_probability × 100)
  - Model evaluation metrics (Accuracy, F1, ROC AUC)

Startup lifecycle:
  1. Train model if no artifacts exist
  2. Load model, scaler, metrics into memory
  3. Serve predictions via POST /predict
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import predict, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: train model if needed, then load artifacts."""
    import os
    from app.ml.training_pipeline import train_model, MODEL_PATH
    from app.models.model_loader import load_model

    if not os.path.exists(MODEL_PATH):
        print("🔄 No trained model found — running training pipeline...")
        train_model()

    load_model()
    print("🚀 Zyra ML Service ready")
    yield
    print("👋 Zyra ML Service shutting down")


app = FastAPI(
    title="Zyra ML Service",
    description="Equipment failure prediction with SHAP explainability",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, tags=["Health"])
app.include_router(predict.router, tags=["Prediction"])
