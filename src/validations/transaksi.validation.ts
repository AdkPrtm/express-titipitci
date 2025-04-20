import { z } from "zod";

export const createTransaksiSchema = z.object({
    body: z.object({
        user_id: z.number({
            required_error: 'User ID wajib diisi',
            invalid_type_error: 'User ID harus berupa angka'
        }).int('User ID harus bilangan bulat').positive('User ID harus lebih dari 0'),

        nomor_resi: z.array(z.string(), ({
            required_error: 'Nomor resi wajib diisi',
            invalid_type_error: 'Nomor resi harus berupa teks'
        })).min(1, 'Nomor resi tidak boleh kosong'),

        tanggal_diambil: z.coerce.date({
            required_error: 'Tanggal diambil wajib diisi',
            invalid_type_error: 'Tanggal diambil harus berupa tanggal yang valid'
        }),

        metode_pembayaran: z.enum(['QRIS', 'TRANSFER', 'CASH'], {
            required_error: 'Metode pembayaran wajib diisi',
            invalid_type_error: 'Metode pembayaran harus "QRIS", "TRANSFER" atau "CASH"'
        }),

        alamat_pengambilan: z.enum(['TANJUNG', 'KM5'], {
            required_error: 'Alamat pengambilan wajib diisi',
            invalid_type_error: 'Alamat pengambilan harus "TANJUNG" atau "KM5"'
        }),

        catatan: z.string().optional(),
    })
})

export const getFilterTransaksiSchema = z.object({
    query: z.object({
        nama_penerima: z.string({
            invalid_type_error: 'Nama penerima harus berupa teks',
        }).trim().min(1, 'Nama penerima tidak boleh kosong').optional(),

        nomor_resi: z.string({
            invalid_type_error: 'Nomor resi harus berupa teks',
        }).trim().min(1, 'Nomor resi tidak boleh kosong').optional(),

        tanggal_diambil: z.coerce.date({
            invalid_type_error: 'Tanggal diambil tidak valid',
        }).optional(),

        status_transaksi: z.enum(['SUDAH_DIBAYAR', 'BELUM_DIBAYAR'], {
            invalid_type_error: 'Status transaksi harus "SUDAH DIBAYAR" atau "BELUM DIBAYAR"',
        }).optional(),

        metode_pembayaran: z.enum(['QRIS', 'TRANSFER', 'CASH'], {
            invalid_type_error: 'Metode pembayaran harus "QRIS", "TRANSFER" atau "CASH"',
        }).optional(),

        alamat_pengambilan: z.enum(['TANJUNG', 'KM5'], {
            invalid_type_error: 'Alamat pengambilan harus "TANJUNG" atau "KM5"',
        }).optional(),

        catatan: z.string().optional(),

        status_paket: z.enum(['DITERIMA', 'DIPROSES'], {
            invalid_type_error: 'Status paket harus "DITERIMA" atau "DIPROSES"',
        })
    })
})
