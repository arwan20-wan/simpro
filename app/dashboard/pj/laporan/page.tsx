"use client";

import { useState } from "react";
import PJLayout from "@/components/PJLayout";
import { Search } from "lucide-react";

export default function LaporanPJ() {
  const [laporan, setLaporan] = useState<any[]>([]);
const [showModal, setShowModal] = useState(false);

const handleDownload = (file: File | null) => {
  if (!file) {
    alert("Tidak ada file!");
    return;
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
};

const [form, setForm] = useState({
  judul: "",
  proyek: "",
  jenis: "",
  deskripsi: "",
  progress: "",
  foto: null as File | null,
  dokumen: null as File | null,
});

const handleSubmit = () => {
  if (!form.judul || !form.proyek || !form.jenis) {
    alert("Harap isi semua field!");
    return;
  }

  const newData = {
    id: Date.now(),
    judul: form.judul,
    proyek: form.proyek,
    jenis: form.jenis,
    tanggal: new Date().toLocaleDateString(),
    status: "Pending",
    foto: form.foto,
    dokumen: form.dokumen,
  };

  setLaporan([newData, ...laporan]);

  setForm({
    judul: "",
    proyek: "",
    jenis: "",
    deskripsi: "",
    progress: "",
    foto: null,
    dokumen: null,
  });

  setShowModal(false);
};

  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterProyek, setFilterProyek] = useState("");

  const data = [
    {
      judul: "Laporan Progress Harian - Pondasi",
      proyek: "Gedung Perkantoran",
      jenis: "Harian",
      tanggal: "12 Mar 2026",
    },
    {
      judul: "Laporan Bulanan Februari 2026",
      proyek: "Renovasi Perumahan",
      jenis: "Bulanan",
      tanggal: "10 Mar 2026",
    },
  ];

  const allData = [...laporan, ...data];

const filteredData = allData.filter((item) => {
  const matchSearch =
    item.judul.toLowerCase().includes(search.toLowerCase()) ||
    item.proyek.toLowerCase().includes(search.toLowerCase());

  const matchJenis = filterJenis
    ? item.jenis.toLowerCase().includes(filterJenis.toLowerCase())
    : true;

  const matchProyek = filterProyek
    ? item.proyek === filterProyek
    : true;

  return matchSearch && matchJenis && matchProyek;
});

  return (
        <PJLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-semibold">Laporan Proyek</h1>
          <p className="text-sm text-gray-500">
            Kelola dan upload laporan proyek Anda
          </p>
        </div>

        <button
onClick={() => setShowModal(true)}
className="bg-[#1E3A8A] text-white px-5 py-2 rounded-lg text-sm">+ Buat Laporan Baru</button>
      </div>

      {showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white w-[700px] rounded-xl shadow-lg">

      {/* HEADER */}
      <div className="px-6 py-4 border-b">
        <h2 className="font-semibold text-gray-800">
          Buat Laporan Baru
        </h2>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-4 text-sm">

        {/* Judul */}
        <div>
          <label className="text-gray-600">Judul Laporan</label>
          <input
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="Masukkan judul laporan"
            value={form.judul}
            onChange={(e) =>
              setForm({ ...form, judul: e.target.value })
            }
          />
        </div>

        {/* Dropdown */}
        <div className="grid grid-cols-2 gap-4">

          {/* Proyek */}
          <div>
            <label className="text-gray-600">Pilih Proyek</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.proyek}
              onChange={(e) =>
                setForm({ ...form, proyek: e.target.value })
              }
            >
              <option value="">Pilih proyek...</option>
              <option>Gedung Perkantoran</option>
              <option>Renovasi Rumah</option>
              <option>Mall Modern</option>
            </select>
          </div>

          {/* Jenis */}
          <div>
            <label className="text-gray-600">Jenis Laporan</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.jenis}
              onChange={(e) =>
                setForm({ ...form, jenis: e.target.value })
              }
            >
              <option value="">Pilih jenis...</option>
              <option>Laporan Harian</option>
              <option>Laporan Mingguan</option>
              <option>Laporan Bulanan</option>
            </select>
          </div>

        </div>

        {/* Deskripsi */}
        <div>
          <label className="text-gray-600">Deskripsi / Catatan</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 mt-1 h-24"
            placeholder="Tuliskan deskripsi laporan..."
            value={form.deskripsi}
            onChange={(e) =>
              setForm({ ...form, deskripsi: e.target.value })
            }
          />
        </div>

        {/* Upload Foto */}
<div>
  <label className="text-gray-600">Upload Foto Dokumentasi</label>
  <input
    type="file"
    accept="image/*"
    className="w-full border rounded-lg px-3 py-2 mt-1"
    onChange={(e) =>
      setForm({ ...form, foto: e.target.files?.[0] || null })
    }
  />
</div>

{/* Upload Dokumen */}
<div>
  <label className="text-gray-600">Upload Dokumen Pendukung</label>
  <input
    type="file"
    accept=".pdf,.doc,.docx"
    className="w-full border rounded-lg px-3 py-2 mt-1"
    onChange={(e) =>
      setForm({ ...form, dokumen: e.target.files?.[0] || null })
    }
  />
</div>

        {/* Progress */}
        <div>
          <label className="text-gray-600">
            Progres Pekerjaan (%)
          </label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="Masukkan persentase"
            value={form.progress}
            onChange={(e) =>
              setForm({ ...form, progress: e.target.value })
            }
          />
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Batal
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg"
        >
          Simpan Laporan
        </button>
      </div>

    </div>
  </div>
)}

      {/* CARD */}
      <div className="bg-white rounded-xl border">

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Laporan Hari Ini</p>
            <h2 className="font-bold">3</h2>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Laporan Bulan Ini</p>
            <h2 className="font-bold">24</h2>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Total Laporan</p>
            <h2 className="font-bold">156</h2>
          </div>
        </div>

        {/* SEARCH */}
        <div className="p-4 border-t flex gap-3">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari laporan..."
              className="bg-transparent outline-none ml-2 w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
  className="border rounded-lg px-3 text-sm"
  value={filterJenis}
  onChange={(e) => setFilterJenis(e.target.value)}
>
  <option value="">Semua Jenis</option>
  <option value="Harian">Harian</option>
  <option value="Mingguan">Mingguan</option>
  <option value="Bulanan">Bulanan</option>
</select>

          <select
  className="border rounded-lg px-3 text-sm"
  value={filterProyek}
  onChange={(e) => setFilterProyek(e.target.value)}
>
  <option value="">Semua Proyek</option>
  <option value="Gedung Perkantoran">Gedung Perkantoran</option>
  <option value="Renovasi Rumah">Renovasi Rumah</option>
  <option value="Mall Modern">Mall Modern</option>
</select>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-y text-gray-500">
            <tr>
              <th className="p-4 text-left">Judul</th>
              <th className="p-4 text-left">Proyek</th>
              <th className="p-4 text-left">Jenis</th>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
  {filteredData.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">

                <td className="p-4 font-medium">{item.judul}</td>
                <td className="p-4">{item.proyek}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                    {item.jenis}
                  </span>
                </td>
                <td className="p-4">{item.tanggal}</td>
                <td className="p-4 text-center space-x-2">

  <button
    onClick={() => handleDownload(item.foto)}
    className="text-blue-600 text-xs"
  >
    Foto
  </button>

  <button
    onClick={() => handleDownload(item.dokumen)}
    className="text-green-600 text-xs"
  >
    Dokumen
  </button>

</td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </PJLayout>
  );
}