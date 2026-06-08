"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "@/components/AdminLayout";
import API from "@/services/api";
import { Pencil, Search, Trash2 } from "lucide-react";

type Employee = {
  id: number;
  employee_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: "Penanggung Jawab" | "General Manager";
  address: string | null;
  birth_date: string | null;
  status: "Aktif" | "Nonaktif";
  is_active: boolean;
  joined_at: string | null;
};

type EmployeeForm = {
  name: string;
  email: string;
  phone: string;
  position: "" | "Penanggung Jawab" | "General Manager";
  address: string;  birthDate: string;  is_active: boolean;
};

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

const emptyForm: EmployeeForm = {
  name: "",
  email: "",
  phone: "",
  position: "",
  address: "",
  birthDate: "",
  is_active: true,
};

export default function DataKaryawan() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const loadEmployees = useCallback(async () => {
    setLoading(true);

    try {
      const response = await API.get("/admin/employees");
      setEmployees(response.data.data);
    } catch {
      showToast("Gagal memuat data karyawan. Pastikan sudah login sebagai Admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const filteredData = useMemo(() => {
    return employees.filter((item) => {
      const keyword = search.toLowerCase();
      const matchSearch =
        item.employee_id.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        (item.email ?? "").toLowerCase().includes(keyword);

      const matchJabatan = filterJabatan ? item.position === filterJabatan : true;
      const matchStatus = filterStatus ? item.status === filterStatus : true;

      return matchSearch && matchJabatan && matchStatus;
    });
  }, [employees, filterJabatan, filterStatus, search]);

  const openModal = (employee: Employee | null = null) => {
    setEditEmployee(employee);
    setForm(
      employee
        ? {
            name: employee.name,
            email: employee.email ?? "",
            phone: employee.phone ?? "",
            position: employee.position,
            address: employee.address ?? "",
            birthDate: employee.birth_date ?? "",
            is_active: employee.is_active,
          }
        : emptyForm
    );
    setShowModal(true);
  };

  const getErrorMessage = (error: unknown) => {
    const data = axios.isAxiosError<ApiError>(error) ? error.response?.data : undefined;
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;

    return firstError || data?.message || "Aksi gagal diproses.";
  };

  const handleSubmit = async () => {
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        position: form.position,
        address: form.address || null,
        birth_date: form.birthDate || null,
        is_active: form.is_active,
      };

      if (editEmployee) {
        const response = await API.put(`/admin/employees/${editEmployee.id}`, payload);

        setEmployees((current) =>
          current.map((employee) =>
            employee.id === editEmployee.id ? response.data.data : employee
          )
        );
        showToast("Data karyawan berhasil diupdate.");
      } else {
        const response = await API.post("/admin/employees", payload);

        setEmployees((current) => [response.data.data, ...current]);
        showToast(
          `Karyawan berhasil ditambahkan. ID login: ${response.data.data.employee_id}, password: 123456.`
        );
      }

      setShowModal(false);
    } catch (error: unknown) {
      showToast(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Hapus data karyawan ${employee.name}? Akun login ${employee.employee_id} juga akan terhapus.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/admin/employees/${employee.id}`);
      setEmployees((current) => current.filter((item) => item.id !== employee.id));
      showToast("Data karyawan berhasil dihapus.");
    } catch (error: unknown) {
      showToast(getErrorMessage(error));
    }
  };

  return (
    <AdminLayout>
      {toast.show && (
        <div className="fixed top-5 right-5 z-[60] bg-[#1E3A8A] text-white px-5 py-3 rounded-lg shadow-lg text-sm">
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-sm font-semibold text-gray-700">Manajemen Karyawan</h1>
          <p className="text-sm text-gray-500">
            Data karyawan otomatis menjadi akun login dengan password awal 123456.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="bg-[#1E3A8A] text-white px-7 py-3 !rounded-full text-sm shadow hover:bg-[#162d6b] transition"
        >
          + Tambah Karyawan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID, nama, atau email..."
              className="bg-transparent outline-none ml-2 text-sm w-full"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={filterJabatan}
            onChange={(event) => setFilterJabatan(event.target.value)}
          >
            <option value="">Semua Jabatan</option>
            <option value="Penanggung Jawab">Penanggung Jawab</option>
            <option value="General Manager">General Manager</option>
          </select>

          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Tidak Aktif</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 border-y">
            <tr>
              <th className="p-4 text-left font-medium">ID Login</th>
              <th className="p-4 text-left font-medium">Nama</th>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Jabatan</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-left font-medium">Bergabung</th>
              <th className="p-4 text-center font-medium">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  Memuat data karyawan...
                </td>
              </tr>
            )}

            {!loading && filteredData.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  Belum ada data karyawan.
                </td>
              </tr>
            )}

            {!loading &&
              filteredData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-700 font-medium">{item.employee_id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#1E3A8A] text-white flex items-center justify-center rounded-full text-sm font-semibold">
                        {item.name.charAt(0)}
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{item.email || "-"}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      {item.position}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        item.status === "Aktif"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{item.joined_at || "-"}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => openModal(item)} title="Edit karyawan">
                        <Pencil size={16} className="text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(item)} title="Hapus karyawan">
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[750px] rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {editEmployee ? "Edit Karyawan" : "Tambah Karyawan Baru"}
              </h2>
              {!editEmployee && (
                <p className="text-xs text-gray-500 mt-1">
                  ID login dibuat otomatis, password awal semua karyawan adalah 123456.
                </p>
              )}
            </div>

            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-600">Nama Lengkap</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Email</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Nomor Telepon</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Tanggal Lahir</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.birthDate}
                  onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Jabatan</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.position}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      position: event.target.value as EmployeeForm["position"],
                    })
                  }
                >
                  <option value="">Pilih jabatan...</option>
                  <option value="Penanggung Jawab">Penanggung Jawab</option>
                  <option value="General Manager">General Manager</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-gray-600">Alamat</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 mt-1 h-24"
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                />
              </div>

              <div className="col-span-2">
                <label className="text-gray-600">Status</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.is_active ? "Aktif" : "Nonaktif"}
                  onChange={(event) =>
                    setForm({ ...form, is_active: event.target.value === "Aktif" })
                  }
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Tidak Aktif</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border rounded-lg text-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2 bg-[#1E3A8A] text-white rounded-lg disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
