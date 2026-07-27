"use client";
/* cspell:disable */

import * as React from "react";
import { AlertTriangle, Trash2, Building2, Briefcase, Tag } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";

interface JobDetailsInfo {
  namaPerusahaan: string;
  posisi: string;
  status: string;
  kuota?: number;
  pelamar?: number;
}

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  jobDetails?: JobDetailsInfo | null;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function AlertDialog({
  open,
  onOpenChange,
  title = "Konfirmasi Hapus Data",
  description,
  jobDetails,
  confirmText = "Ya, Hapus Data",
  cancelText = "Batal",
  onConfirm,
  isLoading = false,
}: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 shadow-xs">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900">{title}</DialogTitle>
            <DialogDescription className="mt-1 text-xs text-slate-500 leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {jobDetails && (
        <div className="my-4 rounded-xl border border-red-100 bg-red-50/40 p-3.5 space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Building2 className="h-4 w-4 text-slate-500" />
            <span>{jobDetails.namaPerusahaan}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Briefcase className="h-4 w-4 text-slate-400" />
            <span>Posisi: <strong>{jobDetails.posisi}</strong></span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-red-100/60 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Tag className="h-3 w-3 text-slate-400" />
              Status: <span className="font-medium text-slate-800">{jobDetails.status}</span>
            </span>
            {jobDetails.kuota !== undefined && jobDetails.pelamar !== undefined && (
              <span className="text-slate-500">
                Kuota: {jobDetails.kuota} | Pelamar: {jobDetails.pelamar}
              </span>
            )}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
          className="text-xs h-9"
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isLoading}
          className="text-xs h-9 bg-red-600 hover:bg-red-700 font-semibold gap-1.5"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menghapus...
            </span>
          ) : (
            <>
              <Trash2 className="h-3.5 w-3.5" />
              {confirmText}
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

