import { logger } from '../utils/logger.util';
import {
  FilterTransaksiModel,
  TransaksiRequestModel,
} from '../models/transaksi-request.model';
import { TransaksiResponseModel } from '../models/transaksi-response';
import { prisma } from '../config/app';
import { AppError } from '../middlewares/error-handler.middleware';

class TransaksiService {
  /**
   * Create a new transaksi.
   *
   * @param {TransaksiRequestModel} data - The data to create the transaksi.
   * @returns {Promise<TransaksiResponseModel>} The created transaksi.
   */
  async createTransaksiService(
    data: TransaksiRequestModel,
  ): Promise<TransaksiResponseModel> {
    logger.debug(`Creating transaksi with data: ${JSON.stringify(data)}`);

    const {
      user_id,
      nomor_resi,
      tanggal_diambil,
      metode_pembayaran,
      alamat_pengambilan,
      catatan,
    } = data;

    const isUserExists = await prisma.user.findUnique({
      where: { id: user_id },
    });

    const isResiExists = await prisma.resi.findMany({
      where: {
        noResi: {
          in: nomor_resi,
        },
      },
      include: {
        cod: true,
      },
    });

    if (isResiExists.length !== nomor_resi.length) {
      logger.warn('Beberapa nomor resi tidak valid atau tidak ditemukan.');
      throw new Error('Beberapa nomor resi tidak valid atau tidak ditemukan.');
    }

    if (!isUserExists) {
      logger.warn(`User not found with id: ${user_id}`);
      throw new AppError('User not found', 404);
    }

    const totalResi: number = isResiExists ? isResiExists.length : 0;
    const basePrice: number = totalResi > 1 ? 8000 : 10000;

    const feeJastip: number = basePrice * totalResi;
    const statusCod: boolean[] = isResiExists
      ? isResiExists.map((resi) => resi.statusCod === true)
      : [];
    const feeCod: number = statusCod.filter((status) => status).length * 5000;

    const { transaksi, updatedResults } = await prisma.$transaction(
      async (tx) => {
        const transaksi = await tx.transaksi.create({
          data: {
            userId: user_id,
            tanggalDiambil: tanggal_diambil,
            feeCod: feeCod,
            feeJastip: feeJastip,
            metodePembayaran: metode_pembayaran,
            alamatPengambilan: alamat_pengambilan,
            catatan: catatan,
            statusTransaksi: 'BERHASIL',
          },
        });

        const transaksiItemPromis = isResiExists.map((resi) => {
          return tx.transaksiItem.create({
            data: {
              transaksiId: transaksi.id,
              resiId: resi.id,
            },
          });
        });

        const transaksiItems = await Promise.all(transaksiItemPromis);

        const updatePromises = nomor_resi.map((noResi) => {
          return tx.resi.update({
            where: { noResi: noResi },
            data: {
              statusPaket: 'DITERIMA',
            },
          });
        });

        const updatedResults = await Promise.all(updatePromises);

        return { transaksi, updatedResults, transaksiItems };
      },
    );

    if (!transaksi || !updatedResults) {
      logger.error(
        `Failed to create transaksi with data: ${JSON.stringify(data)}`,
      );
      throw new AppError('Failed to create transaksi', 500);
    }

    const response: TransaksiResponseModel = {
      nama_penerima: {
        name: isUserExists.name,
        whatsapp_number: isUserExists.whatsappNumber,
        address: isUserExists.address,
      },
      nomor_resi: updatedResults.map((dataResi) => ({
        nomor_resi: dataResi.noResi,
        tanggal_diterima: dataResi.tanggalDiterima,
        posisi_paket: dataResi.posisiPaket,
        estimasi_tiba: dataResi.estimasiTiba,
        status_paket: dataResi.statusPaket,
        status_cod: dataResi.statusCod,
        update_at: dataResi.updatedAt,
      })),
      tanggal_diambil: transaksi.tanggalDiambil,
      fee_cod: transaksi.feeCod,
      fee_jastip: transaksi.feeJastip,
      status: '',
      status_transaksi: transaksi.statusTransaksi,
      metode_pembayaran: transaksi.metodePembayaran,
      alamat_pengambilan: transaksi.alamatPengambilan,
      catatan: transaksi.catatan ?? '',
      created_at: transaksi.createdAt,
    };

    return response;
  }

  async getAllTransaksiService(): Promise<TransaksiResponseModel[]> {
    logger.debug('Getting all transaksi data');

    const transaksi = await prisma.transaksi.findMany({
      include: {
        user: {
          select: {
            name: true,
            whatsappNumber: true,
            address: true,
          },
        },
        transaksiItems: {
          include: {
            resi: true,
          },
        },
      },
    });

    if (!transaksi) {
      logger.error('Failed to get transaksi data');
      throw new AppError('Failed to get transaksi data', 500);
    }

    const formattedTransactions: TransaksiResponseModel[] = transaksi.map(
      (transaction) => {
        return {
          nama_penerima: {
            name: transaction.user.name,
            whatsapp_number: transaction.user.whatsappNumber,
            address: transaction.user.address,
          },
          nomor_resi: transaction.transaksiItems.map((item) => ({
            nomor_resi: item.resi.noResi,
            tanggal_diterima: item.resi.tanggalDiterima,
            posisi_paket: item.resi.posisiPaket,
            estimasi_tiba: item.resi.estimasiTiba,
            status_paket: item.resi.statusPaket,
            status_cod: item.resi.statusCod,
            update_at: item.resi.updatedAt,
          })),
          tanggal_diambil: transaction.tanggalDiambil,
          fee_cod: transaction.feeCod,
          fee_jastip: transaction.feeJastip,
          status_transaksi: transaction.statusTransaksi,
          metode_pembayaran: transaction.metodePembayaran,
          alamat_pengambilan: transaction.alamatPengambilan,
          catatan: transaction.catatan ?? '',
          status: transaction.statusTransaksi,
          created_at: transaction.createdAt,
        };
      },
    );

    return formattedTransactions;
  }

  async getFilterTransaksiService(
    filter: FilterTransaksiModel,
  ): Promise<TransaksiResponseModel[]> {
    logger.debug('Getting filter transaksi data');

    const transaksi = await prisma.transaksi.findMany({
      where: filter,
      include: {
        user: {
          select: {
            name: true,
            whatsappNumber: true,
            address: true,
          },
        },
        transaksiItems: {
          include: {
            resi: true,
          },
        },
      },
    });

    if (!transaksi) {
      logger.error('Failed to get transaksi data');
      throw new AppError('Failed to get transaksi data', 500);
    }

    const formattedTransactions: TransaksiResponseModel[] = transaksi.map(
      (transaction) => {
        return {
          nama_penerima: {
            name: transaction.user.name,
            whatsapp_number: transaction.user.whatsappNumber,
            address: transaction.user.address,
          },
          nomor_resi: transaction.transaksiItems.map((item) => ({
            nomor_resi: item.resi.noResi,
            tanggal_diterima: item.resi.tanggalDiterima,
            posisi_paket: item.resi.posisiPaket,
            estimasi_tiba: item.resi.estimasiTiba,
            status_paket: item.resi.statusPaket,
            status_cod: item.resi.statusCod,
            update_at: item.resi.updatedAt,
          })),
          tanggal_diambil: transaction.tanggalDiambil,
          fee_cod: transaction.feeCod,
          fee_jastip: transaction.feeJastip,
          status_transaksi: transaction.statusTransaksi,
          metode_pembayaran: transaction.metodePembayaran,
          alamat_pengambilan: transaction.alamatPengambilan,
          catatan: transaction.catatan ?? '',
          status: transaction.statusTransaksi,
          created_at: transaction.createdAt,
        };
      },
    );

    return formattedTransactions;
  }
}

export default new TransaksiService();
