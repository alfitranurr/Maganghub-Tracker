import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { JobStatus } from "@/types/job";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePeluang(kuota: number, pelamar: number): number {
  const k = Number(kuota) || 0;
  const p = Number(pelamar) || 0;
  if (k <= 0) return 0;
  const ratio = k / (p + 1);
  const percentage = Math.min(1, ratio) * 100;
  // Format up to 2 decimal places
  return Number(percentage.toFixed(2));
}

export function getStatusBadgeClass(status: JobStatus): string {
  switch (status) {
    case "Lamaran Telah Dikirim":
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold";
    case "Dalam Tahap Shortlist":
      return "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 font-semibold";
    case "Lamaran Ditolak":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-semibold";
    case "Status Belum Ditentukan":
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function getPeluangBadgeClass(peluang: number): string {
  if (peluang >= 70) {
    return "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold";
  } else if (peluang >= 40) {
    return "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
  } else {
    return "bg-red-100 text-red-800 border-red-300 font-semibold";
  }
}
