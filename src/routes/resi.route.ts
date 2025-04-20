import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validator.middleware";
import { createResiSchema, deleteResiSchema, filterResiSchema } from "../validations/resi.validation";
import ResiController from "../controllers/resi.controller";
import { Router } from "express";
import { cacheMiddleware } from "../middlewares/cache.middleware";

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), validate(createResiSchema), ResiController.createResi);
router.get('/', authenticate, authorize('ADMIN', 'CASHIER'), cacheMiddleware({ keyPrefix: 'resi', ttl: 600 }), ResiController.getAllResi);
router.get('/search', authenticate, authorize('ADMIN', 'CASHIER'), validate(filterResiSchema), ResiController.getFilteredResi);
router.put('/:resi', authenticate, authorize('ADMIN', 'CASHIER'), validate(createResiSchema), ResiController.updateResi);
router.delete('/:resi', authenticate, authorize('ADMIN'), validate(deleteResiSchema), ResiController.deleteResi);

export default router;