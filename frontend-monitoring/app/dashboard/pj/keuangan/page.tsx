"use client";

import { useState, useEffect } from "react";
import PJLayout from "@/components/PJLayout";
import { Plus, Download, Upload, Wallet,  Eye } from "lucide-react";
import API from '@/services/api';

export default function PJKeuangan() {
  const [showModal, setShowModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);


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

const isPreviewableFile = (url: string) => {
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(url);
};

const getFileNameFromUrl = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1] || 'file';
};

const handleViewReceipt = (receiptUrl: string) => {
  if (isPreviewableFile(receiptUrl)) {
    setPreviewFile(receiptUrl);
    return;
  }
  window.open(receiptUrl, '_blank');
};

const handleDownloadReceipt = async (receiptUrl: string) => {
  try {
    const response = await fetch(receiptUrl);
    if (!response.ok) throw new Error('Failed to fetch file');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getFileNameFromUrl(receiptUrl);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download error:', err);
    alert('Gagal mengunduh file.');
  }
};

const [previewFile, setPreviewFile] = useState<string | null>(null);

  // ================= DATA PROJECT =================
const [projects, setProjects] = useState<any[]>([]);

// ================= DATA TRANSAKSI =================
const [transactions, setTransactions] = useState<Transaction[]>([]);

  const getProjectStatus = (projectName: string) => {
  const project = projects.find((p) => p.name === projectName || p.id === projectName);
  if (!project) return { text: "-", color: "" };

  const status = project.status ?? projectStatusFromRatio(project.used ?? 0, project.budget ?? 0);

  if (status === 'aman') return { text: 'Aman', color: 'bg-green-100 text-green-600' };
  if (status === 'perhatian') return { text: 'Rawan', color: 'bg-yellow-100 text-yellow-600' };
  return { text: 'Bahaya', color: 'bg-red-100 text-red-600' };
};

const projectStatusFromRatio = (used: number, budget: number) => {
  if (!budget || budget <= 0) return 'tidak aman';
  const ratio = used / budget;
  if (ratio <= 0.7) return 'aman';
  if (ratio <= 1.0) return 'perhatian';
  return 'tidak aman';
}


  // ================= FILE =================
  const handleFileChange = (e: any) => {
    if (e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  // ============== FETCH FROM API ==============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryRes = await API.get('/pj/finance/summary');
        const txRes = await API.get('/pj/finance/transactions');

        const today = new Date().toISOString().split('T')[0];
        setForm((prev) => ({ ...prev, date: prev.date || today }));

        const proj = (summaryRes.data.projects || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          location: p.location,
          budget: p.budget,
          used: p.used,
          status: p.status,
        }));

        setProjects(proj);

        const mappedTx = (txRes.data.data || []).map((t: any) => ({
          date: t.transaction_date,
          project: t.project.name,
          projectId: t.project.id,
          description: t.description,
          amount: t.amount,
          receipt: null,
          receiptUrl: t.receipt_url ? t.receipt_url : null,
          status: t.status,
        } as Transaction));

        setTransactions(mappedTx);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();
  }, []);

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
    alert("Data belum lengkap! Pilih proyek dan masukkan jumlah.");
    return;
  }

  const submit = async () => {
    try {
      setIsLoading(true);
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('simpro_token') : null;
      console.log('Token:', token);
      
      if (!token) {
        alert('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const formData = new FormData();
      formData.append('project_id', form.project);
      formData.append('transaction_date', form.date || new Date().toISOString().slice(0,10));
      formData.append('type', 'expense');
      formData.append('category', form.description || 'Pengeluaran');
      formData.append('description', form.description || '');
      formData.append('amount', String(form.amount));
      if (receiptFile) {
        console.log('Receipt file:', receiptFile.name, receiptFile.size);
        formData.append('receipt', receiptFile);
      }

      console.log('Submitting transaction...');
      const res = await API.post('/pj/finance/transactions', formData);
      
      console.log('Success response:', res.data);

      const txRes = await API.get('/pj/finance/transactions');
      const mappedTx = (txRes.data.data || []).map((t: any) => ({
        date: t.transaction_date,
        project: t.project.name,
        projectId: t.project.id,
        description: t.description,
        amount: t.amount,
        receipt: null,
        receiptUrl: t.receipt_url || null,
        status: t.status,
      } as Transaction));

      setTransactions(mappedTx);

      setForm({ date: '', project: '', description: '', amount: '' });
      setReceiptFile(null);
      setShowModal(false);
      alert('Pengeluaran berhasil disimpan!');
    } catch (err: any) {
      console.error('Full error:', err);
      console.error('Error response:', err?.response?.data);
      const message = err?.response?.data?.message || err?.response?.data?.errors?.project_id?.[0] || err?.message || 'Gagal menyimpan transaksi';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  }

  submit();
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
    onClick={() => handleViewReceipt(t.receiptUrl!)}
    className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30"
    title="Lihat"
  >
    <Eye size={16} />
  </button>

  {/* DOWNLOAD */}
  <button
    disabled={!t.receiptUrl}
    onClick={() => handleDownloadReceipt(t.receiptUrl!)}
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
            <div className="bg-white w-full max-w-2xl rounded-xl max-h-[90vh] overflow-y-auto flex flex-col">

              <div className="p-6 border-b font-semibold text-xl text-gray-800 sticky top-0 bg-white">
                Tambah Pengeluaran
              </div>
            
              <div className="p-6 space-y-5 text-sm flex-1">
                 <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal
                </label>
                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Proyek --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}{p.location ? ` - ${p.location}` : ''}</option>
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
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tuliskan deskripsi pengeluaran"
                  rows={3}
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan jumlah pengeluaran"
                  min="0"
                  step="1"
                />
                </div>

                {/* UPLOAD */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Bukti Transaksi / Nota
                </label>
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="receipt-upload"
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 mt-1 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p className="text-sm font-medium text-gray-700">Pilih file atau drag & drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF (max 10MB)</p>
                  {receiptFile && (
                    <p className="text-xs text-green-600 mt-2">✓ {receiptFile.name}</p>
                  )}
                </label>
              </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>

                <button
                  onClick={handleAddTransaction}
                  disabled={isLoading}
                  className="bg-[#1E3A8A] text-white px-6 py-2 rounded-lg hover:bg-[#1a2f6b] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </PJLayout>
  );
}