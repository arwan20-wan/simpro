"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Search, Pencil, Trash2 } from "lucide-react";


export default function DataKaryawan() {
const [toast, setToast] = useState({
  show: false,
  message: "",
});

const showToast = (msg: string) => {
  setToast({ show: true, message: msg });

  setTimeout(() => {
    setToast({ show: false, message: "" });
  }, 3000);
};

  const [data, setData] = useState([
    {
      id: "PJ-2025-001",
      nama: "Ahmad Fauzi",
      email: "ahmad.fauzi@simpro.id",
      jabatan: "Penanggung Jawab",
      status: "Aktif",
      bergabung: "15 Jan 2025",
    },
    {
      id: "GM-2025-001",
      nama: "Siti Nurhaliza",
      email: "siti.nurhaliza@simpro.id",
      jabatan: "General Manager",
      status: "Aktif",
      bergabung: "10 Feb 2025",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama: "",
    email: "",
    telp: "",
    jabatan: "",
    alamat: "",
    password: "",
    confirmPassword: "",
    status: "Aktif",
  });

  // FILTER
 const filteredData = data.filter((item) => {
  const matchSearch =
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase());

  const matchJabatan = filterJabatan
    ? item.jabatan === filterJabatan
    : true;

  const matchStatus = filterStatus
    ? item.status === filterStatus
    : true;

  return matchSearch && matchJabatan && matchStatus;
});

  // OPEN MODAL
  const openModal = (item: any = null) => {
    if (item) {
      setEditId(item.id);
      setForm({
        ...item,
        telp: "",
        alamat: "",
        password: "",
        confirmPassword: "",
      });
    } else {
      setEditId(null);
      setForm({
        nama: "",
        email: "",
        telp: "",
        jabatan: "",
        alamat: "",
        password: "",
        confirmPassword: "",
        status: "Aktif",
      });
    }
    setShowModal(true);
  };

  // SIMPAN
  const handleSubmit = () => {
  if (form.password !== form.confirmPassword) {
    alert("Password tidak sama!");
    return;
  }

  if (editId) {
    setData(
      data.map((item) =>
        item.id === editId ? { ...item, ...form } : item
      )
    );

    showToast("Data karyawan berhasil diupdate ✅");

  } else {
    setData([
      ...data,
      {
        id: "EMP-" + Date.now(),
        ...form,
        bergabung: new Date().toLocaleDateString(),
      },
    ]);

    showToast("Karyawan berhasil ditambahkan ✅");
  }

  setShowModal(false);
};

  // DELETE
  const handleDelete = (id: string) => {
  setData(data.filter((item) => item.id !== id));
  showToast("Data karyawan berhasil dihapus 🗑️");
};

{toast.show && (
  <div className="fixed top-5 right-5 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg text-sm animate-slide-in">
    {toast.message}
  </div>
)}

  return (
    <AdminLayout>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-sm font-semibold text-gray-700">
            Manajemen Karyawan
          </h1>
          <p className="text-sm text-gray-500">
            Kelola data karyawan dan akun pengguna
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="bg-[#1E3A8A] text-white px-7 py-3 !rounded-full text-sm shadow hover:bg-[#162d6b] transition"
        >
          + Tambah Karyawan
        </button>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

        {/* FILTER + SEARCH */}
<div className="p-4 flex items-center gap-3">

  {/* SEARCH */}
  <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full">
    <Search size={16} className="text-gray-400" />
    <input
      type="text"
      placeholder="Cari karyawan..."
      className="bg-transparent outline-none ml-2 text-sm w-full"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* FILTER JABATAN */}
  <select
    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
    value={filterJabatan}
    onChange={(e) => setFilterJabatan(e.target.value)}
  >
    <option value="">Semua Jabatan</option>
    <option value="Penanggung Jawab">Penanggung Jawab</option>
    <option value="General Manager">General Manager</option>
    <option value="Administrator">Administrator</option>
  </select>

  {/* FILTER STATUS */}
  <select
    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
  >
    <option value="">Semua Status</option>
    <option value="Aktif">Aktif</option>
    <option value="Nonaktif">Tidak Aktif</option>
  </select>

</div>

        {/* TABLE */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 border-y">
            <tr>
              <th className="p-4 text-left font-medium">ID</th>
              <th className="p-4 text-left font-medium">Nama</th>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Jabatan</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-left font-medium">Bergabung</th>
              <th className="p-4 text-center font-medium">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">

                <td className="p-4 text-gray-700">{item.id}</td>

                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1E3A8A] text-white flex items-center justify-center rounded-full text-sm font-semibold">
                      {item.nama.charAt(0)}
                    </div>
                    <span className="font-medium">{item.nama}</span>
                  </div>
                </td>

                <td className="p-4 text-gray-600">{item.email}</td>

                <td className="p-4">
                  <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                    {item.jabatan}
                  </span>
                </td>

                <td className="p-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    item.status === "Aktif"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {item.status}
                  </span>
                </td>

                <td className="p-4 text-gray-600">{item.bergabung}</td>

                <td className="p-4 flex justify-center gap-3">
                  <button onClick={() => openModal(item)}>
                    <Pencil size={16} className="text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(item.id)}>
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[750px] rounded-2xl shadow-lg">

            {/* HEADER */}
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {editId ? "Edit Karyawan" : "Tambah Karyawan Baru"}
              </h2>
            </div>

            {/* BODY */}
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">

              <div>
                <label className="text-gray-600">Nama Lengkap</label>
                <input className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Email</label>
                <input className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Nomor Telepon</label>
                <input className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.telp}
                  onChange={(e) => setForm({ ...form, telp: e.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Jabatan</label>
                <select className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.jabatan}
                  onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                >
                  <option value="">Pilih jabatan...</option>
                  <option>Penanggung Jawab</option>
                  <option>General Manager</option>
                  <option>Administrator</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-gray-600">Alamat</label>
                <textarea className="w-full border rounded-lg px-3 py-2 mt-1 h-24"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Password</label>
                <input type="password" className="w-full border rounded-lg px-3 py-2 mt-1"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Konfirmasi Password</label>
                <input type="password" className="w-full border rounded-lg px-3 py-2 mt-1"
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <label className="text-gray-600">Status</label>
                <select className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
              </div>

            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border rounded-lg text-gray-600"
              >
                Batal
              </button>

              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-[#1E3A8A] text-white rounded-lg"
              >
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}