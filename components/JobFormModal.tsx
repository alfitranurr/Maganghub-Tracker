"use client";

import React, { useEffect, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobFormSchema, JobFormSchemaType, JOB_STATUSES } from "@/lib/validations";
import { JobItem, JobFormData } from "@/types/job";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { calculatePeluang } from "@/lib/utils";
import { Sparkles, Building, Briefcase, Users, MapPin, Tag } from "lucide-react";

interface JobFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobToEdit?: JobItem | null;
  onSubmit: (data: JobFormData) => Promise<void>;
}

export function JobFormModal({
  open,
  onOpenChange,
  jobToEdit,
  onSubmit,
}: JobFormModalProps) {
  const [isPending, startTransition] = useTransition();

  const isEditMode = Boolean(jobToEdit);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<JobFormSchemaType>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      namaPerusahaan: "",
      posisi: "",
      kuota: 1,
      pelamar: 0,
      alamat: "",
      status: "Status Belum Ditentukan",
    },
  });

  // Watch kuota and pelamar for realtime Peluang calculation preview
  const watchedKuota = useWatch({ control, name: "kuota" });
  const watchedPelamar = useWatch({ control, name: "pelamar" });

  const calculatedPeluang = calculatePeluang(
    Number(watchedKuota) || 0,
    Number(watchedPelamar) || 0
  );

  useEffect(() => {
    if (open) {
      if (jobToEdit) {
        reset({
          namaPerusahaan: jobToEdit.namaPerusahaan,
          posisi: jobToEdit.posisi,
          kuota: jobToEdit.kuota,
          pelamar: jobToEdit.pelamar,
          alamat: jobToEdit.alamat,
          status: jobToEdit.status,
        });
      } else {
        reset({
          namaPerusahaan: "",
          posisi: "",
          kuota: 1,
          pelamar: 0,
          alamat: "",
          status: "Status Belum Ditentukan",
        });
      }
    }
  }, [open, jobToEdit, reset]);

  const onFormSubmit = (data: JobFormSchemaType) => {
    startTransition(async () => {
      try {
        await onSubmit(data);
        onOpenChange(false);
      } catch (err) {
        // error handling inside onSubmit / toast
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {isEditMode ? "✏ Edit Posisi Pekerjaan" : "➕ Tambah Posisi Baru"}
        </DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Perbarui informasi posisi pekerjaan di bawah ini. Perubahan akan tersimpan otomatis di Spreadsheet."
            : "Isi data posisi pekerjaan baru. Peluang (%) akan dihitung secara otomatis."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Nama Perusahaan & Posisi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-slate-400" />
              Nama Perusahaan <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Contoh: PT Shopee Indonesia"
              {...register("namaPerusahaan")}
              className={errors.namaPerusahaan ? "border-red-500 focus:ring-red-400" : ""}
            />
            {errors.namaPerusahaan && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.namaPerusahaan.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              Posisi / Jabatan <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Contoh: Frontend Engineer"
              {...register("posisi")}
              className={errors.posisi ? "border-red-500 focus:ring-red-400" : ""}
            />
            {errors.posisi && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.posisi.message}
              </p>
            )}
          </div>
        </div>

        {/* Kuota & Pelamar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              Kuota (Jumlah Posisi) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={0}
              placeholder="1"
              {...register("kuota")}
              className={errors.kuota ? "border-red-500 focus:ring-red-400" : ""}
            />
            {errors.kuota && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.kuota.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              Pelamar Saat Ini <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              {...register("pelamar")}
              className={errors.pelamar ? "border-red-500 focus:ring-red-400" : ""}
            />
            {errors.pelamar && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.pelamar.message}
              </p>
            )}
          </div>
        </div>

        {/* Peluang Preview Box */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-slate-600">
              Peluang Lolos Otomatis:
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {calculatedPeluang}%
            <span className="text-xs font-normal text-slate-500 ml-1">
              (MIN(1, {watchedKuota || 0} / ({watchedPelamar || 0} + 1)) × 100)
            </span>
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            Alamat / Lokasi <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Contoh: Sudirman, Jakarta Selatan"
            {...register("alamat")}
            className={errors.alamat ? "border-red-500 focus:ring-red-400" : ""}
          />
          {errors.alamat && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.alamat.message}
            </p>
          )}
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            Status Lamaran <span className="text-red-500">*</span>
          </label>
          <Select {...register("status")}>
            {JOB_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </Select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.status.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" variant="emerald" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Menyimpan...
              </span>
            ) : isEditMode ? (
              "Simpan Perubahan"
            ) : (
              "Tambah Posisi"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
