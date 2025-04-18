import { Router } from 'express';
import { validate } from '../middlewares/validator.middleware';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), authController.registerUser)
router.post('/login', validate(loginSchema), authController.registerUser)

export default router