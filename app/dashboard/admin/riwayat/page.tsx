"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import API from "@/services/api";
import { UserPlus, Pencil, Trash2 } from "lucide-react";

type RiwayatItem = {
  id: number;
  type: "tambah" | "edit" | "hapus";
  title: string;
  desc: string | null;
  admin_name: string;
  target_name: string;
  target_employee_id: string | null;
  time: string | null;
  tanggal: string | null;
};

export default function RiwayatPage() {
  const [data, setData] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRiwayat = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get("/admin/activity-logs");
        setData(response.data.data ?? []);
      } catch {
        setError("Gagal memuat riwayat aktivitas. Pastikan sudah login sebagai Admin.");
      } finally {
        setLoading(false);
      }
    };

    loadRiwayat();
  }, []);

  // ICON
  const getIcon = (type: string) => {
    switch (type) {
      case "tambah":
        return <UserPlus size={16} />;
      case "edit":
        return <Pencil size={16} />;
      case "hapus":
        return <Trash2 size={16} />;
      default:
        return null;
    }
  };

  // WARNA
  const getColor = (type: string) => {
    switch (type) {
      case "tambah":
        return "bg-green-100 text-green-600";
      case "edit":
        return "bg-blue-100 text-blue-600";
      case "hapus":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <AdminLayout>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-sm font-semibold text-gray-700">
          Riwayat Aktivitas
        </h1>
        <p className="text-sm text-gray-500">
          Semua aktivitas tambah, edit, dan hapus data karyawan tercatat di sini
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 min-h-[300px]">

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-gray-500">
            Memuat riwayat aktivitas...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-gray-500">
            Belum ada aktivitas
          </div>
        ) : (
          <div className="space-y-4">

            {data.map((item, index) => (
              <div
                key={item.id ?? index}
                className="flex items-start justify-between border-b pb-3 last:border-none"
              >

                <div className="flex gap-3">

                  <div className={`p-2 rounded-full ${getColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.desc}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Oleh {item.admin_name} {item.target_employee_id ? `- ID ${item.target_employee_id}` : ""}
                    </p>
                  </div>

                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">{item.time}</p>
                  <p className="text-xs text-gray-400">{item.tanggal}</p>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </AdminLayout>
  );
}
