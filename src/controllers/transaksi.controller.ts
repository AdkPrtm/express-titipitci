import transaksiService from '../services/transaksi.service';
import { ApiResponse } from '../models/response.model';
import { TransaksiResponseModel } from '../models/transaksi-response';
import { logger } from '../utils/logger.util';
import { Request, Response, NextFunction } from 'express';
import redisClientUtil from '../utils/redis-client.util';

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
      const transaksi = await transaksiService.getAllTransaksiService();
      const response: ApiResponse<TransaksiResponseModel[]> = {
        message: 'Get retrieved successfully',
        data: transaksi,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getFilterTransaksi(req: Request, res: Response, next: NextFunction) {
    const {
      nama_penerima,
      nomor_resi,
      tanggal_diambil,
      status_transaksi,
      metode_pembayaran,
      alamat_pengambilan,
      catatan,
      status_paket,
    } = req.query;

    const filter: any = {};

    if (nama_penerima !== undefined && nama_penerima !== null)
      filter.user = {
        name: String(nama_penerima),
      };
    if (nomor_resi !== undefined && nomor_resi !== null)
      filter.transaksiItems = {
        some: {
          resi: {
            noResi: String(nomor_resi),
          },
        },
      };
    if (tanggal_diambil !== undefined && tanggal_diambil !== null)
      filter.tanggalDiambil = new Date(String(tanggal_diambil));
    if (status_transaksi !== undefined && status_transaksi !== null)
      filter.statusTransaksi = String(status_transaksi);
    if (metode_pembayaran !== undefined && metode_pembayaran !== null)
      filter.metodePembayaran = String(metode_pembayaran);
    if (alamat_pengambilan !== undefined && alamat_pengambilan !== null)
      filter.alamatPengambilan = String(alamat_pengambilan);
    if (catatan !== undefined && catatan !== null)
      filter.catatan = String(catatan);
    if (status_paket !== undefined && status_paket !== null)
      filter.transaksiItems = {
        some: {
          resi: {
            statusPaket: String(status_paket),
          },
        },
      };

    try {
      logger.debug(
        `[${req.id}] Getting filter transaksi data ${JSON.stringify(filter)}`,
      );
      const transaksi =
        await transaksiService.getFilterTransaksiService(filter);
      const response: ApiResponse<TransaksiResponseModel[]> = {
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
