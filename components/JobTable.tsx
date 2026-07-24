"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  PaginationState,
} from "@tanstack/react-table";
import { JobItem } from "@/types/job";
import { SortField } from "@/hooks/useJobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusBadgeClass, getPeluangBadgeClass } from "@/lib/utils";
import {
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
} from "lucide-react";

interface JobTableProps {
  jobs: JobItem[];
  isLoading?: boolean;
  sortField: SortField | null;
  sortDirection: "asc" | "desc" | null;
  onToggleSort: (field: SortField) => void;
  onViewDetail: (job: JobItem) => void;
  onEdit: (job: JobItem) => void;
  onDelete: (job: JobItem) => void;
}

export function JobTable({
  jobs,
  isLoading = false,
  sortField,
  sortDirection,
  onToggleSort,
  onViewDetail,
  onEdit,
  onDelete,
}: JobTableProps) {
  // TanStack Table Pagination State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Reset to first page whenever jobs data length changes (e.g. when search or filter is applied)
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [jobs.length]);

  const columns = useMemo<ColumnDef<JobItem>[]>(
    () => [
      {
        accessorKey: "no",
        header: () => (
          <button
            onClick={() => onToggleSort("no")}
            className="flex items-center justify-center gap-1 font-bold text-slate-700 hover:text-blue-600 transition-colors w-full focus:outline-none text-[11px]"
            title="Klik untuk mengurutkan Nomor"
          >
            <span>No</span>
            <span className="text-[10px] font-bold bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
              {sortField === "no" ? (sortDirection === "asc" ? "▲" : "▼") : "▲/▼"}
            </span>
          </button>
        ),
        cell: (info) => (
          <span className="font-semibold text-slate-500 text-center block text-xs">
            {info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "namaPerusahaan",
        header: "Nama Perusahaan",
        cell: (info) => (
          <div className="font-semibold text-slate-900 text-xs">
            {info.getValue<string>()}
          </div>
        ),
      },
      {
        accessorKey: "posisi",
        header: "Posisi",
        cell: (info) => (
          <div className="font-medium text-slate-700 text-xs">
            {info.getValue<string>()}
          </div>
        ),
      },
      {
        accessorKey: "kuota",
        header: () => <span className="text-center block text-[11px]">Kuota</span>,
        cell: (info) => (
          <span className="text-slate-800 font-semibold text-center block text-xs">
            {info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "pelamar",
        header: () => <span className="text-center block text-[11px]">Pelamar</span>,
        cell: (info) => (
          <span className="text-slate-800 font-semibold text-center block text-xs">
            {info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "peluang",
        header: () => (
          <button
            onClick={() => onToggleSort("peluang")}
            className="flex items-center justify-center gap-1 font-bold text-slate-700 hover:text-blue-600 transition-colors w-full focus:outline-none text-[11px]"
            title="Klik untuk mengurutkan Peluang (%)"
          >
            <span>Peluang (%)</span>
            <span className="text-[10px] font-bold bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
              {sortField === "peluang" ? (sortDirection === "asc" ? "▲" : "▼") : "▲/▼"}
            </span>
          </button>
        ),
        cell: (info) => {
          const val = info.getValue<number>();
          return (
            <div className="flex justify-center">
              <Badge className={`${getPeluangBadgeClass(val)} px-2 py-0.5 text-[11px]`}>
                {val}%
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "alamat",
        header: "Alamat",
        cell: (info) => (
          <div className="text-slate-600 text-[11px] truncate max-w-[180px]" title={info.getValue<string>()}>
            {info.getValue<string>()}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <span className="text-center block text-[11px]">Status</span>,
        cell: (info) => {
          const statusVal = info.getValue<JobItem["status"]>();
          return (
            <div className="flex justify-center">
              <Badge className={`${getStatusBadgeClass(statusVal)} px-2 py-0.5 text-[11px] whitespace-nowrap`}>
                {statusVal}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "action",
        header: () => <span className="text-center block text-[11px]">Action</span>,
        cell: (info) => {
          const job = info.row.original;
          return (
            <div className="flex items-center justify-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewDetail(job)}
                className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                title="Detail Posisi"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(job)}
                className="h-7 w-7 text-amber-600 hover:bg-amber-50"
                title="Edit Data"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(job)}
                className="h-7 w-7 text-red-600 hover:bg-red-50"
                title="Hapus Data"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onToggleSort, sortField, sortDirection, onViewDetail, onEdit, onDelete]
  );

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-600 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2.5 whitespace-nowrap select-none">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="px-3 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Inbox className="h-8 w-8 mb-2 stroke-1" />
                    <p className="text-sm font-semibold text-slate-600">
                      Tidak ada data ditemukan
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coba ubah kata kunci pencarian atau filter status.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-slate-200 bg-slate-50/50 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium">
            Tampilkan per halaman:
          </span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              table.setPageSize(newSize);
            }}
            className="h-7 w-20 text-xs bg-white border-slate-200 py-0 px-2"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} data
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">
            Halaman{" "}
            <strong className="text-slate-800">
              {table.getState().pagination.pageIndex + 1}
            </strong>{" "}
            dari{" "}
            <strong className="text-slate-800">
              {table.getPageCount() || 1}
            </strong>{" "}
            ({jobs.length} total data)
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
