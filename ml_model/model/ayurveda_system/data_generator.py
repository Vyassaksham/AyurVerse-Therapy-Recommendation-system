import numpy as np
import pandas as pd

class AyurvedaDataGenerator:
    """Class for generating synthetic Ayurvedic patient data"""
    
    def __init__(self, seed=42):
        np.random.seed(seed)
        self.therapy_map = {
            "Anxiety": ["Shirodhara", "Abhyanga", "Meditation"],
            "Insomnia": ["Shirodhara", "Nasya", "Yoga Therapy"],
            "Joint Pain": ["Panchakarma", "Kizhi", "Abhyanga"],
            "Digestive Issues": ["Virechana", "Herbal Therapy", "Diet Correction"],
            "Stress": ["Shirodhara", "Meditation", "Abhyanga"],
            "Skin Disorders": ["Vamana", "Herbal Therapy", "Detox Therapy"],
            "Obesity": ["Udwarthanam", "Virechana", "Diet Correction"],
            "Diabetes": ["Vamana", "Herbal Therapy", "Yoga Therapy"],
            "Migraine": ["Nasya", "Shirodhara", "Abhyanga"],
            "Back Pain": ["Panchakarma", "Kizhi", "Abhyanga"]
        }
        
        self.dosha_map = {
            "Anxiety": "Vata",
            "Insomnia": "Vata",
            "Joint Pain": "Vata",
            "Digestive Issues": "Pitta",
            "Stress": "Pitta",
            "Skin Disorders": "Pitta",
            "Obesity": "Kapha",
            "Diabetes": "Kapha",
            "Migraine": "Vata",
            "Back Pain": "Vata"
        }
        
        self.genders = ["Male", "Female"]
        self.lifestyles = ["Sedentary", "Moderate", "Active"]
        self.stress_levels = ["Low", "Medium", "High"]

    def generate_data(self, n_samples=500):
        """Generate synthetic patient data"""
        data = []
        
        for _ in range(n_samples):
            age = np.random.randint(18, 70)
            gender = np.random.choice(self.genders)
            disease = np.random.choice(list(self.therapy_map.keys()))
            dosha = self.dosha_map[disease]
            severity = np.random.randint(1, 11)
            lifestyle = np.random.choice(self.lifestyles)
            stress = np.random.choice(self.stress_levels, p=[0.3, 0.5, 0.2])
            
            # Logical therapy assignment
            if np.random.rand() < 0.85:
                therapy = np.random.choice(self.therapy_map[disease])
            else:
                therapy = np.random.choice(sum(self.therapy_map.values(), []))
            
            data.append([age, gender, disease, dosha, lifestyle, stress, severity, therapy])
        
        return pd.DataFrame(data, columns=[
            "Age", "Gender", "Disease", "Dominant_Dosha", 
            "Lifestyle", "Stress_Level", "Severity_Score", 
            "Recommended_Therapy"
        ])

    def save_data(self, df, filename="ayurvedic_patients.csv"):
        """Save generated data to CSV file"""
        df.to_csv(filename, index=False)
        print(f"✅ Dataset created: {filename}")