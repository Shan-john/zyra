"""
Zyra ML Microservice — FastAPI entry point.
Provides equipment failure prediction via a trained ML model.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict, health

app = FastAPI(
    title="Zyra ML Service",
    description="Machine Learning microservice for equipment failure prediction",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, tags=["Health"])
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])

@app.on_event("startup")
async def startup_event():
    """Load ML model on startup."""
    from app.models.model_loader import load_model
    load_model()
    print("🚀 Zyra ML Service started — model loaded")
