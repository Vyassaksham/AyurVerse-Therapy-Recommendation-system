import express from 'express';
import { predictTherapy } from '../controllers/mlController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/predict', authMiddleware, predictTherapy);

export default router;