"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import GMLayout from "@/components/GMLayout";
import { Download, Eye, FileText, Image as ImageIcon, Search } from "lucide-react";
import API from "@/services/api";

type ProjectOption = {
  id: number;
  name: string;
  location?: string | null;
  pj: string;
};

type FieldReport = {
  id: number;
  project_id: number;
  project_name: string;
  location?: string | null;
  pj: string;
  jenis: string;
  report_date: string;
  work_description: string;
  weather?: string | null;
  manpower?: number;
  progress_percent?: number;
  notes?: string | null;
  photo_count: number;
};

type FinanceReport = {
  id: number;
  project_id: number;
  project_name: string;
  location?: string | null;
  pj: string;
  transaction_date: string;
  category: string;
  has_receipt: boolean;
  download_url: string;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMonth = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<"harian" | "bulanan" | "keuangan">("harian");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [dailyReports, setDailyReports] = useState<FieldReport[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<FieldReport[]>([]);
  const [financeReports, setFinanceReports] = useState<FinanceReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null);
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const [projectRes, dailyRes, monthlyRes, financeRes] = await Promise.allSettled([
          API.get("/gm/reports/projects"),
          API.get("/gm/reports/daily", { params: { jenis: "Harian" } }),
          API.get("/gm/reports/daily", { params: { jenis: "Bulanan" } }),
          API.get("/gm/reports/finance"),
        ]);

        const loadedProjects = projectRes.status === "fulfilled" ? projectRes.value.data?.data || [] : [];
        const loadedDailyReports = dailyRes.status === "fulfilled" ? dailyRes.value.data?.data || [] : [];
        const loadedMonthlyReports = monthlyRes.status === "fulfilled" ? monthlyRes.value.data?.data || [] : [];
        const loadedFinanceReports = financeRes.status === "fulfilled" ? financeRes.value.data?.data || [] : [];

        setProjects(loadedProjects);
        setDailyReports(loadedDailyReports);
        setMonthlyReports(loadedMonthlyReports);
        setFinanceReports(loadedFinanceReports);

        if (loadedDailyReports.length === 0 && loadedMonthlyReports.length > 0) {
          setActiveTab("bulanan");
        }
      } catch (error) {
        console.error("Gagal memuat laporan GM:", error);
        setProjects([]);
        setDailyReports([]);
        setMonthlyReports([]);
        setFinanceReports([]);
      } finally {
        setLoading(false);
      }
    };

    void loadReports();
  }, []);

  const filteredDailyReports = useMemo(
    () => filterFieldReports(dailyReports, search, projectId),
    [dailyReports, search, projectId]
  );

  const filteredMonthlyReports = useMemo(
    () => filterFieldReports(monthlyReports, search, projectId),
    [monthlyReports, search, projectId]
  );

  const filteredFinanceReports = useMemo(() => {
    const query = search.toLowerCase();
    return financeReports.filter((item) => {
      const matchesSearch =
        item.project_name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.pj.toLowerCase().includes(query);
      const matchesProject = projectId ? String(item.project_id) === projectId : true;
      return matchesSearch && matchesProject;
    });
  }, [financeReports, projectId, search]);

  const handleDownloadFieldReport = (report: FieldReport) => {
    const content = `LAPORAN ${report.jenis.toUpperCase()}
Tanggal: ${formatDate(report.report_date)}
Proyek: ${report.project_name}
Penanggung Jawab: ${report.pj}
Lokasi: ${report.location || "-"}
Progres: ${report.progress_percent ?? 0}%
Cuaca: ${report.weather || "-"}
Jumlah Foto: ${report.photo_count}

Deskripsi:
${report.work_description}

Catatan:
${report.notes || "-"}
`;

    downloadTextFile(
      `Laporan-${report.jenis}-${report.project_name}-${report.report_date}.txt`,
      content
    );
  };

  const handleDownloadFinanceReport = async (report: FinanceReport) => {
    try {
      const response = await API.get(`/gm/reports/finance/${report.id}/download`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan-Keuangan-${report.project_name}-${report.transaction_date}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal mengunduh laporan keuangan:", error);
      alert("File laporan keuangan tidak tersedia.");
    }
  };

  return (
    <GMLayout>
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h1 className="text-xl font-semibold">Laporan Proyek</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau laporan harian, bulanan, dan unduh laporan keuangan sesuai penanggung jawab proyek.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1 border rounded-lg px-4 py-2 bg-white">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari laporan, proyek, atau PJ..."
              className="w-full text-sm outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="border rounded-lg px-4 py-2 text-sm bg-white"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            <option value="">Semua Proyek</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.pj}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
          <TabButton active={activeTab === "harian"} count={dailyReports.length} onClick={() => setActiveTab("harian")}>
            Harian
          </TabButton>
          <TabButton active={activeTab === "bulanan"} count={monthlyReports.length} onClick={() => setActiveTab("bulanan")}>
            Bulanan
          </TabButton>
          <TabButton active={activeTab === "keuangan"} count={financeReports.length} onClick={() => setActiveTab("keuangan")}>
            Keuangan
          </TabButton>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border p-6 text-sm text-gray-500">
            Memuat laporan...
          </div>
        )}

        {!loading && activeTab === "harian" && (
          <FieldReportTable
            reports={filteredDailyReports}
            emptyText="Belum ada laporan harian."
            dateLabel="Tanggal"
            formatDateValue={formatDate}
            onView={setSelectedReport}
            onDownload={handleDownloadFieldReport}
          />
        )}

        {!loading && activeTab === "bulanan" && (
          <FieldReportTable
            reports={filteredMonthlyReports}
            emptyText="Belum ada laporan bulanan."
            dateLabel="Bulan"
            formatDateValue={formatMonth}
            onView={setSelectedReport}
            onDownload={handleDownloadFieldReport}
          />
        )}

        {!loading && activeTab === "keuangan" && (
          <FinanceReportTable reports={filteredFinanceReports} onDownload={handleDownloadFinanceReport} />
        )}

        {selectedReport && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Detail Laporan</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  x
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Detail label="Proyek" value={selectedReport.project_name} />
                  <Detail label="PJ" value={selectedReport.pj} />
                  <Detail label="Tanggal" value={formatDate(selectedReport.report_date)} />
                  <Detail label="Progres" value={`${selectedReport.progress_percent ?? 0}%`} />
                  <Detail label="Cuaca" value={selectedReport.weather || "-"} />
                  <Detail label="Foto" value={`${selectedReport.photo_count} foto`} />
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Deskripsi</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedReport.work_description}</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Catatan</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedReport.notes || "-"}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={() => handleDownloadFieldReport(selectedReport)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  <Download size={16} />
                  Download
                </button>
                <button onClick={() => setSelectedReport(null)} className="px-4 py-2 border rounded-lg text-sm">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GMLayout>
  );
}

function filterFieldReports(reports: FieldReport[], search: string, projectId: string) {
  const query = search.toLowerCase();
  return reports.filter((item) => {
    const matchesSearch =
      item.work_description.toLowerCase().includes(query) ||
      item.project_name.toLowerCase().includes(query) ||
      item.pj.toLowerCase().includes(query);
    const matchesProject = projectId ? String(item.project_id) === projectId : true;
    return matchesSearch && matchesProject;
  });
}

function downloadTextFile(fileName: string, content: string) {
  const element = document.createElement("a");
  element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
  element.download = fileName;
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  element.remove();
}

function TabButton({
  active,
  children,
  count,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${
        active ? "bg-white shadow font-medium" : "text-gray-500"
      }`}
    >
      <span>{children}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-blue-100 text-blue-700" : "bg-white text-gray-500"}`}>
        {count}
      </span>
    </button>
  );
}

function FieldReportTable({
  reports,
  emptyText,
  dateLabel,
  formatDateValue,
  onView,
  onDownload,
}: {
  reports: FieldReport[];
  emptyText: string;
  dateLabel: string;
  formatDateValue: (value?: string) => string;
  onView: (report: FieldReport) => void;
  onDownload: (report: FieldReport) => void;
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3">{dateLabel}</th>
            <th className="text-left p-3">Proyek</th>
            <th className="text-left p-3">Laporan</th>
            <th className="text-left p-3">Foto</th>
            <th className="text-left p-3">PJ</th>
            <th className="text-left p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((item) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{formatDateValue(item.report_date)}</td>
              <td className="p-3">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                  {item.project_name}
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-blue-600" />
                  <span className="line-clamp-2">{item.work_description}</span>
                </div>
              </td>
              <td className="p-3">
                <span className="flex items-center gap-1">
                  <ImageIcon size={14} />
                  {item.photo_count} foto
                </span>
              </td>
              <td className="p-3">{item.pj}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(item)}
                    className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs hover:bg-gray-50"
                  >
                    <Eye size={14} />
                    Lihat
                  </button>
                  <button
                    onClick={() => onDownload(item)}
                    className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs hover:bg-gray-50"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={6}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function FinanceReportTable({
  reports,
  onDownload,
}: {
  reports: FinanceReport[];
  onDownload: (report: FinanceReport) => void;
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3">Tanggal</th>
            <th className="text-left p-3">Proyek</th>
            <th className="text-left p-3">Kategori</th>
            <th className="text-left p-3">PJ</th>
            <th className="text-left p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((item) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{formatDate(item.transaction_date)}</td>
              <td className="p-3">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                  {item.project_name}
                </span>
              </td>
              <td className="p-3">
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">
                  {item.category}
                </span>
              </td>
              <td className="p-3">{item.pj}</td>
              <td className="p-3">
                <button
                  disabled={!item.has_receipt}
                  onClick={() => onDownload(item)}
                  className="flex items-center gap-1 px-3 py-1 border rounded-lg text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download size={14} />
                  Download
                </button>
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={5}>
                Belum ada laporan keuangan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}
