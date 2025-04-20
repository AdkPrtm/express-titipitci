import { EnumAlamatPengambilan, EnumMethodPembayaran, EnumProcces, EnumStatusTransaksi } from "@prisma/client";

export interface TransaksiRequestModel {
    user_id: number;
    nomor_resi: string[];
    tanggal_diambil: Date;
    metode_pembayaran: EnumMethodPembayaran;
    alamat_pengambilan: EnumAlamatPengambilan;
    catatan?: string;
    status_paket?: EnumProcces;
}

export interface FilterTransaksiModel {
    name?: number;
    noResi?: string;
    tanggalDiambil?: Date;
    statusTransaksi?: EnumStatusTransaksi;
    metodePembayaran?: EnumMethodPembayaran;
    alamatPengambilan?: EnumAlamatPengambilan;
    catatan?: string;
    statusPaket?: EnumProcces;
}