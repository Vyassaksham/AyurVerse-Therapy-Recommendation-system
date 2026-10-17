import pandas as pd
from ayurveda_system.data_generator import AyurvedaDataGenerator
from ayurveda_system.preprocessor import DataPreprocessor
from ayurveda_system.model import AyurvedaModel
from ayurveda_system.recommender import AyurvedaRecommender

def main():
    # Generate synthetic data
    print("Generating synthetic data...")
    generator = AyurvedaDataGenerator(seed=42)
    df = generator.generate_data(n_samples=500)
    generator.save_data(df)
    
    # Preprocess data
    print("\nPreprocessing data...")
    preprocessor = DataPreprocessor()
    processed_df = preprocessor.fit_transform(df)
    preprocessor.save_encoders()
    
    # Prepare features and target
    X = processed_df[["Disease", "Dominant_Dosha", "Severity_Score", "Age"]]
    y = processed_df["Recommended_Therapy"]
    
    # Train and evaluate model
    print("\nTraining model...")
    model = AyurvedaModel()
    model.train(X, y, grid_search=True)
    model.save_model()
    
    # Create recommender
    recommender = AyurvedaRecommender(model, preprocessor)
    
    # Interactive recommendation loop
    while True:
        print("\n🌿 Enter patient details for Ayurvedic Therapy Recommendation")
        print("(Press Ctrl+C to exit)\n")
        
        try:
            age = int(input("Age: "))
            gender = input("Gender (Male/Female): ").capitalize()
            disease = input("Disease (Anxiety/Insomnia/Diabetes/etc): ").title()
            lifestyle = input("Lifestyle (Sedentary/Moderate/Active): ").capitalize()
            stress = input("Stress Level (Low/Medium/High): ").capitalize()
            severity = int(input("Severity Score (1-10): "))
            
            recommendation = recommender.get_recommendation(
                age, gender, disease, lifestyle, stress, severity
            )
            print(recommendation)
            
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"\nError: {str(e)}")
            continue

if __name__ == "__main__":
    main()