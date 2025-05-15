import { z } from 'zod';

export const createResiSchema = z.object({
  body: z.object({
    user_id: z
      .number({
        required_error: 'User ID wajib diisi',
        invalid_type_error: 'User ID harus berupa angka',
      })
      .int('User ID harus bilangan bulat')
      .positive('User ID harus lebih dari 0'),

    nomor_resi: z
      .string({
        required_error: 'Nomor resi wajib diisi',
        invalid_type_error: 'Nomor resi harus berupa teks',
      })
      .trim()
      .min(1, 'Nomor resi tidak boleh kosong'),

    tanggal_diterima: z.coerce.date({
      required_error: 'Tanggal diterima wajib diisi',
      invalid_type_error: 'Tanggal diterima tidak valid',
    }),

    posisi_paket: z
      .string({
        required_error: 'Posisi paket wajib diisi',
        invalid_type_error: 'Posisi paket harus berupa teks',
      })
      .trim()
      .min(1, 'Posisi paket tidak boleh kosong'),

    estimasi_tiba: z.coerce.date({
      required_error: 'Estimasi tiba wajib diisi',
      invalid_type_error: 'Estimasi tiba tidak valid',
    }),

    status_paket: z.enum(['DITERIMA', 'DIPROSES'], {
      required_error: 'Status paket wajib diisi',
      invalid_type_error: 'Status paket harus "DITERIMA" atau "DIPROSES"',
    }),

    status_cod: z.boolean({
      required_error: 'Status COD wajib diisi',
      invalid_type_error: 'Status COD harus berupa boolean (true/false)',
    }),

    jumlah_cod: z
      .number({
        invalid_type_error: 'Jumlah COD harus berupa angka',
      })
      .nonnegative('Jumlah COD tidak boleh negatif')
      .optional(),

    status_pembayaranCod: z
      .enum(['BELUM_BAYAR', 'SUDAH_BAYAR'], {
        invalid_type_error:
          'Status pembayaran COD harus "LUNAS" atau "BELUM LUNAS"',
      })
      .optional(),

    tanggal_pembayaran: z.coerce
      .date({
        invalid_type_error: 'Tanggal pembayaran tidak valid',
      })
      .optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const filterResiSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    user_id: z.coerce
      .number({
        invalid_type_error: 'User ID harus berupa angka',
      })
      .int('User ID harus bilangan bulat')
      .positive('User ID harus lebih dari 0')
      .optional(),

    nomor_resi: z
      .string({
        invalid_type_error: 'Nomor resi harus berupa teks',
      })
      .trim()
      .min(1, 'Nomor resi tidak boleh kosong')
      .optional(),

    tanggal_diterima: z.coerce
      .date({
        invalid_type_error: 'Tanggal diterima tidak valid',
      })
      .optional(),

    posisi_paket: z
      .string({
        invalid_type_error: 'Posisi paket harus berupa teks',
      })
      .trim()
      .min(1, 'Posisi paket tidak boleh kosong')
      .optional(),

    estimasi_tiba: z.coerce
      .date({
        invalid_type_error: 'Estimasi tiba tidak valid',
      })
      .optional(),

    status_paket: z
      .enum(['DITERIMA', 'DIPROSES'], {
        invalid_type_error: 'Status paket harus "DITERIMA" atau "DIPROSES"',
      })
      .optional(),

    status_cod: z.coerce
      .boolean({
        invalid_type_error: 'Status COD harus berupa boolean (true/false)',
      })
      .optional(),

    jumlah_cod: z
      .number({
        invalid_type_error: 'Jumlah COD harus berupa angka',
      })
      .nonnegative('Jumlah COD tidak boleh negatif')
      .optional(),

    status_pembayaranCod: z
      .enum(['LUNAS', 'BELUM LUNAS'], {
        invalid_type_error:
          'Status pembayaran COD harus "LUNAS" atau "BELUM LUNAS"',
      })
      .optional(),

    tanggal_pembayaran: z.coerce
      .date({
        invalid_type_error: 'Tanggal pembayaran tidak valid',
      })
      .optional(),
  }),
});

export const deleteResiSchema = z.object({
  body: z.object({}).optional(),
  params: z
    .object({
      nomor_resi: z
        .string({
          required_error: 'Nomor resi wajib diisi',
          invalid_type_error: 'Nomor resi harus berupa teks',
        })
        .trim()
        .min(1, 'Nomor resi tidak boleh kosong'),
    })
    .optional(),
  query: z.object({}).optional(),
});

export const updatePosisiSchema = z.object({
  body: z.object({
    nomor_resi: z
      .array(z.string(), {
        required_error: 'Nomor resi wajib diisi',
        invalid_type_error: 'Nomor resi harus berupa teks',
      })
      .min(1, 'Nomor resi tidak boleh kosong'),
      
      posisi_paket: z
      .string({
        required_error: 'Posisi paket wajib diisi',
        invalid_type_error: 'Posisi paket harus berupa teks',
      })
      .trim()
      .min(1, 'Posisi paket tidak boleh kosong'),
  })
})