import { logger } from '../utils/logger.util';
import { Router } from 'express';
import UserRoute from './user.route';
import AuthRoute from './auth.route';
import ResiRoute from './resi.route';
import TransaksiRoute from './transaksi.route';

const router = Router();

router.use('/user', UserRoute);
router.use('/auth', AuthRoute);
router.use('/resi', ResiRoute);
router.use('/transaksi', TransaksiRoute);

router.get('/health', (req, res) => {
  logger.info('Health check');
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

export default router;
