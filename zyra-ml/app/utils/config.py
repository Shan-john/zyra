"""Configuration from environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/zyra_erp")
MODEL_PATH = os.getenv("MODEL_PATH", "app/models/failure_model.pkl")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
