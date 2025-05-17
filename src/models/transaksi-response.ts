interface DataResi {
  nomor_resi: string;
  tanggal_diterima: Date;
  posisi_paket: string;
  estimasi_tiba: Date;
  status_paket: string;
  status_cod: boolean;
  update_at: Date;
}

interface DataUser {
  name: string;
  whatsapp_number: string;
  address: string;
}

export interface TransaksiResponseModel {
  nama_penerima: DataUser;
  nomor_resi: DataResi[];
  tanggal_diambil: Date;
  fee_cod: number;
  fee_jastip: number;
  status_transaksi: string;
  metode_pembayaran: string;
  alamat_pengambilan: string;
  catatan: string;
  status: string;
  created_at: Date;
}

export interface TransaksiPaginationResponse {
  transaksi: TransaksiResponseModel[];
  next_cursor: number;
  total_pages: number;
  max_cursor: number;
  has_next_page: boolean;
}