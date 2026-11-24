import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/me', authenticateToken, getProfile);
