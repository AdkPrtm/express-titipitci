import { CreateResiModel, FilterResiModel, UpdatePosisiModel } from '@/models/resi-request.model';
import { logger } from '../utils/logger.util';
import { prisma } from '../config/app';
import { AppError } from '../middlewares/error-handler.middleware';
import { DeleteResiResponse, ResiPaginationResponse, ResiResponse, UpdatePosisiResponse } from '../models/resi-response.model';
import redisClientUtil from '../utils/redis-client.util';

class ResiServices {
  async createResiService(resiData: CreateResiModel): Promise<ResiResponse> {
    const isUserExists = await prisma.user.findUnique({
      where: {
        id: resiData.user_id,
      },
    });

    if (!isUserExists) {
      logger.warn(`User not found with id: ${resiData.user_id}`);
      throw new AppError('User not found', 404);
    }

    logger.debug(`Checking resi with data: ${JSON.stringify(resiData.nomor_resi)}`);
    const isResiExists = await prisma.resi.findUnique({
      where: {
        noResi: resiData.nomor_resi,
      },
    });

    if (isResiExists) {
      logger.warn(`Resi already created with noResi: ${resiData.nomor_resi}`);
      throw new AppError('Resi already created', 409);
    }
    logger.debug(`Creating resi with noResi: ${resiData.nomor_resi}`);

    const data: any = {
      userId: resiData.user_id,
      noResi: resiData.nomor_resi.toUpperCase(),
      tanggalDiterima: resiData.tanggal_diterima,
      posisiPaket: resiData.posisi_paket,
      estimasiTiba: resiData.estimasi_tiba,
      statusPaket: resiData.status_paket,
      statusCod: resiData.status_cod,
    };

    if (resiData.status_cod && resiData.jumlah_cod !== 0) {
      data.cod = {
        create: {
          jumlahCod: resiData.jumlah_cod,
          statusPembayaran: resiData.status_pembayaranCod,
          methodPembayaran: resiData.method_pembayaran,
          tanggalPembayaran: resiData.tanggal_pembayaran,
        },
      };
    }

    const resi = await prisma.resi.create({
      data,
      include: {
        cod: true,
        user: true,
      },
    });

    if (!resi) {
      logger.error(`Failed to create resi with noResi: ${resiData.nomor_resi}`);
      throw new AppError('Failed to create resi', 500);
    }

    logger.info(`Resi created successfully with noResi: ${resiData.nomor_resi} `);

    const response: ResiResponse = {
      user_id: resiData.user_id,
      nama_penerima: resi.user.name,
      nomor_resi: resi.noResi,
      tanggal_diterima: resi.tanggalDiterima,
      posisi_paket: resi.posisiPaket,
      estimasi_tiba: resi.estimasiTiba,
      status_paket: resi.statusPaket,
      status_cod: resi.statusCod,
      jumlah_cod: resi.cod?.jumlahCod ?? 0,
      status_pembayaran_cod: resi.cod?.statusPembayaran ?? '',
      tanggal_pembayaran: resi.cod?.tanggalPembayaran ?? '',
      created_at: resi.createdAt,
    };
    return response;
  }

  async getAllResiService(limit: number, cursor?: number): Promise<ResiPaginationResponse> {
    logger.debug(`Getting all resi data`);

    let count: number | null = await redisClientUtil.get('resi-count');

    if (!count) {
      logger.info(`Cache miss for resi count`);
      const resiCount = await prisma.resi.count();
      await redisClientUtil.set('resi-count', resiCount, 120);
      count = resiCount
    }

    const resi = await prisma.resi.findMany({
      take: limit + 1,
      orderBy: { id: 'desc' },
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        cod: true,
        user: true,
      },
    });

    if (!resi) {
      logger.error(`Failed to get resi data`);
      throw new AppError('Failed to get resi data', 500);
    }

    const resiData = resi.map(
      (resi) => ({
        user_id: resi.userId,
        nama_penerima: resi.user.name,
        nomor_resi: resi.noResi,
        tanggal_diterima: resi.tanggalDiterima,
        posisi_paket: resi.posisiPaket,
        estimasi_tiba: resi.estimasiTiba,
        status_paket: resi.statusPaket,
        status_cod: resi.statusCod,
        jumlah_cod: resi.cod?.jumlahCod ?? 0,
        status_pembayaran_cod: resi.cod?.statusPembayaran ?? '',
        tanggal_pembayaran: resi.cod?.tanggalPembayaran ?? '',
        created_at: resi.createdAt,
        updated_at: resi.updatedAt,
      }),)

    logger.debug(`Resi data retrieved successfully`);
    const hasNextPage = resi.length > limit;
    const data = hasNextPage ? resiData.slice(0, -1) : resiData;
    const dataTemp = hasNextPage ? resi.slice(0, -1) : resi;
    const nextCursor = hasNextPage ? dataTemp[data.length - 1].id : null;
    const totalPages = Math.ceil(count / limit);

    const response: ResiPaginationResponse = {
      resi: resiData,
      next_cursor: nextCursor ?? 0,
      total_pages: totalPages,
      max_cursor: count,
      has_next_page: hasNextPage,
    }

    return response;
  }

  async getFilteredResiService(
    { limit = 10, cursor, keyword: keywordSearch }: FilterResiModel,
  ): Promise<ResiPaginationResponse> {
    logger.debug(
      `Getting filtered resi data with filter: ${keywordSearch} `,
    );
    const keyword = keywordSearch?.trim() ?? "";

    const keywordFilter = keyword
      ? {
        OR: [
          { noResi: { contains: keyword.toUpperCase(), } },
          { user: { name: { contains: keyword } } },
        ],
      }
      : undefined;

    const [resi, total] = await Promise.all([
      prisma.resi.findMany({
        take: limit + 1,
        orderBy: { id: 'desc' },
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor },
        }),
        where: keywordFilter,
        include: {
          cod: true,
          user: true,
        },
      }),
      prisma.resi.count({
        where: keywordFilter,
      }),
    ]);

    if (!resi) {
      logger.error(
        `Failed to get filtered resi data with filter: ${keywordSearch} `,
      );
      throw new AppError('Failed to get filtered resi data', 500);
    }

    const resiData = resi.map(
      (resi) => ({
        user_id: resi.userId,
        nama_penerima: resi.user.name,
        nomor_resi: resi.noResi,
        tanggal_diterima: resi.tanggalDiterima,
        posisi_paket: resi.posisiPaket,
        estimasi_tiba: resi.estimasiTiba,
        status_paket: resi.statusPaket,
        status_cod: resi.statusCod,
        jumlah_cod: resi.cod?.jumlahCod ?? 0,
        status_pembayaran_cod: resi.cod?.statusPembayaran ?? '',
        tanggal_pembayaran: resi.cod?.tanggalPembayaran ?? '',
        created_at: resi.createdAt,
        updated_at: resi.updatedAt,
      }),
    )

    logger.debug(
      `Filtered resi data retrieved successfully with filter: ${keywordSearch} `,
    );

    const hasNextPage = resi.length > limit;
    const data = hasNextPage ? resiData.slice(0, -1) : resiData;
    const dataTemp = hasNextPage ? resi.slice(0, -1) : resi;
    const nextCursor = hasNextPage ? dataTemp[data.length - 1].id : null;
    const totalPages = Math.ceil(total / limit);

    const response: ResiPaginationResponse = {
      resi: resiData,
      next_cursor: nextCursor ?? 0,
      total_pages: totalPages,
      max_cursor: 0,
      has_next_page: hasNextPage,
    }

    return response;
  }

  async updateResiService(resiData: CreateResiModel): Promise<ResiResponse> {
    logger.debug(
      `[${resiData.nomor_resi}] Updating resi with data: ${JSON.stringify(resiData)}`,
    );

    const resi = await prisma.resi.update({
      where: { noResi: resiData.nomor_resi },
      data: {
        posisiPaket: resiData.posisi_paket,
        estimasiTiba: resiData.estimasi_tiba,
        statusPaket: resiData.status_paket,
        statusCod: resiData.status_cod,
        cod: {
          update: {
            statusPembayaran: resiData.status_pembayaranCod,
            tanggalPembayaran: resiData.tanggal_pembayaran,
          },
        },
      },
      include: {
        cod: true,
        user: true,
      },
    });

    if (!resi) {
      logger.error(
        `Failed to update resi with data: ${JSON.stringify(resiData)}`,
      );
      throw new AppError('Failed to update resi', 500);
    }

    const response: ResiResponse = {
      user_id: resi.userId,
      nama_penerima: resi.user.name,
      nomor_resi: resi.noResi,
      tanggal_diterima: resi.tanggalDiterima,
      posisi_paket: resi.posisiPaket,
      estimasi_tiba: resi.estimasiTiba,
      status_paket: resi.statusPaket,
      status_cod: resi.statusCod,
      jumlah_cod: resi.cod?.jumlahCod ?? 0,
      status_pembayaran_cod: resi.cod?.statusPembayaran ?? '',
      tanggal_pembayaran: resi.cod?.tanggalPembayaran ?? '',
      created_at: resi.createdAt,
    };

    logger.debug(
      `Resi updated successfully with data: ${JSON.stringify(resiData)}`,
    );
    return response;
  }

  async deleteResiService(noResi: string): Promise<DeleteResiResponse> {
    logger.debug(`[${noResi}] Deleting resi data`);

    const isResiExists = await prisma.resi.findUnique({ where: { noResi } });
    if (!isResiExists) {
      logger.error(`Failed to delete resi with noResi: ${noResi}`);
      throw new AppError('Resi not found', 404);
    }

    const { deletedCod, deletedResi } = await prisma.$transaction(
      async (tx) => {
        const deletedCod = await tx.cOD.delete({
          where: { resiId: isResiExists.id },
        });

        const deletedResi = await tx.resi.delete({
          where: { noResi: noResi },
          include: { cod: true },
        });

        return { deletedCod, deletedResi };
      },
    );

    if (!deletedResi || !deletedCod) {
      logger.error(`Failed to delete resi with noResi: ${noResi}`);
      throw new AppError('Failed to delete resi', 500);
    }

    const response: DeleteResiResponse = {
      nomor_resi: deletedResi.noResi,
    };

    logger.debug(`Resi deleted successfully with noResi: ${noResi}`);
    return response;
  }

  async updatePosisiService(resiData: UpdatePosisiModel): Promise<UpdatePosisiResponse> {
    logger.debug(
      `Updating resi with data: ${JSON.stringify(resiData)}`,
    );

    const isResiExists = await prisma.resi.findMany({
      where: {
        noResi: {
          in: resiData.nomor_resi,
        },
      }
    })

    if (isResiExists.length !== resiData.nomor_resi.length) {
      logger.warn(`Have a few not found resi with nomor resi: ${resiData.nomor_resi}`);
      throw new AppError('Have a few resi not found', 404);
    }

    const dataUpdate = isResiExists.map((resi) => {
      return prisma.resi.update({
        where: { noResi: resi.noResi },
        data: {
          posisiPaket: resiData.posisi_paket,
        },
      })
    })

    const resi = await prisma.$transaction(dataUpdate)

    if (!resi) {
      logger.error(
        `Failed to update resi with data: ${JSON.stringify(resiData)}`,
      );
      throw new AppError('Failed to update resi', 500);
    }

    logger.debug(
      `Resi updated successfully with data: ${JSON.stringify(resiData)}`,
    );
    return resiData;
  }
}

export default new ResiServices();
