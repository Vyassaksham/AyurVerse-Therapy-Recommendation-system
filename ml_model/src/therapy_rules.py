
"""
AyurVerse Therapy Recommendation Rules

This module contains transparent demo recommendation rules.
It does not provide a medical diagnosis or clinically validated treatment.
All therapy mappings must be reviewed by a qualified Ayurvedic practitioner.
"""

THERAPY_DESCRIPTIONS = {
    "Abhyanga": (
        "A traditional Ayurvedic massage using herbal oils, "
        "commonly associated with relaxation and wellness."
    ),
    "Diet Correction": (
        "Dietary guidance based on individual needs and "
        "Ayurvedic principles."
    ),
    "Detox Therapy": (
        "A practitioner-guided wellness approach that requires "
        "individual assessment."
    ),
    "Herbal Therapy": (
        "A practitioner-guided approach involving selected "
        "herbal preparations."
    ),
    "Kizhi": (
        "A traditional therapy using heated herbal pouches, "
        "which requires practitioner assessment."
    ),
    "Meditation": (
        "A mindfulness and relaxation practice that may support "
        "general stress management."
    ),
    "Nasya": (
        "A traditional Ayurvedic procedure involving nasal "
        "administration, requiring professional assessment."
    ),
    "Panchakarma": (
        "A set of traditional Ayurvedic procedures that require "
        "individual assessment by a qualified practitioner."
    ),
    "Shirodhara": (
        "A traditional relaxation procedure involving a steady "
        "stream of liquid applied to the forehead."
    ),
    "Udwarthanam": (
        "A traditional dry-powder massage procedure requiring "
        "professional assessment."
    ),
    "Vamana": (
        "A specialized Ayurvedic procedure that must only be "
        "considered and supervised by a qualified practitioner."
    ),
    "Virechana": (
        "A specialized Ayurvedic procedure that must only be "
        "considered and supervised by a qualified practitioner."
    ),
    "Yoga Therapy": (
        "A guided practice involving suitable yoga postures "
        "and breathing exercises."
    ),
}


# Demo mapping based on the therapy options in the old project.
# These mappings are not clinically validated.
DISEASE_THERAPY_MAP = {
    "Anxiety": "Meditation",
    "Insomnia": "Yoga Therapy",
    "Joint Pain": "Abhyanga",
    "Digestive Issues": "Diet Correction",
    "Stress": "Meditation",
    "Skin Disorders": "Herbal Therapy",
    "Obesity": "Diet Correction",
    "Diabetes": "Diet Correction",
    "Migraine": "Nasya",
    "Back Pain": "Abhyanga",
}


def recommend_therapy(disease: str) -> dict:
    """
    Return a demo therapy recommendation for a health concern.

    Args:
        disease: Primary health concern selected by the user.

    Returns:
        Dictionary containing therapy and description.
    """

    if not isinstance(disease, str):
        raise ValueError("Disease must be a string.")

    disease = disease.strip()

    if disease not in DISEASE_THERAPY_MAP:
        raise ValueError("Unsupported health condition.")

    therapy = DISEASE_THERAPY_MAP[disease]

    return {
        "therapy": therapy,
        "description": THERAPY_DESCRIPTIONS[therapy],
    }
