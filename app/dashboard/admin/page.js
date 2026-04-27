import AdminLayout from "@/components/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-xs">Total Karyawan</p>
          <h2 className="text-2xl font-semibold mt-1">48</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-xs">Karyawan Aktif</p>
          <h2 className="text-2xl font-semibold mt-1">42</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-gray-500 text-xs">Penanggung Jawab</p>
          <h2 className="text-2xl font-semibold mt-1">12</h2>
        </div>

      </div>

      {/* Karyawan Terbaru */}
      <div className="bg-white p-5 rounded-xl shadow-sm border">

        <h2 className="text-base font-semibold mb-3">
          Karyawan Terbaru
        </h2>

        <div className="space-y-2">

          {[
            { nama: "Ahmad Fauzi", role: "Penanggung Jawab", tanggal: "12 Mar 2026", avatar: "A" },
            { nama: "Siti Nurhaliza", role: "General Manager", tanggal: "10 Mar 2026", avatar: "S" },
            { nama: "Budi Santoso", role: "Penanggung Jawab", tanggal: "08 Mar 2026", avatar: "B" },
            { nama: "Dewi Lestari", role: "Penanggung Jawab", tanggal: "05 Mar 2026", avatar: "D" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1E3A8A] text-white flex items-center justify-center rounded-full text-sm">
                  {item.avatar}
                </div>

                <div>
                  <p className="text-sm font-medium">{item.nama}</p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                {item.tanggal}
              </p>

            </div>
          ))}

        </div>

      </div>

    </AdminLayout>
  );
}