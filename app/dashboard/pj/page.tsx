"use client";

import PJLayout from "@/components/PJLayout";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPJ() {

  const dataChart = {
    labels: ["Selesai", "Dalam Proses", "Tertunda"],
    datasets: [
      {
        data: [65, 25, 10],
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

  const projects = [
    {
      nama: "Pembangunan Gedung Perkantoran",
      progress: 85,
      status: "Tinggi",
      warna: "bg-red-100 text-red-600",
      deadline: "15 Apr 2026",
    },
    {
      nama: "Renovasi Kompleks Perumahan",
      progress: 72,
      status: "Sedang",
      warna: "bg-blue-100 text-blue-600",
      deadline: "20 Apr 2026",
    },
    {
      nama: "Konstruksi Mall Modern",
      progress: 90,
      status: "Tinggi",
      warna: "bg-red-100 text-red-600",
      deadline: "10 Apr 2026",
    },
  ];

  const summaryCards = [
    {
      label: "Laporan Bulan Ini",
      value: "24",
      sub: "+4 dari bulan lalu",
      subColor: "text-green-600",
      iconBg: "bg-blue-50",
      icon: "📄",
    },
    {
      label: "Proyek Aktif",
      value: "3",
      sub: null,
      subColor: "",
      iconBg: "bg-green-50",
      icon: "🏗️",
    },
    {
      label: "Total Pengeluaran",
      value: "Rp 450jt",
      sub: null,
      subColor: "",
      iconBg: "bg-yellow-50",
      icon: "💰",
    },
    {
      label: "Proyek Selesai",
      value: "8",
      subColor: "text-green-600",
      iconBg: "bg-purple-50",
      icon: "✔️",
    },
  ];

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

          <div className="flex items-center gap-8 justify-center">
            <div className="relative w-44 h-44">
              <Doughnut data={dataChart} options={options} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-800">65%</span>
                <span className="text-xs text-gray-400">Selesai</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { color: "bg-green-500", label: "Selesai", pct: "65%" },
                { color: "bg-[#1E3A8A]", label: "Dalam Proses", pct: "25%" },
                { color: "bg-amber-400", label: "Tertunda", pct: "10%" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                  <span className="text-gray-600">{item.label}</span>
                  <span className="ml-auto font-semibold text-gray-700">{item.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROYEK SAYA */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Proyek Saya</h2>

          <div className="space-y-3">
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
        </div>
      </div>

      {/* RINGKASAN KEUANGAN */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Ringkasan Keuangan Proyek</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-5 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Total Anggaran</p>
            <p className="text-xl font-bold text-[#1E3A8A]">Rp 1.200.000.000</p>
            <p className="text-xs text-gray-400 mt-1">Dari semua proyek</p>
          </div>
          <div className="bg-green-50 p-5 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Terpakai</p>
            <p className="text-xl font-bold text-green-600">Rp 450.000.000</p>
            <p className="text-xs text-gray-400 mt-1">37.5% dari anggaran</p>
          </div>
          <div className="bg-purple-50 p-5 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Sisa Anggaran</p>
            <p className="text-xl font-bold text-purple-600">Rp 750.000.000</p>
            <p className="text-xs text-gray-400 mt-1">62.5% tersisa</p>
          </div>
        </div>
      </div>

    </PJLayout>
  );
}