import { validate } from '../middlewares/validator.middleware';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import authController from '../controllers/auth.controller';
import { Router } from 'express';

const router = Router();

router.post('/register', validate(registerSchema), authController.registerUser);
router.post('/login', validate(loginSchema), authController.loginUser);

export default router;
