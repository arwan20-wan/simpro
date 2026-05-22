"use client";

import { useState } from "react";
import GMLayout from "@/components/GMLayout";

import {
  Eye,
  Download,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("harian");

  // ================= HARIAN =================
  const harianData = [
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
  ];

  // ================= BULANAN =================
  const bulananData = [
    {
      bulan: "Maret 2026",
      proyek: "Gedung Perkantoran",
      judul: "Laporan Bulanan Maret 2026 - Gedung Perkantoran",
      size: "2.4 MB",
      pj: "Ahmad Fauzi",
    },
    {
      bulan: "Maret 2026",
      proyek: "Renovasi Perumahan",
      judul: "Laporan Bulanan Maret 2026 - Renovasi Perumahan",
      size: "1.8 MB",
      pj: "Budi Santoso",
    },
    {
      bulan: "Februari 2026",
      proyek: "Gedung Perkantoran",
      judul: "Laporan Bulanan Februari 2026 - Gedung Perkantoran",
      size: "2.1 MB",
      pj: "Ahmad Fauzi",
    },
  ];

  // ================= KEUANGAN =================
  const keuanganData = [
    {
      tanggal: "12 Apr 2026",
      proyek: "Gedung Perkantoran",
      kategori: "Bahan Bangunan",
      deskripsi: "Pembelian semen - 100 sak",
      jumlah: "Rp 7.500.000",
      pj: "Ahmad Fauzi",
    },
    {
      tanggal: "11 Apr 2026",
      proyek: "Gedung Perkantoran",
      kategori: "Upah Pekerja",
      deskripsi: "Gaji pekerja mingguan",
      jumlah: "Rp 15.000.000",
      pj: "Ahmad Fauzi",
    },
    {
      tanggal: "10 Apr 2026",
      proyek: "Renovasi Perumahan",
      kategori: "Alat Berat",
      deskripsi: "Sewa excavator",
      jumlah: "Rp 8.500.000",
      pj: "Budi Santoso",
    },
  ];

  return (
    <GMLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h1 className="text-xl font-semibold">
            Laporan Proyek
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Lihat dan download laporan harian, bulanan,
            dan transaksi keuangan dari semua proyek
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

          <button
            onClick={() => setActiveTab("harian")}
            className={`px-4 py-2 rounded-md text-sm transition
              ${
                activeTab === "harian"
                  ? "bg-white shadow font-medium"
                  : "text-gray-500"
              }`}
          >
            Laporan Harian
          </button>

          <button
            onClick={() => setActiveTab("bulanan")}
            className={`px-4 py-2 rounded-md text-sm transition
              ${
                activeTab === "bulanan"
                  ? "bg-white shadow font-medium"
                  : "text-gray-500"
              }`}
          >
            Laporan Bulanan
          </button>

          <button
            onClick={() => setActiveTab("keuangan")}
            className={`px-4 py-2 rounded-md text-sm transition
              ${
                activeTab === "keuangan"
                  ? "bg-white shadow font-medium"
                  : "text-gray-500"
              }`}
          >
            Laporan Keuangan
          </button>

        </div>

        {/* ================= HARIAN ================= */}
        {activeTab === "harian" && (
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
                {harianData.map((item, i) => (
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
                      <button className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs">
                        <Eye size={14} />
                        Lihat
                      </button>

                      <button className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs">
                        <Download size={14} />
                        Download
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= BULANAN ================= */}
        {activeTab === "bulanan" && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Bulan</th>
                  <th className="text-left p-3">Proyek</th>
                  <th className="text-left p-3">Judul Laporan</th>
                  <th className="text-left p-3">Ukuran File</th>
                  <th className="text-left p-3">PJ</th>
                  <th className="text-left p-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {bulananData.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">

                    <td className="p-3">{item.bulan}</td>

                    <td className="p-3">
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                        {item.proyek}
                      </span>
                    </td>

                    <td className="p-3 flex items-center gap-2">
                      <FileText size={15} className="text-blue-600" />
                      {item.judul}
                    </td>

                    <td className="p-3 text-gray-500">
                      {item.size}
                    </td>

                    <td className="p-3">{item.pj}</td>

                    <td className="p-3 flex gap-2">

                      <button className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs">
                        <Eye size={14} />
                        Lihat
                      </button>

                      <button className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs">
                        <Download size={14} />
                        Download
                      </button>

                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= KEUANGAN ================= */}
        {activeTab === "keuangan" && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Tanggal</th>
                  <th className="text-left p-3">Proyek</th>
                  <th className="text-left p-3">Kategori</th>
                  <th className="text-left p-3">Deskripsi</th>
                  <th className="text-left p-3">Jumlah</th>
                  <th className="text-left p-3">PJ</th>
                  <th className="text-left p-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {keuanganData.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">

                    <td className="p-3">{item.tanggal}</td>

                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                        {item.proyek}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">
                        {item.kategori}
                      </span>
                    </td>

                    <td className="p-3">{item.deskripsi}</td>

                    <td className="p-3 font-medium">
                      {item.jumlah}
                    </td>

                    <td className="p-3">{item.pj}</td>

                    <td className="p-3">
                      <button className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs">
                        <Download size={14} />
                        Unduh Bukti
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </GMLayout>
  );
}