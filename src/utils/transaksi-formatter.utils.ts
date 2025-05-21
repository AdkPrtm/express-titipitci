import { TransaksiResponseModel } from '../models/transaksi-response';
import { Prisma } from '@prisma/client';

export type TransaksiWithRelations = Prisma.TransaksiGetPayload<{
  include: {
    user: {
      select: {
        name: true;
        whatsappNumber: true;
        address: true;
      };
    };
    transaksiItems: {
      include: {
        resi: true;
      };
    };
  };
}>;

export function formatTransaksiToResponse(
  transaksi: TransaksiWithRelations[]
): TransaksiResponseModel[] {
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
