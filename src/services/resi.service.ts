import { CreateResiModel, FilterResiModel } from '@/models/resi-request.model';
import { logger } from '../utils/logger.util';
import { prisma } from '../config/app';
import { AppError } from '../middlewares/error-handler.middleware';
import { ResiResponse } from '../models/resi-response.model';

class ResiServices {
  async createResiService(resiData: CreateResiModel): Promise<ResiResponse> {
    const isUserExists = await prisma.user.findUnique({
      where: {
        id: resiData.userId,
      },
    });

    if (!isUserExists) {
      logger.warn(`User not found with id: ${resiData.userId}`);
      throw new AppError('User not found', 404);
    }

    logger.debug(`Checking resi with data: ${JSON.stringify(resiData.noResi)}`);
    const isResiExists = await prisma.resi.findUnique({
      where: {
        noResi: resiData.noResi,
      },
    });

    if (isResiExists) {
      logger.warn(`Resi already created with noResi: ${resiData.noResi}`);
      throw new AppError('Resi already created', 409);
    }
    logger.debug(`Creating resi with noResi: ${resiData.noResi}`);

    const data: any = {
      userId: resiData.userId,
      noResi: resiData.noResi,
      tanggalDiterima: resiData.tanggalDiterima,
      posisiPaket: resiData.posisiPaket,
      estimasiTiba: resiData.estimasiTiba,
      statusPaket: resiData.statusPaket,
      statusCod: resiData.statusCod,
    };

    if (resiData.statusCod && resiData.jumlahCod !== 0) {
      data.cod = {
        create: {
          jumlahCod: resiData.jumlahCod,
          statusPembayaran: resiData.statusPembayaranCod,
          methodPembayaran: resiData.methodPembayaran,
          tanggalPembayaran: resiData.tanggalPembayaran,
        },
      };
    }

    const resi = await prisma.resi.create({
      data,
      include: {
        cod: true,
      },
    });

    if (!resi) {
      logger.error(`Failed to create resi with noResi: ${resiData.noResi}`);
      throw new AppError('Failed to create resi', 500);
    }

    logger.info(`Resi created successfully with noResi: ${resiData.noResi} `);
    const {
      id,
      userId,
      noResi,
      tanggalDiterima,
      posisiPaket,
      estimasiTiba,
      statusPaket,
      statusCod,
      cod,
      createdAt,
      updatedAt,
    } = resi;
    const response: ResiResponse = {
      id,
      userId,
      noResi,
      tanggalDiterima,
      posisiPaket,
      estimasiTiba,
      statusPaket,
      statusCod,
      jumlahCod: cod?.jumlahCod ?? 0,
      statusPembayaranCod: cod?.statusPembayaran ?? '',
      tanggalPembayaran: cod?.tanggalPembayaran ?? '',
      createdAt,
      updatedAt,
    };
    return response;
  }

  async getAllResiService(): Promise<ResiResponse[]> {
    logger.debug(`Getting all resi data`);
    const resi = await prisma.resi.findMany({
      include: {
        cod: true,
      },
    });

    if (!resi) {
      logger.error(`Failed to get resi data`);
      throw new AppError('Failed to get resi data', 500);
    }

    const response = resi.map(
      ({
        id,
        userId,
        noResi,
        tanggalDiterima,
        posisiPaket,
        estimasiTiba,
        statusPaket,
        statusCod,
        cod,
        createdAt,
        updatedAt,
      }) => ({
        id,
        userId,
        noResi,
        tanggalDiterima,
        posisiPaket,
        estimasiTiba,
        statusPaket,
        statusCod,
        jumlahCod: cod?.jumlahCod ?? 0,
        statusPembayaranCod: cod?.statusPembayaran ?? '',
        tanggalPembayaran: cod?.tanggalPembayaran ?? '',
        createdAt,
        updatedAt,
      }),
    );

    logger.debug(`Resi data retrieved successfully`);
    return response;
  }

  async getFilteredResiService(
    filter: FilterResiModel,
  ): Promise<ResiResponse[]> {
    logger.debug(
      `Getting filtered resi data with filter: ${JSON.stringify(filter)} `,
    );
    const resi = await prisma.resi.findMany({
      where: filter,
      include: {
        cod: true,
      },
    });

    if (!resi) {
      logger.error(
        `Failed to get filtered resi data with filter: ${JSON.stringify(filter)} `,
      );
      throw new AppError('Failed to get filtered resi data', 500);
    }

    const response = resi.map(
      ({
        id,
        userId,
        noResi,
        tanggalDiterima,
        posisiPaket,
        estimasiTiba,
        statusPaket,
        statusCod,
        cod,
        createdAt,
        updatedAt,
      }) => ({
        id,
        userId,
        noResi,
        tanggalDiterima,
        posisiPaket,
        estimasiTiba,
        statusPaket,
        statusCod,
        jumlahCod: cod?.jumlahCod ?? 0,
        statusPembayaranCod: cod?.statusPembayaran ?? '',
        tanggalPembayaran: cod?.tanggalPembayaran ?? '',
        createdAt,
        updatedAt,
      }),
    );

    logger.debug(
      `Filtered resi data retrieved successfully with filter: ${JSON.stringify(filter)} `,
    );
    return response;
  }

  async updateResiService(resiData: CreateResiModel): Promise<ResiResponse> {
    logger.debug(
      `[${resiData.noResi}] Updating resi with data: ${JSON.stringify(resiData)}`,
    );

    const resi = await prisma.resi.update({
      where: { noResi: resiData.noResi },
      data: {
        posisiPaket: resiData.posisiPaket,
        estimasiTiba: resiData.estimasiTiba,
        statusPaket: resiData.statusPaket,
        statusCod: resiData.statusCod,
        cod: {
          update: {
            statusPembayaran: resiData.statusPembayaranCod,
            tanggalPembayaran: resiData.tanggalPembayaran,
          },
        },
      },
      include: {
        cod: true,
      },
    });

    if (!resi) {
      logger.error(
        `Failed to update resi with data: ${JSON.stringify(resiData)}`,
      );
      throw new AppError('Failed to update resi', 500);
    }

    const {
      id,
      userId,
      noResi,
      tanggalDiterima,
      posisiPaket,
      estimasiTiba,
      statusPaket,
      statusCod,
      cod,
      createdAt,
      updatedAt,
    } = resi;
    const response: ResiResponse = {
      id,
      userId,
      noResi,
      tanggalDiterima,
      posisiPaket,
      estimasiTiba,
      statusPaket,
      statusCod,
      jumlahCod: cod?.jumlahCod ?? 0,
      statusPembayaranCod: cod?.statusPembayaran ?? '',
      tanggalPembayaran: cod?.tanggalPembayaran ?? '',
      createdAt,
      updatedAt,
    };

    logger.debug(
      `Resi updated successfully with data: ${JSON.stringify(resiData)}`,
    );
    return response;
  }

  async deleteResiService(noResi: string): Promise<ResiResponse> {
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

    const response: ResiResponse = {
      ...deletedResi,
      jumlahCod: deletedResi.cod?.jumlahCod ?? 0,
      statusPembayaranCod: deletedResi.cod?.statusPembayaran ?? '',
      tanggalPembayaran: deletedResi.cod?.tanggalPembayaran ?? '',
    };

    logger.debug(`Resi deleted successfully with noResi: ${noResi}`);
    return response;
  }
}
export default new ResiServices();
