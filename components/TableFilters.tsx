"use client";
/* cspell:disable */

import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Briefcase, RotateCw, Sparkles, Clock } from "lucide-react";
import { JOB_STATUSES } from "@/lib/validations";

interface TableFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  posisiFilter: string;
  onPosisiFilterChange: (value: string) => void;
  uniquePositions?: string[];
  lastUpdated?: Date | null;
  onAddClick: () => void;
  onRefreshClick: () => void;
  onSyncMaganghubClick: () => void;
  isRefreshing?: boolean;
  isSyncingMaganghub?: boolean;
}

export function TableFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  posisiFilter,
  onPosisiFilterChange,
  uniquePositions = [],
  lastUpdated,
  onAddClick,
  onRefreshClick,
  onSyncMaganghubClick,
  isRefreshing = false,
  isSyncingMaganghub = false,
}: TableFiltersProps) {
  const safePositions = Array.isArray(uniquePositions) ? uniquePositions : [];

  const formattedTime = lastUpdated
    ? new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(lastUpdated) + " WIB"
    : null;

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
      {/* Left: Search, Status Filter, Posisi Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari perusahaan, posisi, alamat..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 bg-slate-50/50 border-slate-200 focus:bg-white text-xs h-9"
          />
        </div>

        {/* Posisi Dropdown Filter */}
        <div className="flex items-center gap-1.5 sm:w-[190px]">
          <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0 hidden sm:block" />
          <Select
            value={posisiFilter}
            onChange={(e) => onPosisiFilterChange(e.target.value)}
            className="bg-slate-50/50 border-slate-200 focus:bg-white text-xs h-9"
          >
            <option value="Semua">Semua Posisi</option>
            {safePositions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </Select>
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-1.5 sm:w-[180px]">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0 hidden sm:block" />
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-slate-50/50 border-slate-200 focus:bg-white text-xs h-9"
          >
            <option value="Semua">Semua Status</option>
            {JOB_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Right: Last Updated badge & Actions */}
      <div className="flex items-center gap-2 justify-end flex-wrap">
        {formattedTime && (
          <span
            className="hidden xl:inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100/70 border border-slate-200/80 px-2.5 py-1 rounded-md"
            title={`Terakhir diperbarui pada ${lastUpdated?.toLocaleString("id-ID")}`}
          >
            <Clock className="h-3 w-3 text-slate-400" />
            <span>Update: <strong className="text-slate-700 font-medium">{formattedTime}</strong></span>
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onSyncMaganghubClick}
          disabled={isSyncingMaganghub || isRefreshing}
          className="text-blue-700 bg-blue-50/60 border-blue-200 hover:bg-blue-100 text-xs h-9 px-3 font-semibold"
          title="Tarik data Kuota & Pelamar terbaru dari Maganghub Kemnaker"
        >
          <Sparkles className={`h-3.5 w-3.5 mr-1 text-blue-600 ${isSyncingMaganghub ? "animate-spin" : ""}`} />
          <span>{isSyncingMaganghub ? "Syncing Kemnaker..." : "Sync Maganghub"}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshClick}
          disabled={isRefreshing || isSyncingMaganghub}
          className="text-slate-600 border-slate-200 hover:bg-slate-50 text-xs h-9 px-3"
          title="Refresh Data Spreadsheet"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline ml-1.5">Sync Sheet</span>
        </Button>

        <Button
          onClick={onAddClick}
          variant="emerald"
          className="flex items-center gap-1.5 shadow-sm text-xs h-9 px-3.5"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Tambah Posisi</span>
        </Button>
      </div>
    </div>
  );
}

