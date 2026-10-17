from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import pandas as pd

class AyurvedaModel:
    """Class for training and using the Ayurvedic therapy recommendation model"""
    
    def __init__(self):
        self.model = None
        self.features = ["Disease", "Dominant_Dosha", "Severity_Score", "Age"]
        
    def train(self, X, y, grid_search=True):
        """Train the model with optional grid search for hyperparameters"""
        if grid_search:
            param_grid = {
                'n_estimators': [100, 200],
                'max_depth': [6, 8, 10, None],
                'min_samples_split': [2, 4],
            }
            self.model = GridSearchCV(
                RandomForestClassifier(random_state=42),
                param_grid,
                cv=3,
                n_jobs=-1
            )
        else:
            self.model = RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                random_state=42
            )
        
        self.model.fit(X, y)
        
        if grid_search:
            print(f"Best Parameters: {self.model.best_params_}")
            self.model = self.model.best_estimator_
    
    def evaluate(self, X_test, y_test):
        """Evaluate the model's performance"""
        y_pred = self.model.predict(X_test)
        acc = round(accuracy_score(y_test, y_pred) * 100, 2)
        
        print(f"🎯 Model Accuracy: {acc}%")
        print("\n📊 Classification Report:")
        print(classification_report(y_test, y_pred, zero_division=1))
        
        return acc
    
    def predict(self, X):
        """Make predictions using the trained model"""
        predictions = self.model.predict(X)
        confidences = self.model.predict_proba(X).max(axis=1) * 100
        return predictions, confidences
    
    def save_model(self, filename="ayurveda_model.pkl"):
        """Save the trained model"""
        joblib.dump(self.model, filename)
        print(f"✅ Model saved: {filename}")
    
    def load_model(self, filename="ayurveda_model.pkl"):
        """Load a trained model"""
        self.model = joblib.load(filename)
        print(f"✅ Model loaded: {filename}")