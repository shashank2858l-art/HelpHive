import { Router } from 'express';
import { googleLogin, login, me, register, updateCoordinates, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/google', googleLogin);
authRouter.get('/me', protect, me);
authRouter.put('/update-profile', protect, updateProfile);
authRouter.put('/coordinates', protect, updateCoordinates);
