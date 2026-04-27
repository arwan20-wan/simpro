"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getRiwayat } from "@/app/store/riwayatStore";
import { UserPlus, Pencil, Trash2 } from "lucide-react";

export default function RiwayatPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(getRiwayat());
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
          Semua aktivitas sistem akan tercatat di sini
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 min-h-[300px]">

        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-gray-500">
            Belum ada aktivitas
          </div>
        ) : (
          <div className="space-y-4">

            {data.map((item, index) => (
              <div
                key={index}
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
                  </div>

                </div>

                <p className="text-xs text-gray-500">
                  {item.time}
                </p>

              </div>
            ))}

          </div>
        )}

      </div>

    </AdminLayout>
  );
}