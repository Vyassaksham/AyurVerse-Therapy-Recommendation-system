
"""
AyurVerse input validation and preprocessing.
"""

VALID_GENDERS = {"Male", "Female"}

VALID_DISEASES = {
    "Diabetes",
    "Digestive Issues",
    "Insomnia",
    "Back Pain",
    "Stress",
    "Migraine",
    "Anxiety",
    "Joint Pain",
    "Obesity",
    "Skin Disorders",
}

VALID_LIFESTYLES = {
    "Active",
    "Moderate",
    "Sedentary",
}

VALID_STRESS_LEVELS = {
    "Low",
    "Medium",
    "High",
}


def validate_prediction_input(data: dict) -> dict:
    """
    Validate and normalize frontend prediction input.

    Expected fields:
    age, gender, disease, lifestyle,
    stressLevel, severityScore
    """

    if not isinstance(data, dict):
        raise ValueError("Input must be a JSON object.")

    required_fields = [
        "age",
        "gender",
        "disease",
        "lifestyle",
        "stressLevel",
        "severityScore",
    ]

    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")

    # Validate age
    try:
        age = int(data["age"])
    except (TypeError, ValueError):
        raise ValueError("Age must be a valid integer.")

    if age < 18 or age > 100:
        raise ValueError("Age must be between 18 and 100.")

    # Validate severity
    try:
        severity = int(data["severityScore"])
    except (TypeError, ValueError):
        raise ValueError("Severity score must be an integer.")

    if severity < 1 or severity > 10:
        raise ValueError("Severity score must be between 1 and 10.")

    # Validate categorical values
    gender = data["gender"]
    disease = data["disease"]
    lifestyle = data["lifestyle"]
    stress_level = data["stressLevel"]

    if gender not in VALID_GENDERS:
        raise ValueError("Gender must be Male or Female.")

    if disease not in VALID_DISEASES:
        raise ValueError("Invalid health condition.")

    if lifestyle not in VALID_LIFESTYLES:
        raise ValueError("Invalid lifestyle.")

    if stress_level not in VALID_STRESS_LEVELS:
        raise ValueError("Invalid stress level.")

    return {
        "age": age,
        "gender": gender,
        "disease": disease,
        "lifestyle": lifestyle,
        "stressLevel": stress_level,
        "severityScore": severity,
    }
