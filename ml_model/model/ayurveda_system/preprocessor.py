from sklearn.preprocessing import LabelEncoder
import pandas as pd
import joblib

class DataPreprocessor:
    """Class for preprocessing Ayurvedic patient data"""
    
    def __init__(self):
        self.encoders = {}
        self.categorical_columns = [
            "Gender", "Disease", "Dominant_Dosha", 
            "Lifestyle", "Stress_Level", "Recommended_Therapy"
        ]
        
    def fit_transform(self, df):
        """Fit and transform the data using label encoders"""
        df = df.copy()
        
        for col in self.categorical_columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            self.encoders[col] = le
            
        return df
    
    def transform(self, df):
        """Transform new data using fitted encoders"""
        df = df.copy()
        
        for col in self.categorical_columns:
            if col in df.columns and col in self.encoders:
                le = self.encoders[col]
                # Handle unseen values
                df[col] = df[col].map(lambda x: x if x in le.classes_ else le.classes_[0])
                df[col] = le.transform(df[col])
                
        return df
    
    def save_encoders(self, prefix="encoder_"):
        """Save label encoders to files"""
        for col, encoder in self.encoders.items():
            joblib.dump(encoder, f"{prefix}{col}.pkl")
        print("✅ Encoders saved successfully!")
    
    def load_encoders(self, prefix="encoder_"):
        """Load label encoders from files"""
        for col in self.categorical_columns:
            try:
                self.encoders[col] = joblib.load(f"{prefix}{col}.pkl")
            except FileNotFoundError:
                print(f"Warning: Encoder for {col} not found")