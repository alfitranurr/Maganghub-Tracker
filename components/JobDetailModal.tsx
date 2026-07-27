"use client";
/* cspell:disable */

import React from "react";
import { JobItem } from "@/types/job";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeClass, getPeluangBadgeClass } from "@/lib/utils";
import {
  Building,
  Briefcase,
  Users,
  MapPin,
  Tag,
  Percent,
  Hash,
} from "lucide-react";

interface JobDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobItem | null;
  onEditClick: (job: JobItem) => void;
}

export function JobDetailModal({
  open,
  onOpenChange,
  job,
  onEditClick,
}: JobDetailModalProps) {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200">
            <Hash className="w-3 h-3 mr-1" />
            No. {job.no}
          </Badge>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Detail Posisi Pekerjaan
          </DialogTitle>
        </div>
        <DialogDescription>
          Informasi lengkap aplikasi pekerjaan di {job.namaPerusahaan}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-2">
        {/* Banner Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Perusahaan
              </div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                <Building className="h-4 w-4 text-blue-600" />
                {job.namaPerusahaan}
              </h3>
              <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 mt-1">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                {job.posisi}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Status
              </span>
              <Badge className={`${getStatusBadgeClass(job.status)} text-xs px-3 py-1`}>
                {job.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              Kuota Posisi
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {job.kuota} <span className="text-xs font-normal text-slate-500">Orang</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              Jumlah Pelamar
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {job.pelamar} <span className="text-xs font-normal text-slate-500">Orang</span>
            </div>
          </div>
        </div>

        {/* Peluang Detail */}
        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-emerald-600" />
            <div>
              <div className="text-xs font-semibold text-slate-700">
                Peluang Kelolosan
              </div>
              <div className="text-[11px] text-slate-500">
                Formula: MIN(1, Kuota / (Pelamar + 1)) × 100
              </div>
            </div>
          </div>
          <Badge className={`${getPeluangBadgeClass(job.peluang)} text-sm px-3 py-1`}>
            {job.peluang}%
          </Badge>
        </div>

        {/* Alamat */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            Alamat Perusahaan / Lokasi Kerja
          </div>
          <p className="text-sm font-medium text-slate-800">
            {job.alamat}
          </p>
        </div>

        {/* Last Updated info */}
        {job.lastUpdated && (
          <div className="text-[11px] text-slate-500 text-right font-medium">
            Terakhir Diperbarui:{" "}
            <span className="text-slate-700 font-semibold">
              {(() => {
                try {
                  const d = new Date(job.lastUpdated);
                  return !isNaN(d.getTime())
                    ? new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(d) + " WIB"
                    : job.lastUpdated;
                } catch {
                  return job.lastUpdated;
                }
              })()}
            </span>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Tutup
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            onOpenChange(false);
            onEditClick(job);
          }}
        >
          ✏ Edit Data Ini
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
