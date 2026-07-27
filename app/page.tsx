"use client";
/* cspell:disable */

import React, { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { StatsCards } from "@/components/StatsCards";
import { TableFilters } from "@/components/TableFilters";
import { JobTable } from "@/components/JobTable";
import { JobFormModal } from "@/components/JobFormModal";
import { JobDetailModal } from "@/components/JobDetailModal";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { JobItem, JobFormData } from "@/types/job";
import { AlertCircle, RotateCw, Briefcase, Table, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const {
    jobs,
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
    handleAddJob,
    handleUpdateJob,
    handleDeleteJob,
    handleSyncMaganghub,
    refreshJobs,
  } = useJobs();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [viewingJob, setViewingJob] = useState<JobItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingJob, setDeletingJob] = useState<JobItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (job: JobItem) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleOpenDetailModal = (job: JobItem) => {
    setViewingJob(job);
    setIsDetailOpen(true);
  };

  const handleOpenDeleteModal = (job: JobItem) => {
    setDeletingJob(job);
    setIsDeleteOpen(true);
    toast.info(`Konfirmasi hapus untuk "${job.posisi}" di ${job.namaPerusahaan}.`, {
      duration: 3000,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingJob) return;
    setIsDeleting(true);
    try {
      await handleDeleteJob(deletingJob.id);
      setIsDeleteOpen(false);
      setDeletingJob(null);
    } catch (err) {
      // Error toast handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (formData: JobFormData) => {
    if (editingJob) {
      await handleUpdateJob(editingJob.id, formData);
    } else {
      await handleAddJob(formData);
    }
  };

  const formattedHeaderTime = lastUpdated
    ? new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(lastUpdated) + " WIB"
    : null;

  return (
    <main className="min-h-screen bg-white text-slate-900 pb-12">
      {/* Header Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold shadow-sm">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                Maganghub Application Tracker
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                <span>Database: Google Spreadsheet</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {formattedHeaderTime && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 font-normal border-l border-slate-200 pl-1.5">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Terakhir diperbarui: <strong className="text-slate-600 font-medium">{formattedHeaderTime}</strong></span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://docs.google.com/spreadsheets/d/1ppIpyuAzy92EOmSBFtFboE8HPwBmNuDKW5ERRfxRUmU/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors border border-slate-200"
            >
              <Table className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Buka Spreadsheet</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <div>
                <h3 className="text-xs font-bold">Gagal mengambil data.</h3>
                <p className="text-[11px] text-red-600 mt-0.5">
                  {error} - Mohon periksa kembali koneksi jaringan atau konfigurasi NEXT_PUBLIC_API_URL.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshJobs}
              className="bg-white border-red-300 text-red-700 hover:bg-red-50 shrink-0 h-7 text-xs px-2.5"
            >
              <RotateCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        )}

        {/* Top Statistics Cards */}
        <StatsCards stats={stats} isLoading={isLoading} />

        {/* Table Filters & Actions */}
        <TableFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          posisiFilter={posisiFilter}
          onPosisiFilterChange={setPosisiFilter}
          uniquePositions={uniquePositions}
          lastUpdated={lastUpdated}
          onAddClick={handleOpenAddModal}
          onRefreshClick={refreshJobs}
          onSyncMaganghubClick={handleSyncMaganghub}
          isRefreshing={isLoading}
          isSyncingMaganghub={isSyncingMaganghub}
        />

        {/* TanStack Job Table */}
        <JobTable
          jobs={jobs}
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onToggleSort={toggleSort}
          onViewDetail={handleOpenDetailModal}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      </div>

      {/* Modals */}
      <JobFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        jobToEdit={editingJob}
        onSubmit={handleFormSubmit}
      />

      <JobDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        job={viewingJob}
        onEditClick={handleOpenEditModal}
      />

      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Hapus Posisi Pekerjaan"
        description={
          deletingJob
            ? `Apakah Anda yakin ingin menghapus data posisi ini? Tindakan ini akan menghapus baris data di Google Spreadsheet secara permanen.`
            : "Yakin ingin menghapus data ini?"
        }
        jobDetails={deletingJob}
        confirmText="Ya, Hapus Data"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </main>
  );
}

