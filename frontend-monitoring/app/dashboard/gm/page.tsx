"use client";

import GMLayout from "@/components/GMLayout";
import { Briefcase, TrendingUp, DollarSign } from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

const data = [
  { name: "A", value: 450 },
  { name: "B", value: 320 },
  { name: "C", value: 280 },
  { name: "D", value: 390 },
];


export default function GMPage() {
  return (
    <GMLayout>
      <div className="space-y-4">

        {/* CARD */}
        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Proyek Aktif</p>
              <h2 className="text-2xl font-bold">12</h2>
            </div>
            <Briefcase className="text-[#1E3A8A]" />
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Progres Rata-rata</p>
              <h2 className="text-2xl font-bold">85%</h2>
            </div>
            <TrendingUp className="text-green-600" />
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Anggaran</p>
              <h2 className="text-2xl font-bold">Rp 4.5M</h2>
            </div>
            <DollarSign className="text-yellow-600" />
          </div>

        </div>

        {/* KEUANGAN CHART (TETAP ADA) */}
         <div className="bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="font-semibold mb-4">
        Ringkasan Keuangan
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            fill="#1E3A8A"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>

        {/* PROYEK AKTIF */}
        <div className="bg-white p-8 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-4">Proyek Aktif</h3>

          <div className="space-y-4">
            {[
              { name: "Gedung Perkantoran", location: "Jakarta Selatan", progress: 85, status: "On Track" },
              { name: "Renovasi Perumahan", location: "Tangerang", progress: 72, status: "On Track" },
              { name: "Jembatan Layang", location: "Bekasi", progress: 45, status: "Delay" },
            ].map((p, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg">

                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.location}</p>
                  </div>

                  <span
                    className={`px-3 py-4 rounded-full text-xs ${
                      p.status === "On Track"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm">
                    <span>Progres</span>
                    <span>{p.progress}%</span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                    <div
                      className="bg-[#1E3A8A] h-2 rounded-full"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* TABEL KEUANGAN */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-4">
            Ringkasan Keuangan Proyek
          </h3>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Proyek</th>
                <th className="text-left p-3">Anggaran</th>
                <th className="text-left p-3">Terpakai</th>
                <th className="text-left p-3">Sisa</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {[
                { name: "Gedung Perkantoran", budget: 1200000000, used: 1020000000, remain: 180000000, status: "Sehat" },
                { name: "Renovasi Perumahan", budget: 800000000, used: 576000000, remain: 224000000, status: "Sehat" },
                { name: "Jembatan Layang", budget: 2000000000, used: 900000000, remain: 1100000000, status: "Sehat" },
                { name: "Mall Modern", budget: 1500000000, used: 1350000000, remain: 150000000, status: "Perhatian" },
              ].map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">Rp {p.budget.toLocaleString("id-ID")}</td>
                  <td className="p-3">Rp {p.used.toLocaleString("id-ID")}</td>
                  <td className="p-3">Rp {p.remain.toLocaleString("id-ID")}</td>
                  <td className="p-3">
                    <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      p.status === "Sehat"
                        ? "bg-green-100 text-green-600"
                        : p.status === "Perhatian"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.status}
                  </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </GMLayout>
  );
}