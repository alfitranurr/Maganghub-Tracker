"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { JobStats } from "@/types/job";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Building2,
  Percent,
  Send,
  UserCheck,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface StatsCardsProps {
  stats: JobStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  const cardsData = [
    {
      title: "Total Posisi",
      value: stats.totalPosisi,
      unit: "Posisi",
      icon: Briefcase,
      iconBg: "bg-slate-100 text-slate-700",
      borderColor: "border-slate-200",
    },
    {
      title: "Total Perusahaan",
      value: stats.totalPerusahaan,
      unit: "Perusahaan",
      icon: Building2,
      iconBg: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      title: "Rata-rata Peluang",
      value: `${stats.rataRataPeluang}%`,
      unit: "Peluang Lolos",
      icon: Percent,
      iconBg: "bg-indigo-50 text-indigo-600",
      borderColor: "border-indigo-100",
    },
    {
      title: "Lamaran Dikirim",
      value: stats.lamaranDikirim,
      unit: "Aplikasi",
      icon: Send,
      iconBg: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Tahap Shortlist",
      value: stats.dalamShortlist,
      unit: "Posisi",
      icon: UserCheck,
      iconBg: "bg-amber-50 text-amber-600",
      borderColor: "border-amber-200",
    },
    {
      title: "Lamaran Ditolak",
      value: stats.lamaranDitolak,
      unit: "Lamaran",
      icon: XCircle,
      iconBg: "bg-red-50 text-red-600",
      borderColor: "border-red-200",
    },
    {
      title: "Belum Ditentukan",
      value: stats.belumDitentukan,
      unit: "Posisi",
      icon: HelpCircle,
      iconBg: "bg-slate-100 text-slate-600",
      borderColor: "border-slate-200",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 mb-5">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="p-3 bg-white">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-6 w-10 mb-1" />
            <Skeleton className="h-2.5 w-12" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 mb-5">
      {cardsData.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={index}
            className={`bg-white transition-all duration-200 hover:-translate-y-0.5 ${card.borderColor}`}
          >
            <CardContent className="p-3 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold tracking-wide text-slate-500 uppercase truncate">
                  {card.title}
                </span>
                <div
                  className={`p-1 rounded-md flex items-center justify-center shrink-0 ${card.iconBg}`}
                >
                  <IconComponent className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {card.unit}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
