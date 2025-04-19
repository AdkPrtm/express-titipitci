import { Router } from 'express';
import { validate } from '../middlewares/validator.middleware';
import { createUserSchema } from '../validations/user.validation';
import userController from '../controllers/user.controller';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', validate(createUserSchema), userController.createUser);
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  cacheMiddleware({ keyPrefix: 'users', ttl: 600 }),
  userController.getAllUser,
);
router.get(
  '/:id',
  cacheMiddleware({ keyPrefix: 'user', ttl: 600 }),
  userController.getuserById,
);

export default router;
