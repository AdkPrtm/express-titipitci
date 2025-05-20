export interface ResiResponse {
  user_id: number;
  nama_penerima: string;
  nomor_resi: string;
  tanggal_diterima: Date;
  posisi_paket: string;
  estimasi_tiba: Date;
  status_paket: string;
  fee_jastip: number;
  status_cod: boolean;
  jumlah_cod: number;
  fee_cod: number;
  status_pembayaran_cod: string;
  tanggal_pembayaran: string | Date;
  created_at: Date;
}

export interface UpdatePosisiResponse {
  nomor_resi: string[];
  posisi_paket: string;
}

export interface DeleteResiResponse {
  nomor_resi: string; 
}

export interface ResiPaginationResponse {
  resi: ResiResponse[];
  next_cursor: number;
  total_pages: number;
  max_cursor: number;
  has_next_page: boolean;
}