import resiService from '../services/resi.service';
import { logger } from '../utils/logger.util';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../models/response.model';
import redisClientUtil from '../utils/redis-client.util';
import { DeleteResiResponse, ResiPaginationResponse, ResiResponse, UpdatePosisiResponse } from '../models/resi-response.model';
import { FilterResiModel } from '../models/resi-request.model';
import { EnumProcces, EnumStatusPembayaranCOD } from '@prisma/client';

class ResiController {
  async createResi(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(
        `[${req.id}] Creating resi with data: ${JSON.stringify(req.body)}`,
      );
      const resi = await resiService.createResiService(req.body);
      const response: ApiResponse<ResiResponse> = {
        message: 'Resi created successfully',
        data: resi,
      };

      await redisClientUtil.delAllSpecificKey('resi');
      await redisClientUtil.set(`resi:${req.body.nomor_resi}`, resi, 600);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllResi(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`[${req.id}] Getting all resi data`);
      const rawLimit = req.query.limit;
      const limit = typeof rawLimit === 'string' ? parseInt(rawLimit, 10) : 10;

      const rawCursor = req.query.cursor;
      const cursor = typeof rawCursor === 'string' ? parseInt(rawCursor, 10) : undefined;

      const resi = await resiService.getAllResiService(limit, cursor);
      const response: ApiResponse<ResiPaginationResponse> = {
        message: 'Get retrieved successfully',
        data: resi,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getFilteredResi(req: Request, res: Response, next: NextFunction) {
    logger.debug(`[${req.id}] Getting filtered resi data`);

    const {
      keyword,
      limit,
      cursor,
    } = req.query;

    const filter: FilterResiModel = {};

    if (keyword !== undefined && keyword !== null) filter.keyword = String(keyword);
    if (limit !== undefined && limit !== null) filter.limit = Number(limit);
    if (cursor !== undefined && cursor !== null) filter.cursor = Number(cursor);

    try {
      logger.debug(`[${req.id}] Getting filtered resi data`);
      const resi = await resiService.getFilteredResiService(filter);
      const response: ApiResponse<ResiPaginationResponse> = {
        message: 'Get retrieved successfully',
        data: resi,
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
        data: resi,
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
      const response: ApiResponse<DeleteResiResponse> = {
        message: 'Resi deleted successfully',
        data: resi,
      };

      await redisClientUtil.del('resi:/api/resi');

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updatePosisi(req: Request, res: Response, next: NextFunction){
    try {
      logger.debug(
        `[${req.id}] Updating resi with data: ${JSON.stringify(req.body)}`,
      );
      const resi = await resiService.updatePosisiService(req.body);
      const response: ApiResponse<UpdatePosisiResponse> = {
        message: 'Resi updated successfully',
        data: resi,
      };

      await redisClientUtil.del('resi:/api/resi');
      await redisClientUtil.set(`resi:${req.body.noResi}`, resi, 600);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new ResiController();
