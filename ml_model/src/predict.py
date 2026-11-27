
from pathlib import Path

import joblib
import pandas as pd

from src.preprocessing import validate_prediction_input
from src.therapy_rules import THERAPY_DESCRIPTIONS


# Load the trained model once when the module starts.
MODEL_PATH = (
    Path(__file__).resolve().parents[1]
    / "artifacts"
    / "therapy_model.joblib"
)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model not found: {MODEL_PATH}. "
        "Run the training script first."
    )

model = joblib.load(MODEL_PATH)


def predict_therapy(data: dict) -> dict:
    """
    Validate input and predict therapy using the trained ML model.
    """

    validated_data = validate_prediction_input(data)

    input_df = pd.DataFrame([validated_data])

    therapy = model.predict(input_df)[0]

    description = THERAPY_DESCRIPTIONS.get(
        therapy,
        "This therapy recommendation requires review "
        "by a qualified Ayurvedic practitioner."
    )

    return {
        "therapy": str(therapy),
        "description": description,
    }
