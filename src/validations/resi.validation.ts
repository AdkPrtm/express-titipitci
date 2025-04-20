import { z } from "zod";

export const createResiSchema = z.object({
    body: z.object({
        userId: z.number({
            required_error: 'User ID wajib diisi',
            invalid_type_error: 'User ID harus berupa angka',
        }).int('User ID harus bilangan bulat').positive('User ID harus lebih dari 0'),

        noResi: z.string({
            required_error: 'Nomor resi wajib diisi',
            invalid_type_error: 'Nomor resi harus berupa teks',
        }).trim().min(1, 'Nomor resi tidak boleh kosong'),

        tanggalDiterima: z.coerce.date({
            required_error: 'Tanggal diterima wajib diisi',
            invalid_type_error: 'Tanggal diterima tidak valid',
        }),

        posisiPaket: z.string({
            required_error: 'Posisi paket wajib diisi',
            invalid_type_error: 'Posisi paket harus berupa teks',
        }).trim().min(1, 'Posisi paket tidak boleh kosong'),

        estimasiTiba: z.coerce.date({
            required_error: 'Estimasi tiba wajib diisi',
            invalid_type_error: 'Estimasi tiba tidak valid',
        }),

        statusPaket: z.enum(['DITERIMA', 'DIPROSES'], {
            required_error: 'Status paket wajib diisi',
            invalid_type_error: 'Status paket harus "DITERIMA" atau "DIPROSES"',
        }),

        statusCod: z.boolean({
            required_error: 'Status COD wajib diisi',
            invalid_type_error: 'Status COD harus berupa boolean (true/false)',
        }),

        jumlahCod: z.number({
            invalid_type_error: 'Jumlah COD harus berupa angka',
        }).nonnegative('Jumlah COD tidak boleh negatif').optional(),

        statusPembayaranCod: z.enum(['BELUM_BAYAR', 'SUDAH_BAYAR'], {
            invalid_type_error: 'Status pembayaran COD harus "LUNAS" atau "BELUM LUNAS"',
        }).optional(),

        tanggalPembayaran: z.coerce.date({
            invalid_type_error: 'Tanggal pembayaran tidak valid',
        }).optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

export const filterResiSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: z.object({
        userId: z.coerce.number({
            invalid_type_error: 'User ID harus berupa angka',
        }).int('User ID harus bilangan bulat').positive('User ID harus lebih dari 0').optional(),

        noResi: z.string({
            invalid_type_error: 'Nomor resi harus berupa teks',
        }).trim().min(1, 'Nomor resi tidak boleh kosong').optional(),

        tanggalDiterima: z.coerce.date({
            invalid_type_error: 'Tanggal diterima tidak valid',
        }).optional(),

        posisiPaket: z.string({
            invalid_type_error: 'Posisi paket harus berupa teks',
        }).trim().min(1, 'Posisi paket tidak boleh kosong').optional(),

        estimasiTiba: z.coerce.date({
            invalid_type_error: 'Estimasi tiba tidak valid',
        }).optional(),

        statusPaket: z.enum(['DITERIMA', 'DIPROSES'], {
            invalid_type_error: 'Status paket harus "DITERIMA" atau "DIPROSES"',
        }).optional(),

        statusCod: z.coerce.boolean({
            invalid_type_error: 'Status COD harus berupa boolean (true/false)',
        }).optional(),

        jumlahCod: z.number({
            invalid_type_error: 'Jumlah COD harus berupa angka',
        }).nonnegative('Jumlah COD tidak boleh negatif').optional(),

        statusPembayaranCod: z.enum(['LUNAS', 'BELUM LUNAS'], {
            invalid_type_error: 'Status pembayaran COD harus "LUNAS" atau "BELUM LUNAS"',
        }).optional(),

        tanggalPembayaran: z.coerce.date({
            invalid_type_error: 'Tanggal pembayaran tidak valid',
        }).optional(),
    })
})

export const deleteResiSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({
        noResi: z.string({
            required_error: 'Nomor resi wajib diisi',
            invalid_type_error: 'Nomor resi harus berupa teks',
        }).trim().min(1, 'Nomor resi tidak boleh kosong'),
    }).optional(),
    query: z.object({}).optional(),
});
