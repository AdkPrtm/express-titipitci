import { validate } from '../middlewares/validator.middleware';
import { loginSchema, registerSchema, updateDataAdminSchema, updatePasswordSchema } from '../validations/auth.validation';
import authController from '../controllers/auth.controller';
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema), authController.registerUser);
router.post('/login', validate(loginSchema), authController.loginUser);
router.put('/password', validate(updatePasswordSchema), authController.changePassword);
router.put('/', validate(updateDataAdminSchema), authController.updateUser);
router.post('/logout', authenticate, authController.logOutUser);
router.get('/me', authenticate, authController.getMe);

export default router;
