
const ML_API_URL =
  process.env.ML_API_URL || 'http://127.0.0.1:8000';

const validDiseases = [
  'Diabetes',
  'Digestive Issues',
  'Insomnia',
  'Back Pain',
  'Stress',
  'Migraine',
  'Anxiety',
  'Joint Pain',
  'Obesity',
  'Skin Disorders',
];

export const predictTherapy = async (req, res) => {
  try {
    const {
      age,
      gender,
      disease,
      lifestyle,
      stressLevel,
      severityScore,
    } = req.body;

    // Validate required fields without rejecting numeric values like 0
    if (
      age === undefined ||
      gender === undefined ||
      disease === undefined ||
      lifestyle === undefined ||
      stressLevel === undefined ||
      severityScore === undefined
    ) {
      return res.status(400).json({
        error:
          'Please provide age, gender, disease, lifestyle, stressLevel, and severityScore.',
      });
    }

    const numericAge = Number(age);
    const numericSeverity = Number(severityScore);

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 18 ||
      numericAge > 100
    ) {
      return res.status(400).json({
        error: 'Age must be an integer between 18 and 100.',
      });
    }

    if (!['Male', 'Female'].includes(gender)) {
      return res.status(400).json({
        error: 'Gender must be Male or Female.',
      });
    }

    if (!validDiseases.includes(disease)) {
      return res.status(400).json({
        error: `Disease must be one of: ${validDiseases.join(', ')}`,
      });
    }

    if (!['Active', 'Moderate', 'Sedentary'].includes(lifestyle)) {
      return res.status(400).json({
        error: 'Lifestyle must be Active, Moderate, or Sedentary.',
      });
    }

    if (!['Low', 'Medium', 'High'].includes(stressLevel)) {
      return res.status(400).json({
        error: 'Stress level must be Low, Medium, or High.',
      });
    }

    if (
      !Number.isInteger(numericSeverity) ||
      numericSeverity < 1 ||
      numericSeverity > 10
    ) {
      return res.status(400).json({
        error: 'Severity score must be an integer between 1 and 10.',
      });
    }

    const input = {
      age: numericAge,
      gender,
      disease,
      lifestyle,
      stressLevel,
      severityScore: numericSeverity,
    };

    // Send the request to the already-running FastAPI ML service.
    const response = await fetch(`${ML_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(15000),
    });

    const prediction = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          prediction.detail ||
          prediction.error ||
          'ML service returned an error.',
      });
    }

    if (!prediction.therapy) {
      console.error('Invalid ML response:', prediction);

      return res.status(502).json({
        error: 'ML service returned an invalid prediction.',
      });
    }

    // Preserve the response format expected by the frontend.
    return res.json({
      recommendedTherapy: prediction.therapy,
      description: prediction.description,
    });
  } catch (error) {
    console.error('Therapy prediction error:', error.message);

    if (
      error.name === 'TimeoutError' ||
      error.name === 'AbortError'
    ) {
      return res.status(504).json({
        error: 'ML service request timed out.',
      });
    }

    if (error.cause || error.name === 'TypeError') {
      return res.status(503).json({
        error:
          'Unable to connect to the ML service. Make sure FastAPI is running.',
      });
    }

    return res.status(500).json({
      error: 'Internal server error during therapy prediction.',
    });
  }
};
