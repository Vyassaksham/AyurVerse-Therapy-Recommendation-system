import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

# Create model directory if it doesn't exist
model_dir = 'model'
os.makedirs(model_dir, exist_ok=True)

# Read the dataset
df = pd.read_csv('ayurvedic_patients.csv')

# Initialize label encoders
label_encoders = {
    'Gender': LabelEncoder(),
    'Disease': LabelEncoder(),
    'Lifestyle': LabelEncoder(),
    'Stress_Level': LabelEncoder(),
    'Recommended_Therapy': LabelEncoder()
}

# Encode categorical columns
df['Gender_encoded'] = label_encoders['Gender'].fit_transform(df['Gender'])
df['Disease_encoded'] = label_encoders['Disease'].fit_transform(df['Disease'])
df['Lifestyle_encoded'] = label_encoders['Lifestyle'].fit_transform(df['Lifestyle'])
df['Stress_Level_encoded'] = label_encoders['Stress_Level'].fit_transform(df['Stress_Level'])
df['Therapy_encoded'] = label_encoders['Recommended_Therapy'].fit_transform(df['Recommended_Therapy'])

# Prepare features and target
features = ['Age', 'Gender_encoded', 'Disease_encoded', 'Lifestyle_encoded', 'Stress_Level_encoded', 'Severity_Score']
X = df[features]
y = df['Therapy_encoded']

# Train test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model and encoders using protocol=4 (compatible with Python 3.4+)
with open(os.path.join(model_dir, 'ayurveda_model.pkl'), 'wb') as f:
    pickle.dump(model, f, protocol=4)

for feature, encoder in label_encoders.items():
    filename = f'encoder_{feature}.pkl'
    with open(os.path.join(model_dir, filename), 'wb') as f:
        pickle.dump(encoder, f, protocol=4)

# Test accuracy
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)

print(f'Training accuracy: {train_score:.2f}')
print(f'Testing accuracy: {test_score:.2f}')

# Test prediction
sample = X_test.iloc[0]
pred = model.predict([sample])
pred_therapy = label_encoders['Recommended_Therapy'].inverse_transform(pred)[0]
print(f'\nSample prediction: {pred_therapy}')