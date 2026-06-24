"use client";

import { useEffect, useState } from "react";
import PJLayout from "@/components/PJLayout";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import API from "@/services/api";

ChartJS.register(ArcElement, Tooltip, Legend);

type ProjectResponse = {
  id: number;
  name: string;
  progress?: number | null;
  status?: string | null;
  end_date?: string | null;
};

type DashboardProject = {
  id: number;
  nama: string;
  progress: number;
  status: string;
  warna: string;
  deadline: string;
};

export default function DashboardPJ() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [reportSummary, setReportSummary] = useState({ month: 0 });
  const [financeSummary, setFinanceSummary] = useState({
    totalBudget: 0,
    totalUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const formatRupiah = (value: number) => {
    return "Rp " + value.toLocaleString("id-ID");
  };

  const loadDashboardData = async () => {
    try {
      const [projectsResponse, reportSummaryResponse, financeSummaryResponse] = await Promise.all([
        API.get("/pj/projects"),
        API.get("/pj/projects/summary"),
        API.get("/pj/finance/summary"),
      ]);

      const data = projectsResponse.data.data || [];
      setProjects(
        data.map((p: ProjectResponse) => {
          const progress = p.progress ?? 0;
          const isCompleted = progress === 100 || p.status === "completed";

          return {
            id: p.id,
            nama: p.name,
            progress,
            status: isCompleted
              ? "Selesai"
              : progress >= 50
                ? "Sedang"
                : "Tertunda",
            warna: isCompleted
              ? "bg-green-100 text-green-600"
              : progress >= 50
                ? "bg-blue-100 text-blue-600"
                : "bg-red-100 text-red-600",
            deadline: p.end_date
              ? new Date(p.end_date).toLocaleDateString('id-ID')
              : "Belum ditentukan",
          };
        })
      );

      setReportSummary({
        month: Number(reportSummaryResponse.data?.data?.month || 0),
      });

      setFinanceSummary({
        totalBudget: Number(financeSummaryResponse.data?.total_budget || 0),
        totalUsed: Number(financeSummaryResponse.data?.total_used || 0),
      });
    } catch (error) {
      console.error("Gagal memuat dashboard PJ:", error);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    {
      label: "Laporan Bulan Ini",
      value: String(reportSummary.month),
      sub: null,
      subColor: "text-green-600",
      iconBg: "bg-blue-50",
      icon: "📄",
    },
    {
      label: "Proyek Aktif",
      value: String(projects.filter(p => p.progress < 100).length),
      sub: null,
      subColor: "",
      iconBg: "bg-green-50",
      icon: "🏗️",
    },
    {
      label: "Total Pengeluaran",
      value: formatRupiah(financeSummary.totalUsed),
      sub: null,
      subColor: "",
      iconBg: "bg-yellow-50",
      icon: "💰",
    },
    {
      label: "Proyek Selesai",
      value: String(projects.filter(p => p.progress === 100).length),
      sub: null,
      subColor: "text-green-600",
      iconBg: "bg-purple-50",
      icon: "✔️",
    },
  ];

  // Calculate chart data from projects
  const completedCount = projects.filter(p => p.progress === 100).length;
  const inProgressCount = projects.filter(p => p.progress > 0 && p.progress < 100).length;
  const postponedCount = projects.filter(p => p.progress === 0).length;

  const dataChart = {
    labels: ["Selesai", "Dalam Proses", "Tertunda"],
    datasets: [
      {
        data: [completedCount, inProgressCount, postponedCount],
        backgroundColor: ["#22c55e", "#1E3A8A", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  const totalProjects = projects.length;
  const avgProgress = totalProjects > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects) : 0;
  const remainingBudget = financeSummary.totalBudget - financeSummary.totalUsed;
  const usedPercent = financeSummary.totalBudget > 0 ? Math.round((financeSummary.totalUsed / financeSummary.totalBudget) * 1000) / 10 : 0;
  const remainingPercent = financeSummary.totalBudget > 0 ? Math.round((remainingBudget / financeSummary.totalBudget) * 1000) / 10 : 0;

  return (
    <PJLayout>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <h2 className="text-xl font-bold text-gray-800">{card.value}</h2>
              {card.sub && (
                <p className={`text-xs mt-0.5 ${card.subColor}`}>{card.sub}</p>
              )}
            </div>
            <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center text-lg`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* STATUS PROGRESS */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Status Progres Proyek</h2>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Memuat data proyek...</p>
            </div>
          ) : (
            <div className="flex items-center gap-8 justify-center">
              <div className="relative w-44 h-44">
                <Doughnut data={dataChart} options={options} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-800">{avgProgress}%</span>
                  <span className="text-xs text-gray-400">Rata-rata</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { color: "bg-green-500", label: "Selesai", count: completedCount },
                  { color: "bg-[#1E3A8A]", label: "Dalam Proses", count: inProgressCount },
                  { color: "bg-amber-400", label: "Tertunda", count: postponedCount },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                    <span className="text-gray-600">{item.label}</span>
                    <span className="ml-auto font-semibold text-gray-700">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PROYEK SAYA */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Proyek Saya</h2>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Memuat data proyek...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Belum ada proyek</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {projects.map((item, i) => (
                <div key={i} className="bg-gray-50 px-4 py-3 rounded-lg">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-xs font-semibold text-gray-800 leading-snug">{item.nama}</p>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full shrink-0 font-medium ${item.warna}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Deadline: {item.deadline}</p>
                  <div className="flex justify-between mt-2 text-[11px] text-gray-500">
                    <span>Progres</span>
                    <span className="font-semibold text-[#1E3A8A]">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                    <div
                      className="bg-[#1E3A8A] h-1.5 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RINGKASAN KEUANGAN */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Ringkasan Keuangan Proyek</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-5 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Total Anggaran</p>
            <p className="text-xl font-bold text-[#1E3A8A]">{formatRupiah(financeSummary.totalBudget)}</p>
            <p className="text-xs text-gray-400 mt-1">Dari proyek Anda</p>
          </div>
          <div className="bg-green-50 p-5 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Terpakai</p>
            <p className="text-xl font-bold text-green-600">{formatRupiah(financeSummary.totalUsed)}</p>
            <p className="text-xs text-gray-400 mt-1">{usedPercent}% dari anggaran</p>
          </div>
          <div className="bg-purple-50 p-5 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Sisa Anggaran</p>
            <p className="text-xl font-bold text-purple-600">{formatRupiah(remainingBudget)}</p>
            <p className="text-xs text-gray-400 mt-1">{remainingPercent}% tersisa</p>
          </div>
        </div>
      </div>

    </PJLayout>
  );
}
