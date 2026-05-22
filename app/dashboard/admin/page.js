"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import API from "@/services/api";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get("/admin/employees");
        setEmployees(response.data.data ?? []);
      } catch {
        setError("Gagal memuat data dashboard. Pastikan sudah login sebagai Admin.");
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const stats = useMemo(() => {
    const activeEmployees = employees.filter((employee) => employee.is_active);
    const pjEmployees = employees.filter((employee) => employee.position === "Penanggung Jawab");
    const gmEmployees = employees.filter((employee) => employee.position === "General Manager");

    return [
      { label: "Total Karyawan", value: employees.length },
      { label: "Karyawan Aktif", value: activeEmployees.length },
      { label: "Penanggung Jawab", value: pjEmployees.length },
      { label: "General Manager", value: gmEmployees.length },
    ];
  }, [employees]);

  const latestEmployees = useMemo(() => employees.slice(0, 5), [employees]);

  return (
    <AdminLayout>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {stats.map((item) => (
          <div key={item.label} className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-gray-500 text-xs">{item.label}</p>
            <h2 className="text-2xl font-semibold mt-1">
              {loading ? "..." : item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border">

        <h2 className="text-base font-semibold mb-3">
          Karyawan Terbaru
        </h2>

        <div className="space-y-2">
          {loading && (
            <div className="bg-gray-50 px-4 py-3 rounded-lg text-sm text-gray-500">
              Memuat data karyawan...
            </div>
          )}

          {!loading && latestEmployees.length === 0 && (
            <div className="bg-gray-50 px-4 py-3 rounded-lg text-sm text-gray-500">
              Belum ada data karyawan.
            </div>
          )}

          {!loading && latestEmployees.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1E3A8A] text-white flex items-center justify-center rounded-full text-sm">
                  {item.name?.charAt(0) ?? "-"}
                </div>

                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.position}</p>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                {item.joined_at || "-"}
              </p>

            </div>
          ))}

        </div>

      </div>

    </AdminLayout>
  );
}
