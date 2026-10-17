#!/usr/bin/env python
import sys
import json
import pickle
import numpy as np
import os

def load_model(model_path):
    with open(model_path, 'rb') as f:
        return pickle.load(f)

def predict_therapy(age, gender, disease, lifestyle, stress_level, severity_score):
    # Load model and encoders
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up two levels to project root
    project_root = os.path.dirname(os.path.dirname(script_dir))
    model_dir = os.path.join(project_root, 'ml_model/model')
    
    model = load_model(os.path.join(model_dir, 'ayurveda_model.pkl'))
    le_therapy = load_model(os.path.join(model_dir, 'encoder_Recommended_Therapy.pkl'))
    le_gender = load_model(os.path.join(model_dir, 'encoder_Gender.pkl'))
    le_disease = load_model(os.path.join(model_dir, 'encoder_Disease.pkl'))
    le_lifestyle = load_model(os.path.join(model_dir, 'encoder_Lifestyle.pkl'))
    le_stress = load_model(os.path.join(model_dir, 'encoder_Stress_Level.pkl'))

    # Encode categorical inputs
    gender_encoded = le_gender.transform([gender])[0]
    disease_encoded = le_disease.transform([disease])[0] 
    lifestyle_encoded = le_lifestyle.transform([lifestyle])[0]
    stress_encoded = le_stress.transform([stress_level])[0]

    # Create feature vector
    features = np.array([[
        age,
        gender_encoded,
        disease_encoded,
        lifestyle_encoded,
        stress_encoded,
        severity_score
    ]])

    # Get prediction and probability
    therapy_pred = model.predict(features)
    probabilities = model.predict_proba(features)
    confidence = round(np.max(probabilities) * 100, 2)

    recommended_therapy = le_therapy.inverse_transform(therapy_pred)[0]

    # Get description for recommended therapy
    therapy_descriptions = {
        'Abhyanga': 'A traditional Ayurvedic massage therapy using warm herb-infused oils to reduce stress and promote relaxation.',
        'Diet Correction': 'A personalized dietary plan based on Ayurvedic principles to improve digestion and overall health.',
        'Detox Therapy': 'A comprehensive cleansing program to remove toxins and restore body balance.',
        'Herbal Therapy': 'Treatment using medicinal herbs and formulations based on Ayurvedic principles.',
        'Kizhi': 'A therapeutic treatment using heated herbal pouches to relieve pain and inflammation.',
        'Meditation': 'Guided mental relaxation techniques to reduce stress and anxiety.',
        'Nasya': 'Nasal administration of herbal oils to treat conditions affecting the head and neck.',
        'Panchakarma': 'A comprehensive detoxification and rejuvenation program using multiple Ayurvedic therapies.',
        'Shirodhara': 'A relaxing therapy where warm oil is continuously poured over the forehead to calm the mind.',
        'Udwarthanam': 'A dry powder massage therapy that helps reduce fat deposits and improve circulation.',
        'Vamana': 'A therapeutic emesis treatment to remove excess Kapha from the body.',
        'Virechana': 'A therapeutic purgation treatment to remove excess Pitta from the body.',
        'Yoga Therapy': 'Customized yoga practices to improve flexibility, strength and overall wellness.'
    }

    return {
        'therapy': recommended_therapy,
        'confidence': confidence,
        'description': therapy_descriptions.get(recommended_therapy, '')
    }

if __name__ == '__main__':
    try:
        # Get arguments
        print(json.dumps({'debug': 'Starting prediction with arguments: ' + str(sys.argv)}), file=sys.stderr)
        
        age = int(sys.argv[1])
        gender = sys.argv[2]
        disease = sys.argv[3]
        lifestyle = sys.argv[4]
        stress_level = sys.argv[5]
        severity_score = int(sys.argv[6])

        print(json.dumps({
            'debug': 'Loading model files from: ' + os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'ml_model/model')
        }), file=sys.stderr)

        # Make prediction
        result = predict_therapy(age, gender, disease, lifestyle, stress_level, severity_score)
        
        # Return result as JSON
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'traceback': traceback.format_exc(),
            'cwd': os.getcwd(),
            'script_dir': os.path.dirname(os.path.abspath(__file__))
        }
        print(json.dumps(error_details), file=sys.stderr)
        print(json.dumps({'error': str(e)}))
        sys.exit(1)