import transaksiService from '../services/transaksi.service';
import { ApiResponse } from '../models/response.model';
import {
  TransaksiPaginationResponse,
  TransaksiResponseModel,
} from '../models/transaksi-response';
import { logger } from '../utils/logger.util';
import { Request, Response, NextFunction } from 'express';
import redisClientUtil from '../utils/redis-client.util';
import { FilterTransaksiModel } from '../models/transaksi-request.model';

class TransaksiController {
  async createTransaksi(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`[${req.id}] Creating transaksi data`);
      const transaksi = await transaksiService.createTransaksiService(req.body);
      const response: ApiResponse<TransaksiResponseModel> = {
        message: 'Transaksi created successfully',
        data: transaksi,
      };

      await redisClientUtil.delAllSpecificKey('resi');
      await redisClientUtil.delAllSpecificKey(`transaksi`);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllTransaksi(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`[${req.id}] Getting all transaksi data`);

      logger.debug(`[${req.id}] Getting all resi data`);
      const rawLimit = req.query.limit;
      const limit = typeof rawLimit === 'string' ? parseInt(rawLimit, 10) : 10;

      const rawCursor = req.query.cursor;
      const cursor =
        typeof rawCursor === 'string' ? parseInt(rawCursor, 10) : undefined;

      const transaksi = await transaksiService.getAllTransaksiService(
        limit,
        cursor,
      );
      const response: ApiResponse<TransaksiPaginationResponse> = {
        message: 'Get retrieved successfully',
        data: transaksi,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getFilterTransaksi(req: Request, res: Response, next: NextFunction) {
    logger.debug(`[${req.id}] Getting all transaksi data`);
    const {
      keyword,
      limit,
      cursor,
    } = req.query;

    const filter: FilterTransaksiModel = {};

    if (keyword !== undefined && keyword !== null) filter.keyword = String(keyword);
    if (limit !== undefined && limit !== null) filter.limit = Number(limit);
    if (cursor !== undefined && cursor !== null) filter.cursor = Number(cursor);

    try {
      const transaksi =
        await transaksiService.getFilterTransaksiService(filter);
      const response: ApiResponse<TransaksiPaginationResponse> = {
        message: 'Get retrieved successfully',
        data: transaksi,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
export default new TransaksiController();
