/* cspell:disable */
import { z } from "zod";

export const JOB_STATUSES = [
  "Lamaran Telah Dikirim",
  "Dalam Tahap Shortlist",
  "Lamaran Ditolak",
  "Status Belum Ditentukan",
] as const;

export const jobFormSchema = z.object({
  namaPerusahaan: z
    .string()
    .min(1, { message: "Nama Perusahaan wajib diisi" }),
  posisi: z
    .string()
    .min(1, { message: "Posisi wajib diisi" }),
  kuota: z
    .coerce
    .number({ invalid_type_error: "Kuota harus berupa angka" })
    .min(0, { message: "Kuota tidak boleh negatif" }),
  pelamar: z
    .coerce
    .number({ invalid_type_error: "Pelamar harus berupa angka" })
    .min(0, { message: "Pelamar tidak boleh negatif" }),
  alamat: z
    .string()
    .min(1, { message: "Alamat wajib diisi" }),
  status: z.enum(JOB_STATUSES, {
    errorMap: () => ({ message: "Status wajib dipilih" }),
  }),
});

export type JobFormSchemaType = z.infer<typeof jobFormSchema>;
