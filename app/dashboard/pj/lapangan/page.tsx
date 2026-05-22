"use client";

import { useState } from "react";
import PJLayout from "@/components/PJLayout";
import { MapPin, Plus, Image, Camera, FileText } from "lucide-react";

export default function PJLapangan() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);


  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);

  setPhotos(files);

  // preview
  const previews = files.map((file) => URL.createObjectURL(file));
  setPreviewPhotos(previews);
};

  // ✅ PROJECT STATE (BIAR BISA TAMBAH DATA)
  const [projects, setProjects] = useState([
    {
      name: "Gedung Perkantoran",
      location: "Jl. Sudirman No. 123, Jakarta Selatan",
      progress: 85,
      supervisor: "Ahmad Fauzi",
      started: "15 Jan 2026",
      reports: 45,
    },
    {
      name: "Renovasi Kompleks Perumahan",
      location: "Jl. Pahlawan No. 45, Tangerang",
      progress: 100,
      supervisor: "Budi Santoso",
      started: "20 Jan 2026",
      reports: 38,
    },
  ]);

  const handleReportChange = (e: any) => {
  setReportForm({
    ...reportForm,
    [e.target.name]: e.target.value,
  });
};

const handleReportPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  setReportPhotos(files);

  const previews = files.map((file) => URL.createObjectURL(file));
  setReportPreview(previews);
};

const handleSaveReport = () => {
  if (!reportForm.activity) {
    alert("Aktivitas wajib diisi!");
    return;
  }

  const newReport = {
    ...reportForm,
    photos: reportPreview,
  };

  setReportHistory((prev: any) => ({
    ...prev,
    [selectedProject]: [
      ...(prev[selectedProject] || []),
      newReport,
    ],
  }));

  // update jumlah laporan di card
  setProjects((prev) =>
    prev.map((p) =>
      p.name === selectedProject
        ? { ...p, reports: p.reports + 1 }
        : p
    )
  );

  setShowReportModal(false);

  // reset
  setReportForm({
    date: "",
    activity: "",
    weather: "",
    progress: "",
    notes: "",
  });

  setReportPreview([]);
};

const [reportForm, setReportForm] = useState({
  date: "",
  activity: "",
  weather: "",
  progress: "",
  notes: "",
});

const [reportPhotos, setReportPhotos] = useState<File[]>([]);
const [reportPreview, setReportPreview] = useState<string[]>([]);

const [reportHistory, setReportHistory] = useState<any>({});

  // ================= FORM STATE =================
  const [formProject, setFormProject] = useState({
    name: "",
    location: "",
    supervisor: "",
    startDate: "",
    endDate: "",
    budget: "",
    description: "",
  });

  const handleChange = (e: any) => {
    setFormProject({
      ...formProject,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProject = () => {
    if (!formProject.name || !formProject.location) {
      alert("Nama dan lokasi wajib diisi!");
      return;
    }

    setProjects([
      ...projects,
      {
        name: formProject.name,
        location: formProject.location,
        progress: 0,
        supervisor: formProject.supervisor,
        started: formProject.startDate,
        reports: 0,
      },
    ]);

    setShowProjectModal(false);

    // reset form
    setFormProject({
      name: "",
      location: "",
      supervisor: "",
      startDate: "",
      endDate: "",
      budget: "",
      description: "",
    });
  };

  // ================= HANDLE =================
  const handleDailyReport = (name: string) => {
    setSelectedProject(name);
    setShowReportModal(true);
  };

  const handleHistory = (name: string) => {
    setSelectedProject(name);
    setShowHistoryModal(true);
  };

  return (
    <PJLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-semibold">Data Lapangan</h1>
          <p className="text-sm text-gray-500">
            Kelola proyek dan buat laporan harian
          </p>
        </div>

        <button
          onClick={() => setShowProjectModal(true)}
          className="flex items-center gap-2 px-5 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm"
        >
          <Plus size={16} />
          Tambah Proyek Baru
        </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-2 gap-6">
        {projects.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-blue-100 p-4 relative">
              <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-green-500 text-white">
                {item.progress === 100 ? "Selesai" : "Aktif"}
              </span>

              <p className="text-sm text-gray-600">Progress</p>

              <div className="flex justify-between text-sm mt-1">
                <span></span>
                <span className="font-semibold text-[#1E3A8A]">
                  {item.progress}%
                </span>
              </div>

              <div className="w-full bg-white/60 h-2 rounded mt-2">
                <div
                  className="bg-[#1E3A8A] h-2 rounded"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>

            <div className="p-5">
              <h2 className="font-semibold">{item.name}</h2>

              <div className="flex gap-2 text-sm text-gray-600 mb-4">
                <MapPin size={14} />
                {item.location}
              </div>

              <div className="text-sm space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Supervisor:</span>
                  <span>{item.supervisor}</span>
                </div>

                <div className="flex justify-between">
                  <span>Mulai:</span>
                  <span>{item.started}</span>
                </div>

                <div className="flex justify-between">
                  <span>Laporan:</span>
                  <span>{item.reports}</span>
                </div>
              </div>

              <div className="flex gap-2 border-t pt-4">
                <button
                  onClick={() => handleDailyReport(item.name)}
                  className="flex-1 bg-[#1E3A8A] text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Camera size={14} />
                  Laporan Harian
                </button>

                <button
                  onClick={() => handleHistory(item.name)}
                  className="flex-1 border py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  Riwayat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL TAMBAH PROYEK ================= */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen p-6">
          <div className="bg-white rounded-xl shadow-xl w-[500px] flex flex-col">
            <div className="px-6 py-2 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Tambah Proyek Baru</h3>
            </div>

            <div className="px-6 py-4 space-y-4 text-sm overflow-y-auto min-h-0">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Proyek
                </label>
              <input
                name="name"
                value={formProject.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Masukkan Nama proyek"
              />
               </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi Proyek
                </label>
              <textarea
                name="location"
                value={formProject.location}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Masukkan alamat lengkap lokasi proyek"
              />
              </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervisor
                  </label>
              <select
                name="supervisor"
                value={formProject.supervisor}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Pilih Supervisor</option>
                <option>Ahmad Fauzi</option>
                <option>Budi Santoso</option>
              </select>
              </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai
                  </label>
                <input
                  type="date"
                  name="startDate"
                  value={formProject.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
                </div>
                </div>

               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anggaran (Rp)
                  </label>
                <input
                type="number"
                name="budget"
                value={formProject.budget}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                placeholder="0"
              />
              </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Selesai
                  </label>
                <input
                  type="date"
                  name="endDate"
                  value={formProject.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
                </div>
                </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Proyek
                </label>
              <textarea
                name="description"
                value={formProject.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Tuliskan Deskripsi proyek"
              />
              </div>

              <div>
                <label className="w-full border rounded-lg px-3 py-3 mt-1 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50">
  <Image size={16} />
  <span className="text-sm text-gray-600">
    Klik untuk upload foto
  </span>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handlePhotoUpload}
    className="hidden"
  />
</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-3 border-t">
              <button onClick={() => setShowProjectModal(false)}>
                Batal
              </button>

              <button
                onClick={handleSaveProject}
                className="bg-[#1E3A8A] text-white px-4 py-2 rounded"
              >
                Simpan Proyek
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {showReportModal && (
  <div className="fixed inset-0 z-50  bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white w-[500px] rounded-xl flex flex-col max-h-[85vh]">

      {/* HEADER */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Laporan Harian</h3>
        <p className="text-sm text-gray-500 mt-1">{selectedProject}</p>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-4">
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Laporan
          </label>
        <input
          type="date"
          name="date"
          value={reportForm.date}
          onChange={handleReportChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
        />
        </div>

         <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aktivitas Hari Ini
          </label>
        <textarea
          name="activity"
          rows={4}
          value={reportForm.activity}
          onChange={handleReportChange}
          placeholder="Jelaskan aktivitas pekerjaan yang dilakukan hari ini"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
        />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuaca
            </label>
          <select
            name="weather"
            value={reportForm.weather}
            onChange={handleReportChange}
            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          >
            <option value="">Pilih kondisi cuaca</option>
            <option>Cerah</option>
            <option>Berawan</option>
            <option>Hujan</option>
          </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progres (%)
            </label>
          <input
            type="number"
            name="progress"
            value={reportForm.progress}
            onChange={handleReportChange}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
        </div>

        {/* UPLOAD FOTO */}
        <div>
                <label className="w-full border rounded-lg px-3 py-3 mt-1 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50">
  <Camera size={16} />
  <span className="text-sm text-gray-600">
    Upload Foto Dokumentasi
  </span>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleReportPhoto}
    className="hidden"
  />
</label>
              </div>

        {/* PREVIEW */}
        {reportPreview.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {reportPreview.map((img, i) => (
              <img key={i} src={img} className="h-20 w-full object-cover rounded" />
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kendala / Catatan
          </label>
        <textarea
          name="notes"
          value={reportForm.notes}
          onChange={handleReportChange}
          placeholder="Kendala / catatan"
          className="w-full border p-2 rounded"
        />
      </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
        <button onClick={() => setShowReportModal(false)}>Batal</button>
        <button
          onClick={handleSaveReport}
          className="bg-[#1E3A8A] text-white px-4 py-2 rounded"
        >
          Simpan
        </button>
      </div>
    </div>
  </div>
)}

{showHistoryModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white w-[700px] rounded-xl max-h-[85vh] flex flex-col">
      <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Riwayat Laporan Harian</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedProject}</p>
            </div>

      <div className="p-5 space-y-4 overflow-y-auto">

        {(reportHistory[selectedProject] || []).map((r: any, i: number) => (
  <div
    key={i}
    className="border rounded-2xl p-4 bg-white"
  >
    {/* HEADER */}
    <div className="flex justify-between items-start mb-4">

      <div className="flex items-start gap-3">

        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <FileText size={18} className="text-[#1E3A8A]" />
        </div>

        <div>
          <h3 className="font-semibold text-gray-800">
            {r.date}
          </h3>

          <p className="text-sm text-gray-500">
            {r.photos?.length || 0} foto dokumentasi
          </p>
        </div>

      </div>

      <div className="bg-blue-100 text-[#1E3A8A] text-xs px-3 py-1 rounded-full font-medium">
        {r.progress}% Progress
      </div>
    </div>

    {/* DETAIL */}
    <div className="grid grid-cols-2 gap-4 text-sm mb-4">

      <div>
        <p className="text-gray-500 mb-1">Aktivitas</p>
        <p className="text-gray-800">{r.activity}</p>
      </div>

      <div>
        <p className="text-gray-500 mb-1">Cuaca</p>
        <p className="text-gray-800">{r.weather}</p>
      </div>

    </div>

    {/* CATATAN */}
    {r.notes && (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg mb-4">
        <p className="text-sm text-gray-700">
          {r.notes}
        </p>
      </div>
    )}

    {/* FOTO */}
    {r.photos?.length > 0 && (
      <div>
        <p className="text-sm text-gray-500 mb-3">
          Foto Dokumentasi ({r.photos.length})
        </p>

        <div className="grid grid-cols-4 gap-3">

          {r.photos.slice(0, 4).map((img: string, idx: number) => (
            <img
              key={idx}
              src={img}
              className="w-full h-32 object-cover rounded-xl border"
            />
          ))}

          {r.photos.length > 4 && (
            <div className="h-32 rounded-xl border border-dashed flex flex-col items-center justify-center text-gray-500 text-sm">
              <p className="font-semibold">
                +{r.photos.length - 4}
              </p>
              <p>Foto</p>
            </div>
          )}

        </div>
      </div>
    )}
  </div>
))}

        {(!reportHistory[selectedProject] ||
          reportHistory[selectedProject].length === 0) && (
          <p className="text-center text-gray-500">
            Belum ada laporan
          </p>
        )}
      </div>

      <div className="p-4 border-t text-right">
        <button
          onClick={() => setShowHistoryModal(false)}
          className="bg-[#1E3A8A] text-white px-4 py-2 rounded"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}
    </PJLayout>
  );
}