"use client";

import { useEffect, useState } from "react";
import PJLayout from "@/components/PJLayout";
import API from "@/services/api";
import { MapPin, Plus, Image, Camera, FileText, X } from "lucide-react";

type ResponsiblePerson = {
  id: number;
  name: string;
};

export default function PJLapangan() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());


  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);

  setPhotos(files);

  // preview
  const previews = files.map((file) => URL.createObjectURL(file));
  setPreviewPhotos(previews);
};

  const handleImageError = (imagePath: string) => {
    setFailedImages(prev => new Set(prev).add(imagePath));
  };

  const openImagePreview = (image: any) => {
    setSelectedImage(image);
    setShowImagePreview(true);
  };

  // ✅ PROJECT STATE (BIAR BISA TAMBAH DATA)
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [responsiblePeople, setResponsiblePeople] = useState<ResponsiblePerson[]>([]);

  useEffect(() => {
    loadProjects();
    loadResponsiblePeople();
  }, []);

  const loadProjects = async () => {
    setLoadingProjects(true);
    setProjectError("");

    try {
      const response = await API.get("/pj/projects");
      const backendProjects = response.data.data.map((project: any) => ({
        id: project.id,
        name: project.name,
        location: project.location || "-",
        progress: project.progress ?? 0,
        status:
          project.progress === 100 || project.status === "completed"
            ? "completed"
            : project.status || "running",
        responsiblePerson: project.client_name || "-",
        started: project.start_date ? new Date(project.start_date).toLocaleDateString("id-ID") : "-",
        reports: project.daily_reports_count ?? 0,
      }));
      setProjects(backendProjects);
    } catch (error) {
      console.error("Gagal memuat proyek:", error);
      setProjectError("Tidak dapat memuat proyek. Pastikan Anda sudah login dan backend berjalan.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadResponsiblePeople = async () => {
    try {
      const response = await API.get("/pj/responsible-people");
      setResponsiblePeople(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat data penanggung jawab:", error);
      setResponsiblePeople([]);
    }
  };

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

const loadDailyReports = async (project: any) => {
  try {
    const response = await API.get(`/pj/projects/${project.id}/daily-reports`);
    const normalized = response.data.data.map((report: any) => ({
      id: report.id,
      date: report.report_date ? String(report.report_date).split("T")[0] : "-",
      activity: report.work_description,
      weather: report.weather,
      progress: report.progress_percent,
      notes: report.notes,
      photos: report.photos?.map((photo: any) => {
        // Construct full image URL
        let imageUrl = "";
        if (photo.url) {
          // If url is relative path (starts with /), prepend API base URL
          if (photo.url.startsWith("/")) {
            imageUrl = `http://127.0.0.1:8000${photo.url}`;
          } else if (photo.url.startsWith("http")) {
            imageUrl = photo.url;
          } else {
            imageUrl = `http://127.0.0.1:8000/storage/${photo.url}`;
          }
        } else if (photo.file_path) {
          imageUrl = `http://127.0.0.1:8000/storage/${photo.file_path}`;
        }

        return {
          file_path: imageUrl,
          file_name:
            photo.file_name ||
            (photo.file_path ? photo.file_path.split("/").pop() : "Unknown") ||
            (photo.url ? photo.url.split("/").pop() : "Unknown"),
          uploaded_at: photo.created_at,
          caption: photo.caption,
        };
      }) || [],
    }));
    setDailyReports(normalized);
  } catch (error) {
    console.error("Gagal memuat riwayat laporan:", error);
    setDailyReports([]);
  }
};

const handleSaveReport = async () => {
  if (!reportForm.activity) {
    alert("Aktivitas wajib diisi!");
    return;
  }

  if (!selectedProject?.id) {
    alert("Proyek belum dipilih.");
    return;
  }

  try {
    // send as FormData so photos can be uploaded
    const formData = new FormData();
    formData.append('report_date', reportForm.date);
    formData.append('work_description', reportForm.activity);
    formData.append('jenis', reportForm.jenis);
    formData.append('weather', reportForm.weather || '');
    formData.append('progress_percent', reportForm.progress ? String(reportForm.progress) : '0');
    formData.append('notes', reportForm.notes || '');

    reportPhotos.forEach((file) => {
      formData.append('photos[]', file);
    });

    // Ensure user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('simpro_token');
      if (!token) {
        alert('Anda belum login. Silakan login untuk membuat laporan.');
        window.location.href = '/login';
        return;
      }
    }

    // Let axios/browser set the Content-Type with proper boundary
    await API.post(`/pj/projects/${selectedProject.id}/daily-reports`, formData);

    // ✅ Selalu reload proyek dan laporan harian setelah menyimpan
    await loadProjects();
    await loadDailyReports(selectedProject);

    setShowReportModal(false);
    setReportForm({
      date: new Date().toISOString().split("T")[0],
      activity: "",
      weather: "",
      progress: "",
      notes: "",
      jenis: "Harian",
    });
    setReportPhotos([]);
    setReportPreview([]);
    
    // Tampilkan riwayat modal agar user bisa melihat laporan yang baru dibuat
    setShowHistoryModal(true);
  } catch (error: any) {
    console.error("Gagal menyimpan laporan:", error);
    if (error?.response?.status === 401) {
      alert('Sesi tidak valid. Silakan login ulang.');
      if (typeof window !== 'undefined') window.location.href = '/login';
      return;
    }

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Gagal menyimpan laporan. Pastikan data benar dan server berjalan.";
    alert(message);
  }
};

const [reportForm, setReportForm] = useState({
  date: new Date().toISOString().split("T")[0],
  activity: "",
  weather: "",
  progress: "",
  notes: "",
  jenis: "Harian",
});

const [reportPhotos, setReportPhotos] = useState<File[]>([]);
const [reportPreview, setReportPreview] = useState<string[]>([]);

  // ================= FORM STATE =================
  const [formProject, setFormProject] = useState({
    name: "",
    location: "",
    responsiblePerson: "",
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

  const handleSaveProject = async () => {
    if (!formProject.name || !formProject.location) {
      alert("Nama dan lokasi wajib diisi!");
      return;
    }

    const code = `${formProject.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;

    try {
      await API.post("/pj/projects", {
        code,
        name: formProject.name,
        client_name: formProject.responsiblePerson,
        location: formProject.location,
        start_date: formProject.startDate || null,
        end_date: formProject.endDate || null,
        budget: formProject.budget ? Number(formProject.budget) : 0,
      });

      await loadProjects();
      setShowProjectModal(false);

      setFormProject({
        name: "",
        location: "",
        responsiblePerson: "",
        startDate: "",
        endDate: "",
        budget: "",
        description: "",
      });
    } catch (error) {
      console.error("Gagal menyimpan proyek:", error);
      alert("Gagal menyimpan proyek. Pastikan Anda sudah login dan data sudah benar.");
    }
  };

  // ================= HANDLE =================
  const handleDailyReport = (project: any) => {
    setSelectedProject(project);
    setShowReportModal(true);
  };

  const handleHistory = async (project: any) => {
    setSelectedProject(project);
    await loadDailyReports(project);
    setShowHistoryModal(true);
  };

  return (
    <PJLayout>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold">Data Lapangan</h1>
          <p className="text-sm text-gray-500">
            Kelola proyek dan buat laporan harian
          </p>
        </div>

        <button
          onClick={() => setShowProjectModal(true)}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm whitespace-nowrap"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Proyek Baru</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-blue-100 p-4 relative">
              <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-green-500 text-white">
                {item.status === "completed" ? "Selesai" : "Aktif"}
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
                  <span>Penanggung Jawab:</span>
                  <span>{item.responsiblePerson}</span>
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
                  onClick={() => handleDailyReport(item)}
                  className="flex-1 bg-[#1E3A8A] text-white py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <Camera size={14} />
                  Laporan Harian
                </button>

                <button
                  onClick={() => handleHistory(item)}
                  className="flex-1 border py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
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
          <div className="flex items-start justify-center min-h-screen p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-xl w-full sm:w-[90%] md:w-[500px] flex flex-col max-h-[90vh]">
            <div className="px-6 py-2 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Tambah Proyek Baru</h3>
            </div>

            <div className="px-6 py-4 space-y-4 text-sm overflow-y-auto min-h-0 flex-1">
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

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penanggung Jawab
                  </label>
              <select
                name="responsiblePerson"
                value={formProject.responsiblePerson}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Pilih Penanggung Jawab</option>
                {responsiblePeople.map((person) => (
                  <option key={person.id} value={person.name}>
                    {person.name}
                  </option>
                ))}
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

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
    <div className="bg-white w-full sm:w-[90%] md:w-[500px] rounded-xl flex flex-col max-h-[85vh]">

      {/* HEADER */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Laporan Harian</h3>
        <p className="text-sm text-gray-500 mt-1">{selectedProject?.name || "Proyek"}</p>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-4 overflow-y-auto flex-1">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6">
    <div className="bg-white w-full sm:w-[90%] md:w-[700px] rounded-xl max-h-[85vh] flex flex-col">
      <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Riwayat Laporan Harian</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedProject?.name || "Proyek"}</p>
            </div>

      <div className="p-5 space-y-4 overflow-y-auto">

        {dailyReports.map((r: any, i: number) => (
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

          {r.photos.slice(0, 4).map((img: any, idx: number) => (
            <div key={idx} className="relative group">
              {failedImages.has(img.file_path) ? (
                <div className="w-full h-32 rounded-xl border bg-gray-100 flex items-center justify-center text-gray-400">
                  <span className="text-xs text-center">Gambar tidak dapat dimuat</span>
                </div>
              ) : (
                <img
                  src={img.file_path}
                  alt={img.file_name || `Foto dokumentasi ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-xl border cursor-pointer hover:opacity-90 transition-opacity"
                  onError={() => handleImageError(img.file_path)}
                  onClick={() => openImagePreview(img)}
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl transition-all flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100">
                <div className="bg-black/70 text-white text-xs p-2 rounded">
                  <p className="truncate font-semibold">{img.file_name}</p>
                  <p className="text-gray-300">{new Date(img.uploaded_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
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

        {dailyReports.length === 0 && (
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

{/* IMAGE PREVIEW MODAL */}
{showImagePreview && selectedImage && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{selectedImage.file_name}</h3>
          <p className="text-xs text-gray-500">
            {new Date(selectedImage.uploaded_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={() => setShowImagePreview(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-4 min-h-[400px]">
        <img
          src={selectedImage.file_path}
          alt={selectedImage.file_name}
          className="max-w-full max-h-full object-contain"
          onError={() => {
            alert('Gambar tidak dapat dimuat');
            setShowImagePreview(false);
          }}
        />
      </div>

      <div className="p-4 border-t flex gap-2 justify-end">
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = selectedImage.file_path;
            link.download = selectedImage.file_name || 'photo.jpg';
            link.click();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download
        </button>
        <button
          onClick={() => setShowImagePreview(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
