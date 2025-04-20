import resiService from '../services/resi.service';
import { logger } from '../utils/logger.util';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../models/response.model';
import redisClientUtil from '../utils/redis-client.util';
import { ResiResponse } from '../models/resi-response.model';
import { FilterResiModel } from '../models/resi-request.model';
import { EnumProcces, EnumStatusPembayaranCOD } from '@prisma/client';


class ResiController {
    async createResi(req: Request, res: Response, next: NextFunction) {
        try {
            logger.debug(
                `[${req.id}] Creating resi with data: ${JSON.stringify(req.body)}`,)
            const resi = await resiService.createResiService(req.body);
            const response: ApiResponse<ResiResponse> = {
                message: 'Resi created successfully',
                data: resi
            };

            await redisClientUtil.del('resi:/api/resi');
            await redisClientUtil.set(`resi:${req.body.noResi}`, resi, 600);

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getAllResi(req: Request, res: Response, next: NextFunction) {
        try {
            logger.debug(`[${req.id}] Getting all resi data`);
            const resi = await resiService.getAllResiService();
            const response: ApiResponse<ResiResponse[]> = {
                message: 'Get retrieved successfully',
                data: resi
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getFilteredResi(req: Request, res: Response, next: NextFunction) {
        logger.debug(`[${req.id}] Getting filtered resi data`);

        const { userId, noResi, tanggalDiterima, posisiPaket, statusPaket, statusCod, statusPembayaranCod, tanggalPembayaran } = req.query

        const filter: FilterResiModel = {}

        
        if (userId !== undefined && userId !== null) filter.userId = Number(userId);
        if (noResi) filter.noResi = String(noResi);
        if (tanggalDiterima) filter.tanggalDiterima = new Date(String(tanggalDiterima));
        if (posisiPaket) filter.posisiPaket = String(posisiPaket);
        if (statusPaket) filter.statusPaket = String(statusPaket) as EnumProcces;
        if (statusCod !== undefined && statusCod !== null) filter.statusCod = (/true/i).test(String(statusCod)) 
        if (statusPembayaranCod) filter.statusPembayaranCod = String(statusPembayaranCod) as EnumStatusPembayaranCOD;
        if (tanggalPembayaran) filter.tanggalPembayaran = new Date(String(tanggalPembayaran));
        
        logger.debug(filter.statusCod)
        try {
            logger.debug(`[${req.id}] Getting filtered resi data`);
            const resi = await resiService.getFilteredResiService(filter);
            const response: ApiResponse<ResiResponse[]> = {
                message: 'Get retrieved successfully',
                data: resi
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async updateResi(req: Request, res: Response, next: NextFunction) {
        try {
            logger.debug(
                `[${req.id}] Updating resi with data: ${JSON.stringify(req.body)}`,
            );
            const resi = await resiService.updateResiService(req.body);
            const response: ApiResponse<ResiResponse> = {
                message: 'Resi updated successfully',
                data: resi
            };

            await redisClientUtil.del('resi:/api/resi');
            await redisClientUtil.set(`resi:${req.body.noResi}`, resi, 600);

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async deleteResi(req: Request, res: Response, next: NextFunction) {
        try {
            logger.debug(`[${req.id}] Deleting resi with noResi: ${req.params.resi}`);
            const resi = await resiService.deleteResiService(req.params.resi);
            const response: ApiResponse<ResiResponse> = {
                message: 'Resi deleted successfully',
                data: resi
            };

            await redisClientUtil.del('resi:/api/resi');

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new ResiController();