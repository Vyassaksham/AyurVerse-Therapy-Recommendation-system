import React, { useState } from 'react';

const TherapyPredictor = () => {
  const [formData, setFormData] = useState({
    age: '',
    symptoms: '',
    medicalHistory: '',
    lifestyle: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Prediction failed');
      
      setPrediction(data);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    prediction,
    loading,
    error,
    handleChange,
    handleSubmit
  };
};

export default TherapyPredictor;