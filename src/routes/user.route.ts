import { validate } from '../middlewares/validator.middleware';
import { createUserSchema } from '../validations/user.validation';
import userController from '../controllers/user.controller';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Router } from 'express';

const router = Router();

router.post(
  '/',
  validate(createUserSchema),
  authenticate,
  authorize('ADMIN'),
  userController.createUser,
);
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'CASHIER'),
  cacheMiddleware({ keyPrefix: 'users', ttl: 600 }),
  userController.getAllUser,
);

router.get(
  '/total',
  authenticate,
  authorize('ADMIN', 'CASHIER'),
  cacheMiddleware({ keyPrefix: 'users', ttl: 600 }),
  userController.getTotalUser,
);

router.get(
  '/search',
  cacheMiddleware({ keyPrefix: 'user', ttl: 600 }),
  userController.getuserById,
);

export default router;
