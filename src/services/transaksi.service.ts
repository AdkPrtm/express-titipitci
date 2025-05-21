import { logger } from '../utils/logger.util';
import {
  FilterTransaksiModel,
  TransaksiRequestModel,
} from '../models/transaksi-request.model';
import {
  TransaksiPaginationResponse,
  TransaksiResponseModel,
} from '../models/transaksi-response';
import { prisma } from '../config/app';
import { AppError } from '../middlewares/error-handler.middleware';
import redisClientUtil from '../utils/redis-client.util';
import {
  EnumStatusTransaksi,
  EnumMethodPembayaran,
  EnumAlamatPengambilan,
} from '@prisma/client';
import { TransaksiWithRelations } from '../utils/transaksi-formatter.utils';

class TransaksiService {
  private formatTransaksiToResponse(transaksi: TransaksiWithRelations[]): TransaksiResponseModel[] {
    return transaksi.map((transaction) => ({
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
      status_transaksi: transaction.statusTransaksi,
      metode_pembayaran: transaction.metodePembayaran,
      alamat_pengambilan: transaction.alamatPengambilan,
      fee_jastip: transaction.totalFeeJastip,
      jumlah_cod: transaction.totalJumlahCod,
      fee_cod: transaction.totalFeeCod,
      catatan: transaction.catatan ?? '',
      status: transaction.statusTransaksi,
      created_at: transaction.createdAt,
    }));
  }

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

    const totalAllFee: number = isResiExists.map((resi) => resi.feeJastip).reduce((a, b) => a + b, 0);
    const finalFee: number = isResiExists.length > 1 ? totalAllFee * 0.8 : totalAllFee;
    const totalCod: number = isResiExists.map((resi) => resi.cod?.jumlahCod ?? 0).reduce((a, b) => a + b, 0);
    const totalFeeCod: number = isResiExists.map((resi) => resi.cod?.feeCod ?? 0).reduce((a, b) => a + b, 0);

    const { transaksi, updatedResults } = await prisma.$transaction(
      async (tx) => {
        const transaksi = await tx.transaksi.create({
          data: {
            userId: user_id,
            tanggalDiambil: tanggal_diambil,
            metodePembayaran: metode_pembayaran,
            alamatPengambilan: alamat_pengambilan,
            totalFeeJastip: finalFee,
            totalJumlahCod: totalCod,
            totalFeeCod: totalFeeCod,
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
      status: '',
      status_transaksi: transaksi.statusTransaksi,
      metode_pembayaran: transaksi.metodePembayaran,
      alamat_pengambilan: transaksi.alamatPengambilan,
      fee_jastip: transaksi.totalFeeJastip,
      jumlah_cod: transaksi.totalJumlahCod,
      fee_cod: transaksi.totalFeeCod,
      catatan: transaksi.catatan ?? '',
      created_at: transaksi.createdAt,
    };

    return response;
  }

  async getAllTransaksiService(
    limit: number,
    cursor?: number,
  ): Promise<TransaksiPaginationResponse> {
    logger.debug('Getting all transaksi data');

    let count: number | null = await redisClientUtil.get('transaksi-count');

    if (!count) {
      logger.info(`Cache miss for resi count`);
      const resiCount = await prisma.resi.count();
      await redisClientUtil.set('resi-count', resiCount, 120);
      count = resiCount;
    }

    const transaksi = await prisma.transaksi.findMany({
      take: limit + 1,
      orderBy: { id: 'desc' },
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
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

    const formattedTransactions = this.formatTransaksiToResponse(transaksi);

    logger.debug(`Resi data retrieved successfully`);
    const hasNextPage = transaksi.length > limit;
    const data = hasNextPage
      ? formattedTransactions.slice(0, -1)
      : formattedTransactions;
    const dataTemp = hasNextPage ? transaksi.slice(0, -1) : transaksi;
    const nextCursor = hasNextPage ? dataTemp[data.length - 1].id : null;
    const totalPages = Math.ceil(count / limit);

    const response: TransaksiPaginationResponse = {
      transaksi: formattedTransactions,
      next_cursor: nextCursor ?? 0,
      total_pages: totalPages,
      max_cursor: count,
      has_next_page: hasNextPage,
    };

    return response;
  }

  async getFilterTransaksiService({
    limit = 10,
    cursor,
    keyword: keywordSearch,
  }: FilterTransaksiModel): Promise<TransaksiPaginationResponse> {
    logger.debug(
      `Getting filtered transaksi data with filter: ${keywordSearch} `,
    );
    const keyword = keywordSearch?.trim() ?? '';

    const keywordFilter = keyword
      ? {
          OR: [
            {
              user: {
                name: {
                  contains: keyword,
                },
              },
            },
            {
              tanggalDiambil: {
                equals: new Date(keyword),
              },
            },
            {
              statusTransaksi: {
                equals: keyword as EnumStatusTransaksi, // case-sensitive unless handled
              },
            },
            {
              metodePembayaran: {
                equals: keyword as EnumMethodPembayaran,
              },
            },
            {
              alamatPengambilan: {
                equals: keyword as EnumAlamatPengambilan,
              },
            },
            {
              transaksiItems: {
                some: {
                  resi: {
                    noResi: {
                      contains: keyword.toUpperCase(),
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          ],
        }
      : undefined;

    const [transaksi, total] = await Promise.all([
      prisma.transaksi.findMany({
        take: limit + 1,
        orderBy: { id: 'desc' },
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor },
        }),
        where: keywordFilter,
        include: {
          user: true,
          transaksiItems: {
            include: {
              resi: true,
            },
          },
        },
      }),
      prisma.transaksi.count({ where: keywordFilter }),
    ]);

    if (!transaksi) {
      logger.error('Failed to get transaksi data');
      throw new AppError('Failed to get transaksi data', 500);
    }

    logger.debug(
      `Filtered resi data retrieved successfully with filter: ${keywordSearch} `,
    );

    const formattedTransactions = this.formatTransaksiToResponse(transaksi);

    const hasNextPage = transaksi.length > limit;
    const data = hasNextPage
      ? formattedTransactions.slice(0, -1)
      : formattedTransactions;
    const dataTemp = hasNextPage ? transaksi.slice(0, -1) : transaksi;
    const nextCursor = hasNextPage ? dataTemp[data.length - 1].id : null;
    const totalPages = Math.ceil(total / limit);

    const response: TransaksiPaginationResponse = {
      transaksi: formattedTransactions,
      next_cursor: nextCursor ?? 0,
      total_pages: totalPages,
      max_cursor: 0,
      has_next_page: hasNextPage,
    };

    return response;
  }
}

export default new TransaksiService();
