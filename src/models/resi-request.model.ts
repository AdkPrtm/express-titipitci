import { EnumMethodPembayaran, EnumProcces, EnumStatusPembayaranCOD } from "@prisma/client";

export interface CreateResiModel {
    userId: number;
    noResi: string;
    tanggalDiterima: Date;
    posisiPaket: string;
    estimasiTiba: Date;
    statusPaket: EnumProcces;
    statusCod: boolean;
    jumlahCod: number;
    statusPembayaranCod: EnumStatusPembayaranCOD;
    methodPembayaran: EnumMethodPembayaran;
    tanggalPembayaran: Date;
}

export interface FilterResiModel {
    userId?: number;
    noResi?: string;
    tanggalDiterima?: Date;
    posisiPaket?: string;
    estimasiTiba?: Date;
    statusPaket?: EnumProcces;
    statusCod?: boolean;
    statusPembayaranCod?: EnumStatusPembayaranCOD;
    tanggalPembayaran?: Date;
}