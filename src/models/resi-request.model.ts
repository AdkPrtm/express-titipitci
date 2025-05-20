import {
  EnumMethodPembayaran,
  EnumProcces,
  EnumStatusPembayaranCOD,
} from '@prisma/client';

export interface CreateResiModel {
  user_id: number;
  nomor_resi: string;
  tanggal_diterima: Date;
  posisi_paket: string;
  estimasi_tiba: Date;
  status_paket: EnumProcces;
  fee_jastip: number;
  status_cod: boolean;
  jumlah_cod: number;
  fee_cod: number;
  status_pembayaranCod: EnumStatusPembayaranCOD;
  method_pembayaran: EnumMethodPembayaran;
  tanggal_pembayaran: Date;
}

export interface FilterResiModel {
  keyword?: string;
  limit?: number;
  cursor?: number;
}

export interface UpdatePosisiModel {
  nomor_resi: string[];
  posisi_paket: string;
}