"use client";

import GMLayout from "@/components/GMLayout";
import { Eye, Download, Image as ImageIcon } from "lucide-react";




  export default function Page() {
  const data = [
    {
      tanggal: "12 Apr 2026",
      proyek: "Gedung Perkantoran",
      judul: "Laporan Harian - Pekerjaan Struktur Lantai 5",
      foto: 4,
      pj: "Ahmad Fauzi",
    },
    {
      tanggal: "11 Apr 2026",
      proyek: "Gedung Perkantoran",
      judul: "Laporan Harian - Pemasangan Kolom Utama",
      foto: 3,
      pj: "Ahmad Fauzi",
    },
    {
      tanggal: "10 Apr 2026",
      proyek: "Renovasi Perumahan",
      judul: "Laporan Harian - Finishing Cat Eksterior",
      foto: 2,
      pj: "Budi Santoso",
    },
    {
      tanggal: "12 Apr 2026",
      proyek: "Mall Modern",
      judul: "Laporan Harian - Instalasi MEP Lantai 3",
      foto: 4,
      pj: "Dewi Lestari",
    },
  ];
  return (
  <GMLayout>
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h1 className="text-xl font-semibold">Laporan Proyek</h1>
        <p className="text-sm text-gray-500 mt-1">
          Lihat dan download laporan harian, bulanan, dan keuangan proyek
        </p>
      </div>

      {/* FILTER */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Cari laporan..."
          className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none"
        />

        <select className="border rounded-lg px-4 py-2 text-sm">
          <option>Semua Proyek</option>
          <option>Gedung Perkantoran</option>
          <option>Renovasi Perumahan</option>
        </select>
      </div>

      {/* TAB */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button className="px-4 py-1 bg-white rounded-md text-sm shadow">
          Harian
        </button>
        <button className="px-4 py-1 text-sm text-gray-500">
          Bulanan
        </button>
        <button className="px-4 py-1 text-sm text-gray-500">
          Keuangan
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Tanggal</th>
              <th className="text-left p-3">Proyek</th>
              <th className="text-left p-3">Judul</th>
              <th className="text-left p-3">Foto</th>
              <th className="text-left p-3">PJ</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3">{item.tanggal}</td>

                <td className="p-3">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                    {item.proyek}
                  </span>
                </td>

                <td className="p-3">{item.judul}</td>

                <td className="p-3 flex items-center gap-1">
                  <ImageIcon size={14} />
                  {item.foto} foto
                </td>

                <td className="p-3">{item.pj}</td>

                <td className="p-3 flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs hover:bg-gray-100">
                    <Eye size={14} /> Lihat
                  </button>

                  <button className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs hover:bg-gray-100">
                    <Download size={14} /> Download
                  </button>
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
