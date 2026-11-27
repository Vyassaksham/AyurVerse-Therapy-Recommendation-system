
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.predict import predict_therapy


app = FastAPI(
    title="AyurVerse Therapy Recommendation API",
    description="API for Ayurvedic therapy recommendations.",
    version="1.0.0",
)


class PredictionRequest(BaseModel):
    age: int = Field(..., ge=18, le=100)
    gender: Literal["Male", "Female"]
    disease: str
    lifestyle: Literal["Active", "Moderate", "Sedentary"]
    stressLevel: Literal["Low", "Medium", "High"]
    severityScore: int = Field(..., ge=1, le=10)


@app.get("/")
def home():
    return {
        "message": "AyurVerse Therapy Recommendation API is running"
    }


@app.get("/check")
def health_check():
    return {"status": "healthy"}


@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        result = predict_therapy(request.model_dump())
        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
