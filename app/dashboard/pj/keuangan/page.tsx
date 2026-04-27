"use client";

import { useState } from "react";
import PJLayout from "@/components/PJLayout";
import { Plus, Download, Upload, Wallet,  Eye } from "lucide-react";

export default function PJKeuangan() {
  const [showModal, setShowModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);


const [zoom, setZoom] = useState(1);
const [position, setPosition] = useState({ x: 0, y: 0 });
const [isDragging, setIsDragging] = useState(false);
const [startPos, setStartPos] = useState({ x: 0, y: 0 });

const handleMouseDown = (e: any) => {
  setIsDragging(true);
  setStartPos({
    x: e.clientX - position.x,
    y: e.clientY - position.y,
  });
};

const handleMouseMove = (e: any) => {
  if (!isDragging) return;

  setPosition({
    x: e.clientX - startPos.x,
    y: e.clientY - startPos.y,
  });
};

const handleMouseUp = () => {
  setIsDragging(false);
};


const handleDownload = (file: any, name: string) => {
  if (!file) return;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = name;
  link.click();
};

const [previewFile, setPreviewFile] = useState<string | null>(null);

  // ================= DATA PROJECT =================
const projects = [
  {
    name: "Gedung Perkantoran",
    budget: 500000000,
  },
  {
    name: "Renovasi Perumahan",
    budget: 300000000,
  },
];

// ================= DATA TRANSAKSI =================
const [transactions, setTransactions] = useState<Transaction[]>([
  {
    date: "12 Mar 2026",
    project: "Gedung Perkantoran",
    description: "Pembelian semen",
    amount: 200000000,
    receipt: null,
    receiptUrl: null,
  },
]);

  const getProjectStatus = (projectName: string) => {
  const project = projects.find(p => p.name === projectName);
  if (!project) return { text: "-", color: "" };

  // total pengeluaran project itu
  const totalUsed = transactions
    .filter(t => t.project === projectName)
    .reduce((sum, t) => sum + t.amount, 0);

  const percent = (totalUsed / project.budget) * 100;

  if (percent >= 100) {
    return { text: "Bahaya", color: "bg-red-100 text-red-600" };
  }

  if (percent >= 80) {
    return { text: "Rawan", color: "bg-yellow-100 text-yellow-600" };
  }

  return { text: "Aman", color: "bg-green-100 text-green-600" };
};


  // ================= FILE =================
  const handleFileChange = (e: any) => {
    if (e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  // ================= HITUNG TOTAL =================

// total anggaran semua project
const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

// total pengeluaran semua transaksi
const totalUsed = transactions.reduce((sum, t) => sum + t.amount, 0);

// sisa anggaran
const remaining = totalBudget - totalUsed;

// format rupiah
const formatRupiah = (number: number) => {
  return "Rp " + number.toLocaleString("id-ID");
};

const [form, setForm] = useState({
  date: "",
  project: "",
  description: "",
  amount: "",
});

const handleChange = (e: any) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};

const handleAddTransaction = () => {
  if (!form.project || !form.amount) {
    alert("Data belum lengkap!");
    return;
  }

  const newData = {
  date: form.date,
  project: form.project,
  description: form.description,
  amount: Number(form.amount),

  // 🔥 WAJIB ADA KOMA SEBELUM INI
  receipt: receiptFile,
  receiptUrl: receiptFile
    ? URL.createObjectURL(receiptFile)
    : null,
};

  setTransactions([...transactions, newData]);

  // reset
  setForm({
    date: "",
    project: "",
    description: "",
    amount: "",
  });

   setReceiptFile(null);
  setShowModal(false);
};



type Transaction = {
  date: string;
  project: string;
  description: string;
  amount: number;
  receipt: File | null;
  receiptUrl: string | null;
};

  return (
    <PJLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="bg-white rounded-xl p-6 border shadow-sm border-gray-200 mb-4">
          <h3 className="text-lg font-semibold">Manajemen Keuangan</h3>
          <p className="text-sm text-gray-500">
            Kelola pengeluaran dan anggaran proyek
          </p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-6 mt-2">
          <div className="bg-blue-50 p-6 rounded-xl border">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="text-blue-600" />
              <p className="text-sm text-blue-600">Total Anggaran</p>
            </div>
            <p className="text-2xl font-semibold text-blue-900">
              {formatRupiah(totalBudget)}
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-xl border">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="text-green-600" />
              <p className="text-sm text-green-600">Terpakai</p>
            </div>
            <p className="text-2xl font-semibold text-green-900">
                {formatRupiah(totalUsed)}
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="text-purple-600" />
              <p className="text-sm text-purple-600">Sisa</p>
            </div>
            <p className="text-2xl font-semibold text-purple-900">
              {formatRupiah(remaining)}
            </p>
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Tambah Pengeluaran
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b">
            <h3 className="font-semibold">Riwayat Transaksi</h3>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Tanggal</th>
                <th className="p-4 text-left">Lokasi</th>
                <th className="p-4 text-left">Deskripsi</th>
                <th className="p-4 text-left">Jumlah</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
  {transactions.map((t, i) => {
    const status = getProjectStatus(t.project);

    return (
      <tr key={i} className="border-t">
        <td className="p-4">{t.date}</td>
        <td className="p-4">{t.project}</td>
        <td className="p-4">{t.description}</td>
        <td className="p-4">
          {"Rp " + t.amount.toLocaleString("id-ID")}
        </td>

        {/* STATUS PER PROJECT */}
        <td className="p-4">
          <span className={`px-3 py-1 rounded-full text-xs ${status.color}`}>
            {status.text}
          </span>
        </td>

        <td className="p-4 flex gap-2">

  {/* VIEW */}
  <button
    disabled={!t.receiptUrl}
    onClick={() => setPreviewFile(t.receiptUrl!)}
    className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30"
    title="Lihat"
  >
    <Eye size={16} />
  </button>

  {/* DOWNLOAD */}
  <button
    disabled={!t.receipt}
    onClick={() => handleDownload(t.receipt, "bukti-transaksi")}
    className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30"
    title="Unduh"
  >
    <Download size={16} />
  </button>

</td>
      </tr>
    );
  })}
</tbody>
          </table>
{previewFile && (
  <div
    className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    onClick={() => {
      setPreviewFile(null);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }}
  >

    {/* TOMBOL CLOSE */}
    <button
      onClick={(e) => {
        e.stopPropagation(); // biar gak nutup karena background
        setPreviewFile(null);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }}
      className="absolute top-5 right-5 text-white text-3xl font-bold z-50"
    >
      ✕
    </button>

    {/* AREA GAMBAR */}
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={(e) => e.stopPropagation()} // biar klik gambar gak nutup
    >
      <img
        src={previewFile}
        draggable={false}
        style={{
          transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? "none" : "transform 0.2s",
        }}
        className="max-w-none max-h-none select-none"
      />
    </div>

    {/* ZOOM CONTROL */}
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-white/10 backdrop-blur px-4 py-2 rounded-full">

      <button
        onClick={(e) => {
          e.stopPropagation();
          setZoom((z) => Math.max(0.5, z - 0.2));
        }}
        className="text-white text-lg"
      >
        ➖
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setZoom((z) => z + 0.2);
        }}
        className="text-white text-lg"
      >
        ➕
      </button>

    </div>
  </div>
)}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-[700px] rounded-xl max-h-[85vh] flex flex-col">

              <div className="p-6 border-b font-semibold text-xl text-gray-800">
                Tambah Pengeluaran
              </div>
            
              <div className="p-6 space-y-4 text-sm">
                 <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal
                </label>
                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg"
                    />
                </div>
                 <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi Proyek
                </label>
                <select
  name="project"
  value={form.project}
  onChange={handleChange}
  className="w-full border p-2 rounded-lg"
>
  <option value="">Pilih Proyek</option>
  {projects.map((p, i) => (
    <option key={i}>{p.name}</option>
  ))}
</select>
              </div>

                 <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                 name="description"
                 value={form.description}
                 onChange={handleChange}
                 className="w-full border p-2 rounded"
                 placeholder="Tuliskan deskripsi pengeluaran"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  name="amount"
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  placeholder="Masukkan Jumlah pengeluaran"
                />
                </div>

                {/* UPLOAD */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Bukti Transaksi / Nota
                </label>
                <div className="ww-full border rounded-lg px-3 py-2 mt-1">
                  <p className="text-sm text-gray-600">
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex">
                <button onClick={() => setShowModal(false)}>Batal</button>

                <button
  onClick={handleAddTransaction}
  className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg"
>
  Simpan
</button>
              </div>

            </div>
          </div>
        )}
      </div>
    </PJLayout>
  );
}