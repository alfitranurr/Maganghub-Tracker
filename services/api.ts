import { JobItem, JobFormData, ApiResponse } from "@/types/job";
import { calculatePeluang } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Default mock initial data if spreadsheet URL is not configured yet
let mockJobs: JobItem[] = [
  {
    id: 1,
    no: 1,
    namaPerusahaan: "PT Fore Kopi Indonesia Tbk",
    posisi: "Business Intelligence Analyst",
    kuota: 2,
    pelamar: 9,
    peluang: 20,
    alamat: "Jakarta Pusat, DKI Jakarta",
    status: "Lamaran Telah Dikirim",
  },
  {
    id: 2,
    no: 2,
    namaPerusahaan: "Mnc Televisi Network",
    posisi: "Data & Content Analyst - Programming",
    kuota: 3,
    pelamar: 13,
    peluang: 21.43,
    alamat: "Jakarta Pusat, DKI Jakarta",
    status: "Dalam Tahap Shortlist",
  },
  {
    id: 3,
    no: 3,
    namaPerusahaan: "Pfi Mega Life Insurance",
    posisi: "Automation Report & Dashboard",
    kuota: 1,
    pelamar: 1,
    peluang: 50,
    alamat: "Jakarta Selatan, DKI Jakarta",
    status: "Status Belum Ditentukan",
  },
  {
    id: 4,
    no: 4,
    namaPerusahaan: "Pfi Mega Life Insurance",
    posisi: "Data Analyst",
    kuota: 1,
    pelamar: 2,
    peluang: 33.33,
    alamat: "Jakarta Selatan, DKI Jakarta",
    status: "Lamaran Telah Dikirim",
  },
  {
    id: 5,
    no: 5,
    namaPerusahaan: "Trans Digital Media",
    posisi: "Data Analyst & Scientist",
    kuota: 5,
    pelamar: 33,
    peluang: 14.71,
    alamat: "Jakarta Selatan, DKI Jakarta",
    status: "Lamaran Ditolak",
  },
];

export async function fetchJobs(): Promise<JobItem[]> {
  if (!API_URL || API_URL.includes("YOUR_SCRIPT_ID")) {
    console.warn("NEXT_PUBLIC_API_URL is empty or default. Using mock data.");
    return mockJobs;
  }

  try {
    const url = `${API_URL}${API_URL.includes("?") ? "&" : "?"}action=get&t=${Date.now()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: ApiResponse<JobItem[]> = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((item, index) => ({
        ...item,
        id: item.id || index + 1,
        no: index + 1,
        peluang: calculatePeluang(item.kuota, item.pelamar),
      }));
    }
    throw new Error(data.message || data.error || "Gagal mengambil data.");
  } catch (error) {
    console.error("Error fetching jobs from Apps Script:", error);
    throw error;
  }
}

export async function addJobApi(formData: JobFormData): Promise<JobItem> {
  const peluang = calculatePeluang(formData.kuota, formData.pelamar);

  if (!API_URL || API_URL.includes("YOUR_SCRIPT_ID")) {
    const newId = mockJobs.length > 0 ? Math.max(...mockJobs.map((j) => j.id)) + 1 : 1;
    const newItem: JobItem = {
      ...formData,
      id: newId,
      no: mockJobs.length + 1,
      peluang,
    };
    mockJobs.push(newItem);
    return newItem;
  }

  const payload = {
    action: "add",
    ...formData,
    peluang,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Gagal menambahkan data ke spreadsheet");
  }

  const result: ApiResponse<JobItem> = await res.json();
  if (!result.success) {
    throw new Error(result.message || result.error || "Gagal menyimpan data");
  }

  return result.data || {
    ...formData,
    id: Date.now(),
    no: 1,
    peluang,
  };
}

export async function updateJobApi(id: number, formData: JobFormData): Promise<void> {
  const peluang = calculatePeluang(formData.kuota, formData.pelamar);

  if (!API_URL || API_URL.includes("YOUR_SCRIPT_ID")) {
    mockJobs = mockJobs.map((job) =>
      job.id === id ? { ...job, ...formData, peluang } : job
    );
    return;
  }

  const payload = {
    action: "update",
    id,
    ...formData,
    peluang,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Gagal memperbarui data di spreadsheet");
  }

  const result: ApiResponse = await res.json();
  if (!result.success) {
    throw new Error(result.message || result.error || "Gagal memperbarui data");
  }
}

export async function deleteJobApi(id: number): Promise<void> {
  if (!API_URL || API_URL.includes("YOUR_SCRIPT_ID")) {
    mockJobs = mockJobs.filter((job) => job.id !== id);
    // Renumber
    mockJobs = mockJobs.map((job, idx) => ({ ...job, no: idx + 1 }));
    return;
  }

  const payload = {
    action: "delete",
    id,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Gagal menghapus data dari spreadsheet");
  }

  const result: ApiResponse = await res.json();
  if (!result.success) {
    throw new Error(result.message || result.error || "Gagal menghapus data");
  }
}

export async function syncMaganghubApi(): Promise<JobItem[]> {
  if (!API_URL || API_URL.includes("YOUR_SCRIPT_ID")) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockJobs;
  }

  const payload = {
    action: "sync_maganghub",
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Gagal melakukan sinkronisasi dengan Maganghub Kemnaker");
  }

  const result: ApiResponse<JobItem[]> = await res.json();
  if (!result.success) {
    throw new Error(result.message || result.error || "Gagal sinkronisasi Maganghub");
  }

  if (Array.isArray(result.data)) {
    return result.data.map((item, index) => ({
      ...item,
      id: item.id || index + 1,
      no: index + 1,
      peluang: calculatePeluang(item.kuota, item.pelamar),
    }));
  }

  return fetchJobs();
}
