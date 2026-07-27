"use client";
/* cspell:disable */

import { useState, useEffect, useMemo, useCallback } from "react";
import { JobItem, JobFormData, JobStats, JobStatus } from "@/types/job";
import { fetchJobs, addJobApi, updateJobApi, deleteJobApi, syncMaganghubApi } from "@/services/api";
import { calculatePeluang } from "@/lib/utils";
import { toast } from "sonner";

export type SortField = "no" | "peluang";

export function useJobs() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingMaganghub, setIsSyncingMaganghub] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [posisiFilter, setPosisiFilter] = useState<string>("Semua");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const loadJobs = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await fetchJobs();
      setJobs(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Gagal mengambil data.";
      setError(errMsg);
      toast.error("Gagal mengambil data dari Google Spreadsheet.");
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Unique list of positions for dropdown filter
  const uniquePositions = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    const set = new Set(jobs.map((j) => j.posisi.trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  // Statistics calculation
  const stats: JobStats = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return {
        totalPosisi: 0,
        totalPerusahaan: 0,
        rataRataPeluang: 0,
        lamaranDikirim: 0,
        dalamShortlist: 0,
        lamaranDitolak: 0,
        belumDitentukan: 0,
      };
    }

    const uniqueCompanies = new Set(
      jobs.map((j) => j.namaPerusahaan.trim().toLowerCase())
    ).size;

    const totalPeluangSum = jobs.reduce((acc, curr) => acc + (curr.peluang || 0), 0);
    const avgPeluang = Math.round(totalPeluangSum / jobs.length);

    return {
      totalPosisi: jobs.length,
      totalPerusahaan: uniqueCompanies,
      rataRataPeluang: isNaN(avgPeluang) ? 0 : avgPeluang,
      lamaranDikirim: jobs.filter((j) => j.status === "Lamaran Telah Dikirim").length,
      dalamShortlist: jobs.filter((j) => j.status === "Dalam Tahap Shortlist").length,
      lamaranDitolak: jobs.filter((j) => j.status === "Lamaran Ditolak").length,
      belumDitentukan: jobs.filter((j) => j.status === "Status Belum Ditentukan").length,
    };
  }, [jobs]);

  // Filtered & sorted jobs list
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // 1. Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (job) =>
          job.namaPerusahaan.toLowerCase().includes(q) ||
          job.posisi.toLowerCase().includes(q) ||
          job.alamat.toLowerCase().includes(q) ||
          job.status.toLowerCase().includes(q)
      );
    }

    // 2. Status dropdown filter
    if (statusFilter !== "Semua") {
      result = result.filter((job) => job.status === (statusFilter as JobStatus));
    }

    // 3. Posisi dropdown filter
    if (posisiFilter !== "Semua") {
      result = result.filter((job) => job.posisi.trim() === posisiFilter.trim());
    }

    // 4. Sorting logic
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        if (sortField === "no") {
          return sortDirection === "asc" ? a.no - b.no : b.no - a.no;
        } else if (sortField === "peluang") {
          return sortDirection === "asc" ? a.peluang - b.peluang : b.peluang - a.peluang;
        }
        return 0;
      });
    }

    return result;
  }, [jobs, searchQuery, statusFilter, posisiFilter, sortField, sortDirection]);

  // Toggle sorting on a specific field
  const toggleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
    } else {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    }
  };

  const togglePeluangSort = () => toggleSort("peluang");

  // CRUD actions with Optimistic UI updates
  const handleAddJob = async (formData: JobFormData) => {
    const tempPeluang = calculatePeluang(formData.kuota, formData.pelamar);
    const tempJob: JobItem = {
      ...formData,
      id: Date.now(),
      no: jobs.length + 1,
      peluang: tempPeluang,
    };

    // Optimistic update
    setJobs((prev) => {
      const next = [...prev, tempJob];
      return next.map((item, idx) => ({ ...item, no: idx + 1 }));
    });
    setLastUpdated(new Date());

    try {
      await addJobApi(formData);
      toast.success("Tambah berhasil! Data tersimpan di spreadsheet.");
      loadJobs({ silent: true }); // Silent sync with spreadsheet
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan data.");
      loadJobs({ silent: true }); // Rollback/refetch on error
      throw err;
    }
  };

  const handleUpdateJob = async (id: number, formData: JobFormData) => {
    const updatedPeluang = calculatePeluang(formData.kuota, formData.pelamar);

    // Optimistic local update (instant UI reaction without flicker)
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id
          ? {
              ...job,
              ...formData,
              peluang: updatedPeluang,
            }
          : job
      )
    );
    setLastUpdated(new Date());

    try {
      await updateJobApi(id, formData);
      toast.success("Edit berhasil! Data spreadsheet diperbarui.");
      loadJobs({ silent: true }); // Silent sync in background
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui data.");
      loadJobs({ silent: true }); // Rollback if API fails
      throw err;
    }
  };

  const handleDeleteJob = async (id: number) => {
    const jobToDelete = jobs.find((j) => j.id === id);

    // Optimistic removal (instant row deletion without flicker)
    setJobs((prev) => {
      const filtered = prev.filter((j) => j.id !== id);
      return filtered.map((item, idx) => ({ ...item, no: idx + 1 }));
    });
    setLastUpdated(new Date());

    try {
      await deleteJobApi(id);
      toast.success(
        jobToDelete
          ? `Data "${jobToDelete.posisi}" di ${jobToDelete.namaPerusahaan} berhasil dihapus.`
          : "Delete berhasil! Baris dihapus & nomor diurutkan ulang."
      );
      loadJobs({ silent: true }); // Silent sync in background
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Gagal menghapus data.");
      loadJobs({ silent: true }); // Rollback on error
      throw err;
    }
  };

  const handleSyncMaganghub = async () => {
    setIsSyncingMaganghub(true);
    try {
      const updatedData = await syncMaganghubApi();
      setJobs(updatedData);
      setLastUpdated(new Date());
      toast.success("Sinkronisasi Maganghub Kemnaker Berhasil! Kuota & Pelamar ter-update.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Gagal sinkronisasi data dari Maganghub.");
    } finally {
      setIsSyncingMaganghub(false);
    }
  };

  return {
    jobs: filteredJobs,
    allJobsCount: jobs.length,
    isLoading,
    isSyncingMaganghub,
    error,
    lastUpdated,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    posisiFilter,
    setPosisiFilter,
    uniquePositions,
    sortField,
    sortDirection,
    toggleSort,
    togglePeluangSort,
    handleAddJob,
    handleUpdateJob,
    handleDeleteJob,
    handleSyncMaganghub,
    refreshJobs: () => loadJobs({ silent: false }),
  };
}

