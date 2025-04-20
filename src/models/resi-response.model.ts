export interface ResiResponse {
    id: number;
    userId: number;
    noResi: string;
    tanggalDiterima: Date;
    posisiPaket: string;
    estimasiTiba: Date;
    statusPaket: string;
    statusCod: boolean;
    jumlahCod: number;
    statusPembayaranCod: string;
    tanggalPembayaran: string | Date;
    createdAt: Date;
    updatedAt: Date;
}   