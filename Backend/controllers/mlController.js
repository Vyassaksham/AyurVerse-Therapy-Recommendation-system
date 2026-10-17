import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const predictTherapy = async (req, res) => {
  try {
    const { age, gender, disease, lifestyle, stressLevel, severityScore } = req.body;

    // Validate required inputs
    if (!age || !gender || !disease || !lifestyle || !stressLevel || !severityScore) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide age, gender, disease, lifestyle, stressLevel, and severityScore.' 
      });
    }

    // Validate values
    if (age < 18 || age > 100) {
      return res.status(400).json({ error: 'Age must be between 18 and 100' });
    }

    if (!['Male', 'Female'].includes(gender)) {
      return res.status(400).json({ error: 'Gender must be Male or Female' });
    }

    const validDiseases = [
      'Diabetes', 'Digestive Issues', 'Insomnia', 'Back Pain',
      'Stress', 'Migraine', 'Anxiety', 'Joint Pain', 
      'Obesity', 'Skin Disorders'
    ];
    if (!validDiseases.includes(disease)) {
      return res.status(400).json({ 
        error: `Disease must be one of: ${validDiseases.join(', ')}` 
      });
    }

    if (!['Active', 'Moderate', 'Sedentary'].includes(lifestyle)) {
      return res.status(400).json({ 
        error: 'Lifestyle must be Active, Moderate, or Sedentary' 
      });
    }

    if (!['Low', 'Medium', 'High'].includes(stressLevel)) {
      return res.status(400).json({ 
        error: 'Stress level must be Low, Medium, or High' 
      });
    }

    if (severityScore < 1 || severityScore > 10) {
      return res.status(400).json({ 
        error: 'Severity score must be between 1 and 10' 
      });
    }

    console.log('Starting prediction with data:', { age, gender, disease, lifestyle, stressLevel, severityScore });

    // Spawn Python process to run ML model
    const pythonScript = path.join(__dirname, '../ml/predict_therapy.py');
    console.log('Python script path:', pythonScript);

    // Check if script exists
    try {
      await import('fs').then(fs => {
        if (!fs.existsSync(pythonScript)) {
          throw new Error(`Python script not found at ${pythonScript}`);
        }
      });
    } catch (err) {
      console.error('Script file error:', err);
      throw err;
    }
    
    const pythonProcess = spawn('python', [
      pythonScript,
      age.toString(),
      gender,
      disease,
      lifestyle,
      stressLevel,
      severityScore.toString()
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Python stdout:', output);
      result += output;
    });

    pythonProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      error += errorOutput;
      try {
        const debugInfo = JSON.parse(errorOutput);
        console.log('Python debug info:', debugInfo);
      } catch {
        console.error('Python stderr:', errorOutput);
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      throw err;
    });

    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}. Error: ${error}`));
        } else {
          resolve();
        }
      });
    });

    // Parse prediction result
    try {
      const prediction = JSON.parse(result.trim());
      if (!prediction.therapy) {
        throw new Error('Invalid prediction result: missing therapy');
      }
      res.json({
        recommendedTherapy: prediction.therapy,
        description: prediction.description
      });
    } catch (parseError) {
      console.error('Failed to parse prediction result:', parseError, 'Raw result:', result);
      throw new Error('Failed to parse prediction result');
    }

  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};