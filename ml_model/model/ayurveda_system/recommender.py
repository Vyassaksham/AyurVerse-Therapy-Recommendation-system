import pandas as pd

class AyurvedaRecommender:
    """Class for making Ayurvedic therapy recommendations"""
    
    def __init__(self, model, preprocessor):
        self.model = model
        self.preprocessor = preprocessor
    
    def determine_dosha(self, age, lifestyle, stress, severity):
        """Automatically determine dominant Dosha based on patient characteristics"""
        # Calculate scores for each Dosha based on characteristics
        vata_score = 0
        pitta_score = 0
        kapha_score = 0
        
        # Age-based scoring
        if age < 30:
            kapha_score += 2
        elif age < 50:
            pitta_score += 2
        else:
            vata_score += 2
            
        # Lifestyle-based scoring
        if lifestyle == "Active":
            vata_score += 2
            pitta_score += 1
        elif lifestyle == "Moderate":
            pitta_score += 2
        else:  # Sedentary
            kapha_score += 2
            
        # Stress-based scoring
        if stress == "High":
            vata_score += 2
            pitta_score += 1
        elif stress == "Medium":
            pitta_score += 2
        else:  # Low
            kapha_score += 2
            
        # Severity-based scoring
        if severity >= 7:
            vata_score += 1
            pitta_score += 2
        elif severity >= 4:
            pitta_score += 1
            kapha_score += 1
        else:
            kapha_score += 2
            
        # Determine dominant Dosha
        scores = {
            "Vata": vata_score,
            "Pitta": pitta_score,
            "Kapha": kapha_score
        }
        return max(scores, key=scores.get)
    
    def validate_input(self, age, gender, disease, lifestyle, stress, severity):
        """Validate user input"""
        if not (18 <= age <= 100):
            raise ValueError("Age must be between 18 and 100")
        
        if gender not in ["Male", "Female"]:
            raise ValueError("Gender must be 'Male' or 'Female'")
        
        if severity not in range(1, 11):
            raise ValueError("Severity must be between 1 and 10")
        
        if stress not in ["Low", "Medium", "High"]:
            raise ValueError("Stress level must be Low, Medium, or High")
        
        if lifestyle not in ["Sedentary", "Moderate", "Active"]:
            raise ValueError("Lifestyle must be Sedentary, Moderate, or Active")
    
    def format_recommendation(self, age, gender, disease, dosha, severity, therapy, confidence):
        """Format the recommendation output"""
        output = "\n💡 Recommended Ayurvedic Therapy:\n"
        output += "===================================\n"
        output += f"👤 Age: {age}\n"
        output += f"🚻 Gender: {gender}\n"
        output += f"🩺 Disease: {disease}\n"
        output += f"🧘 Dominant Dosha: {dosha}\n"
        output += f"🔥 Severity: {severity}\n"
        output += "-----------------------------------\n"
        output += f"🌿 Suggested Therapy: {therapy}\n"
        output += f"📊 Confidence: {confidence}%\n"
        output += "===================================\n"
        return output
    
    def get_recommendation(self, age, gender, disease, lifestyle, stress, severity):
        """Get therapy recommendation for a patient"""
        try:
            # Validate input
            self.validate_input(age, gender, disease, lifestyle, stress, severity)
            
            # Determine dosha automatically
            dosha = self.determine_dosha(age, lifestyle, stress, severity)
            
            # Prepare input data
            input_data = pd.DataFrame([{
                "Age": age,
                "Gender": gender,
                "Disease": disease,
                "Dominant_Dosha": dosha,
                "Lifestyle": lifestyle,
                "Stress_Level": stress,
                "Severity_Score": severity
            }])
            
            # Preprocess input
            processed_data = self.preprocessor.transform(input_data)
            features = processed_data[["Disease", "Dominant_Dosha", "Severity_Score", "Age"]]
            
            # Get prediction
            pred, conf = self.model.predict(features)
            therapy = self.preprocessor.encoders["Recommended_Therapy"].inverse_transform(pred)[0]
            
            # Format output
            return self.format_recommendation(
                age, gender, disease, dosha, severity, therapy, round(conf[0], 2)
            )
            
        except Exception as e:
            return f"Error: {str(e)}"