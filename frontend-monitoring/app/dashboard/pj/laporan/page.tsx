"use client";

import { ChangeEvent, useEffect, useState } from "react";
import PJLayout from "@/components/PJLayout";
import { Search, Edit2, Trash2, Eye, Download } from "lucide-react";
import axios from "axios";
import API from "@/services/api";

type ReportItem = {
  id: number;
  project_id: number;
  project_name: string;
  judul: string;
  jenis: string;
  tanggal: string;
  report_date: string;
  weather: string;
  progress_percent: number;
  notes: string;
  photoCount: number;
  photos?: any[];
};

type ProjectItem = {
  id: number;
  name: string;
};

export default function LaporanPJ() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [editReport, setEditReport] = useState<ReportItem | null>(null);
  const [editForm, setEditForm] = useState({
    judul: "",
    jenis: "",
    tanggal: "",
    weather: "",
    progress: "",
    notes: "",
  });

  const [form, setForm] = useState({
    judul: "",
    proyek: "",
    jenis: "",
    deskripsi: "",
    progress: "",
    fotos: [] as File[],
    fotoPreviews: [] as string[],
    dokumen: null as File | null,
  });

  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterProyek, setFilterProyek] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [summary, setSummary] = useState({ today: 0, month: 0, total: 0 });

  async function loadProjects() {
    try {
      const res = await API.get('/pj/projects');
      const backend = (res.data?.data as Array<{ id: number; name: string }>) || [];
      const loaded = backend.map((project) => ({ id: project.id, name: project.name }));
      setProjects(loaded);
      return loaded;
    } catch (err) {
      console.error('Gagal memuat daftar proyek:', err);
      setProjects([]);
      return [] as ProjectItem[];
    }
  }

  async function loadReports(projectsToLoad: ProjectItem[]) {
    if (!projectsToLoad.length) {
      setReports([]);
      return;
    }

    try {
      const responses = await Promise.all(
        projectsToLoad.map((project) =>
          API.get(`/pj/projects/${project.id}/daily-reports`).then((res) => ({ project, data: res.data?.data || [] }))
        )
      );

      const loadedReports: ReportItem[] = responses.flatMap(({ project, data }) =>
        (data as Array<any>).map((report) => ({
          id: report.id,
          project_id: project.id,
          project_name: project.name,
          judul: report.work_description || "",
          jenis: report.jenis || "Harian",
          tanggal: new Date(report.report_date).toLocaleDateString('id-ID'),
          report_date: report.report_date || new Date().toISOString().split('T')[0],
          weather: report.weather || "",
          progress_percent: report.progress_percent ?? 0,
          notes: report.notes || "",
          photoCount: report.photos?.length ?? 0,
        }))
      );

      setReports(
        loadedReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())
      );
    } catch (err) {
      console.error('Gagal memuat laporan harian:', err);
      setReports([]);
    }
  }

  async function loadSummary() {
    try {
      const res = await API.get('/pj/projects/summary');
      setSummary(res.data?.data || { today: 0, month: 0, total: 0 });
    } catch (err) {
      console.error('Gagal memuat ringkasan laporan:', err);
      setSummary({ today: 0, month: 0, total: 0 });
    }
  }

  useEffect(() => {
    const loadInitial = async () => {
      const loadedProjects = await loadProjects();
      await Promise.all([loadSummary(), loadReports(loadedProjects)]);
    };

    void loadInitial();
  }, []);

  async function handleSubmit() {
    if (!form.judul || !form.proyek || !form.jenis) {
      alert("Harap isi semua field!");
      return;
    }

    const formData = new FormData();
    formData.append('report_date', new Date().toISOString().split('T')[0]);
    formData.append('work_description', form.judul);
    formData.append('jenis', form.jenis);
    formData.append('weather', '');
    formData.append('progress_percent', form.progress ? String(form.progress) : '0');
    formData.append('notes', form.deskripsi || '');

    // Add all photos
    form.fotos.forEach((file) => {
      formData.append('photos[]', file);
    });

    try {
      await API.post(`/pj/projects/${form.proyek}/daily-reports`, formData);
      const loadedProjects = await loadProjects();
      await Promise.all([loadSummary(), loadReports(loadedProjects)]);

      setForm({
        judul: "",
        proyek: "",
        jenis: "",
        deskripsi: "",
        progress: "",
        fotos: [],
        fotoPreviews: [],
        dokumen: null,
      });
      setShowModal(false);
      alert('Laporan berhasil dikirim.');
    } catch (err) {
      console.error('Gagal mengirim laporan:', err);
      let message = 'Gagal mengirim laporan.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      alert(message);
    }
  }

  const handleOpenEdit = (report: ReportItem) => {
    setEditReport(report);
    setEditForm({
      judul: report.judul,
      jenis: report.jenis,
      tanggal: report.report_date,
      weather: report.weather,
      progress: String(report.progress_percent),
      notes: report.notes,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleUpdateReport = async () => {
    if (!editReport) return;

    try {
      await API.put(`/pj/projects/${editReport.project_id}/daily-reports/${editReport.id}`, {
        report_date: editForm.tanggal,
        work_description: editForm.judul,
        jenis: editForm.jenis,
        weather: editForm.weather,
        progress_percent: Number(editForm.progress) || 0,
        notes: editForm.notes,
      });

      const loadedProjects = await loadProjects();
      await Promise.all([loadSummary(), loadReports(loadedProjects)]);
      setShowEditModal(false);
      setEditReport(null);
      alert('Laporan berhasil diperbarui.');
    } catch (err) {
      console.error('Gagal memperbarui laporan:', err);
      let message = 'Gagal memperbarui laporan.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      alert(message);
    }
  };

  const handleDeleteReport = async (report: ReportItem) => {
    if (!window.confirm('Hapus laporan ini?')) return;

    try {
      await API.delete(`/pj/projects/${report.project_id}/daily-reports/${report.id}`);
      const loadedProjects = await loadProjects();
      await Promise.all([loadSummary(), loadReports(loadedProjects)]);
      alert('Laporan berhasil dihapus.');
    } catch (err) {
      console.error('Gagal menghapus laporan:', err);
      let message = 'Gagal menghapus laporan.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      alert(message);
    }
  };

  const handleViewReport = (report: ReportItem) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleDownloadReport = (report: ReportItem) => {
    // Create PDF or document content
    const content = `
LAPORAN ${report.jenis.toUpperCase()}
Tanggal: ${report.tanggal}
Proyek: ${report.project_name}
Progres: ${report.progress_percent}%

Deskripsi:
${report.judul}

Catatan:
${report.notes}

Cuaca: ${report.weather}
`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `Laporan-${report.project_name}-${report.tanggal}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredReports = reports.filter((item) => {
    const query = search.toLowerCase();
    const matchSearch =
      item.judul.toLowerCase().includes(query) ||
      item.project_name.toLowerCase().includes(query);

    const matchJenis = filterJenis ? item.jenis === filterJenis : true;
    const matchProyek = filterProyek ? item.project_name === filterProyek : true;

    return matchSearch && matchJenis && matchProyek;
  });

  return (
    <PJLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-semibold">Laporan Proyek</h1>
          <p className="text-sm text-gray-500">Kelola dan upload laporan proyek Anda</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1E3A8A] text-white px-5 py-2 rounded-lg text-sm"
        >
          + Buat Laporan Baru
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[760px] rounded-xl shadow-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Buat Laporan Baru</h2>
            </div>

            <div className="p-6 space-y-4 text-sm max-h-[calc(90vh-160px)] overflow-y-auto">
              <div>
                <label className="text-gray-600">Judul Laporan</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Masukkan judul laporan"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600">Pilih Proyek</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.proyek}
                    onChange={(e) => setForm({ ...form, proyek: e.target.value })}
                  >
                    <option value="">Pilih proyek...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-600">Jenis Laporan</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.jenis}
                    onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                  >
                    <option value="">Pilih jenis...</option>
                    <option value="Harian">Laporan Harian</option>
                    <option value="Mingguan">Laporan Mingguan</option>
                    <option value="Bulanan">Laporan Bulanan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-600">Deskripsi / Catatan</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 mt-1 h-24"
                  placeholder="Tuliskan deskripsi laporan..."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                />
              </div>

              <div>
                <label className="text-gray-600">Upload Foto Dokumentasi</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setForm({ 
                      ...form, 
                      fotos: files,
                      fotoPreviews: files.map(f => URL.createObjectURL(f))
                    });
                  }}
                />
                {form.fotoPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {form.fotoPreviews.map((preview, idx) => (
                      <div key={idx} className="relative">
                        <img src={preview} alt={`preview-${idx}`} className="w-full h-20 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => {
                            const newFotos = form.fotos.filter((_, i) => i !== idx);
                            const newPreviews = form.fotoPreviews.filter((_, i) => i !== idx);
                            setForm({ ...form, fotos: newFotos, fotoPreviews: newPreviews });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-gray-600">Upload Dokumen Pendukung</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  onChange={(e) => setForm({ ...form, dokumen: e.target.files?.[0] || null })}
                />
              </div>

              <div>
                <label className="text-gray-600">Progres Pekerjaan (%)</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Masukkan persentase"
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg"
              >
                Simpan Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-175 rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Edit Laporan</h2>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <label className="text-gray-600">Judul Laporan</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={editForm.judul}
                  name="judul"
                  onChange={handleEditChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600">Jenis Laporan</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={editForm.jenis}
                    name="jenis"
                    onChange={handleEditChange}
                  >
                    <option value="">Pilih jenis...</option>
                    <option value="Harian">Laporan Harian</option>
                    <option value="Mingguan">Laporan Mingguan</option>
                    <option value="Bulanan">Laporan Bulanan</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600">Cuaca</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={editForm.weather}
                    name="weather"
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600">Tanggal Laporan</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={editForm.tanggal}
                  name="tanggal"
                  onChange={handleEditChange}
                />
              </div>

              <div>
                <label className="text-gray-600">Progres Pekerjaan (%)</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={editForm.progress}
                  name="progress"
                  onChange={handleEditChange}
                />
              </div>

              <div>
                <label className="text-gray-600">Catatan</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 mt-1 h-24"
                  value={editForm.notes}
                  name="notes"
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateReport}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border">
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Laporan Hari Ini</p>
            <h2 className="font-bold">{summary.today}</h2>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Laporan Bulan Ini</p>
            <h2 className="font-bold">{summary.month}</h2>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Total Laporan</p>
            <h2 className="font-bold">{summary.total}</h2>
          </div>
        </div>

        <div className="p-4 border-t flex gap-3 flex-wrap">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full md:w-2/4">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari laporan..."
              className="bg-transparent outline-none ml-2 w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="border rounded-lg px-3 text-sm"
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            <option value="Harian">Harian</option>
            <option value="Mingguan">Mingguan</option>
            <option value="Bulanan">Bulanan</option>
          </select>

          <select
            className="border rounded-lg px-3 text-sm"
            value={filterProyek}
            onChange={(e) => setFilterProyek(e.target.value)}
          >
            <option value="">Semua Proyek</option>
            {projects.map((project) => (
              <option key={project.id} value={project.name}>{project.name}</option>
            ))}
          </select>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-y text-gray-500">
            <tr>
              <th className="p-4 text-left">Judul</th>
              <th className="p-4 text-left">Proyek</th>
              <th className="p-4 text-left">Jenis</th>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{item.judul}</td>
                <td className="p-4">{item.project_name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.jenis === 'Harian' ? 'bg-blue-100 text-blue-600' :
                    item.jenis === 'Mingguan' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {item.jenis}
                  </span>
                </td>
                <td className="p-4">{item.tanggal}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleViewReport(item)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                      title="Lihat Laporan"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownloadReport(item)}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                      title="Download Laporan"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                      title="Edit Laporan"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(item)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Hapus Laporan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>
                  Tidak ada laporan untuk ditampilkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Detail Laporan</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Proyek</p>
                  <p className="font-semibold text-gray-800">{selectedReport.project_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jenis Laporan</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedReport.jenis === 'Harian' ? 'bg-blue-100 text-blue-600' :
                    selectedReport.jenis === 'Mingguan' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {selectedReport.jenis}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tanggal Laporan</p>
                  <p className="font-semibold text-gray-800">{selectedReport.tanggal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Progres (%)</p>
                  <p className="font-semibold text-gray-800">{selectedReport.progress_percent}%</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Cuaca</p>
                <p className="font-semibold text-gray-800">{selectedReport.weather || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Deskripsi / Aktivitas</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.judul}</p>
              </div>

              {selectedReport.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Catatan</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.notes}</p>
                </div>
              )}

              {selectedReport.photoCount > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Foto Dokumentasi</p>
                  <p className="text-sm text-gray-600">{selectedReport.photoCount} foto tersimpan</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => handleDownloadReport(selectedReport)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border rounded-lg"
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
