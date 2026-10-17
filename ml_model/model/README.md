# Ayurvedic Therapy Recommendation System

A machine learning-based system for recommending Ayurvedic therapies based on patient characteristics and symptoms.

## Features

- Synthetic data generation for training
- Preprocessing with label encoding
- RandomForest model with hyperparameter tuning
- Interactive therapy recommendations
- Confidence scores for predictions
- Input validation and error handling

## Installation

1. Clone this repository
2. Install the required packages:
```bash
pip install -e .
```

## Usage

Run the main script:
```bash
python -m ayurveda_system.main
```

The system will:
1. Generate synthetic training data
2. Train the model
3. Start an interactive recommendation session

## Project Structure

- `ayurveda_system/`
  - `data_generator.py`: Synthetic data generation
  - `preprocessor.py`: Data preprocessing
  - `model.py`: Machine learning model
  - `recommender.py`: Recommendation system
  - `main.py`: Main application

## Dependencies

- Python 3.8+
- NumPy
- Pandas
- scikit-learn
- joblib

## License

MIT License