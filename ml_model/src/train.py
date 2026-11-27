
from pathlib import Path
import json
import sys
from datetime import datetime, timezone

import pandas as pd
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
)


# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = PROJECT_ROOT / "data" / "therapy_dataset.csv"
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"

MODEL_PATH = ARTIFACTS_DIR / "therapy_model.joblib"
METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"


# Dataset columns
NUMERIC_FEATURES = [
    "age",
    "severityScore",
]

CATEGORICAL_FEATURES = [
    "gender",
    "disease",
    "lifestyle",
    "stressLevel",
]

TARGET_COLUMN = "therapy"

REQUIRED_COLUMNS = (
    NUMERIC_FEATURES
    + CATEGORICAL_FEATURES
    + [TARGET_COLUMN]
)


def load_dataset(path: Path) -> pd.DataFrame:
    """Load and validate the therapy training dataset."""

    if not path.exists():
        raise FileNotFoundError(
            f"Training dataset not found: {path}\n"
            "Create data/therapy_dataset.csv before training."
        )

    df = pd.read_csv(path)

    missing_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Dataset is missing columns: {missing_columns}"
        )

    df = df[REQUIRED_COLUMNS].copy()

    # Remove rows with no target label.
    df = df.dropna(subset=[TARGET_COLUMN])

    # Convert numerical features to numeric values.
    for column in NUMERIC_FEATURES:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Remove rows with invalid target values.
    df[TARGET_COLUMN] = (
        df[TARGET_COLUMN]
        .astype(str)
        .str.strip()
    )

    df = df[
        df[TARGET_COLUMN].ne("")
        & df[TARGET_COLUMN].ne("nan")
    ]

    if df.empty:
        raise ValueError(
            "Dataset contains no valid training rows."
        )

    # Check input ranges.
    df = df[
        df["age"].between(18, 100)
        & df["severityScore"].between(1, 10)
    ]

    if df.empty:
        raise ValueError(
            "No rows remain after validating age and severity."
        )

    # Normalize text fields.
    for column in CATEGORICAL_FEATURES:
        df[column] = (
            df[column]
            .astype(str)
            .str.strip()
        )

    print(f"Dataset loaded: {len(df)} rows")
    print(f"Therapy classes: {df[TARGET_COLUMN].nunique()}")

    return df


def build_pipeline() -> Pipeline:
    """Create preprocessing and classification pipeline."""

    numeric_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="median")
            ),
            (
                "scaler",
                StandardScaler()
            ),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="most_frequent")
            ),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore")
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                numeric_pipeline,
                NUMERIC_FEATURES
            ),
            (
                "categorical",
                categorical_pipeline,
                CATEGORICAL_FEATURES
            ),
        ]
    )

    classifier = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )


def main():
    print("Starting AyurVerse model training...")

    try:
        df = load_dataset(DATA_PATH)

        X = df[
            NUMERIC_FEATURES + CATEGORICAL_FEATURES
        ]

        y = df[TARGET_COLUMN]

        if y.nunique() < 2:
            raise ValueError(
                "Training requires at least two therapy classes."
            )

        class_counts = y.value_counts()

        # Stratification requires at least two examples
        # in every class.
        can_stratify = (
            class_counts.min() >= 2
            and len(df) >= 10
        )

        stratify = y if can_stratify else None

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=stratify,
        )

        model = build_pipeline()

        print("Training model...")
        model.fit(X_train, y_train)

        print("Evaluating model...")
        predictions = model.predict(X_test)

        accuracy = accuracy_score(
            y_test,
            predictions
        )

        balanced_accuracy = balanced_accuracy_score(
            y_test,
            predictions
        )

        baseline_accuracy = (
            y_train.value_counts(normalize=True).max()
        )

        print(f"Test accuracy: {accuracy:.4f}")
        print(
            f"Balanced accuracy: "
            f"{balanced_accuracy:.4f}"
        )
        print(
            f"Majority-class baseline: "
            f"{baseline_accuracy:.4f}"
        )

        print("\nClassification report:")
        print(
            classification_report(
                y_test,
                predictions,
                zero_division=0
            )
        )

        ARTIFACTS_DIR.mkdir(
            parents=True,
            exist_ok=True
        )

        joblib.dump(model, MODEL_PATH)

        metadata = {
            "model_name": "RandomForestClassifier",
            "created_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "dataset_rows": int(len(df)),
            "training_rows": int(len(X_train)),
            "testing_rows": int(len(X_test)),
            "features": (
                NUMERIC_FEATURES
                + CATEGORICAL_FEATURES
            ),
            "target": TARGET_COLUMN,
            "therapy_classes": sorted(
                y.unique().tolist()
            ),
            "test_accuracy": float(accuracy),
            "balanced_accuracy": float(
                balanced_accuracy
            ),
            "majority_baseline_accuracy": float(
                baseline_accuracy
            ),
        }

        with open(
            METADATA_PATH,
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(
                metadata,
                file,
                indent=4
            )

        print("\nTraining completed.")
        print(f"Model saved to: {MODEL_PATH}")
        print(f"Metadata saved to: {METADATA_PATH}")

    except Exception as error:
        print(f"\nTraining failed: {error}")
        sys.exit(1)


if __name__ == "__main__":
    main()
