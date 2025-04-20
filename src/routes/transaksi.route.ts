import { cacheMiddleware } from "@/middlewares/cache.middleware";
import transaksiController from "../controllers/transaksi.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validator.middleware";
import { createTransaksiSchema, getFilterTransaksiSchema } from "../validations/transaksi.validation";
import { Router } from "express";


const router = Router();

router.post("/", authenticate, authorize("ADMIN", "CASHIER"), validate(createTransaksiSchema), transaksiController.createTransaksi);
router.get("/", authenticate, authorize("ADMIN", "CASHIER"), cacheMiddleware({ keyPrefix: "transaksi", ttl: 600 }), transaksiController.getAllTransaksi);
router.get("/search", authenticate, authorize("ADMIN", "CASHIER"), cacheMiddleware({ keyPrefix: "transaksi", ttl: 600 }), validate(getFilterTransaksiSchema), transaksiController.getFilterTransaksi);
// router.put("/:id", authenticate, authorize("ADMIN", "CASHIER"), transaksiController.updateTransaksi);

export default router;