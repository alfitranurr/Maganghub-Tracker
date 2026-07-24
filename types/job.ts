export type JobStatus =
  | "Lamaran Telah Dikirim"
  | "Dalam Tahap Shortlist"
  | "Lamaran Ditolak"
  | "Status Belum Ditentukan";

export interface JobItem {
  id: number;
  no: number;
  namaPerusahaan: string;
  posisi: string;
  kuota: number;
  pelamar: number;
  peluang: number; // Percentage value (0 - 100)
  alamat: string;
  status: JobStatus;
}

export type JobFormData = Omit<JobItem, "id" | "no" | "peluang">;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface JobStats {
  totalPosisi: number;
  totalPerusahaan: number;
  rataRataPeluang: number;
  lamaranDikirim: number;
  dalamShortlist: number;
  lamaranDitolak: number;
  belumDitentukan: number;
}
