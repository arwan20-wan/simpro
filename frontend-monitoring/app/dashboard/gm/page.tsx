"use client";

import { useEffect, useMemo, useState } from "react";
import GMLayout from "@/components/GMLayout";
import { Briefcase, ClipboardList, DollarSign, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import API from "@/services/api";

type ProjectItem = {
  id: number;
  name: string;
  location?: string | null;
  pj: string;
  budget: number;
  used: number;
  remaining: number;
  progress: number;
  status: "planned" | "running" | "delayed" | "completed";
};

type DashboardData = {
  summary: {
    total_projects: number;
    active_projects: number;
    average_progress: number;
    total_budget: number;
    total_used: number;
    total_reports: number;
    status_counts: {
      planned: number;
      running: number;
      delayed: number;
      completed: number;
    };
  };
  projects: ProjectItem[];
};

const emptyDashboard: DashboardData = {
  summary: {
    total_projects: 0,
    active_projects: 0,
    average_progress: 0,
    total_budget: 0,
    total_used: 0,
    total_reports: 0,
    status_counts: {
      planned: 0,
      running: 0,
      delayed: 0,
      completed: 0,
    },
  },
  projects: [],
};

const formatRupiah = (value: number) => {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
};

const formatCompactRupiah = (value: number) => {
  const amount = Number(value || 0);
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  return formatRupiah(amount);
};

const statusMeta = {
  planned: { label: "Direncanakan", className: "bg-gray-100 text-gray-600" },
  running: { label: "Berjalan", className: "bg-green-100 text-green-600" },
  delayed: { label: "Terlambat", className: "bg-red-100 text-red-600" },
  completed: { label: "Selesai", className: "bg-blue-100 text-blue-600" },
};

export default function GMPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await API.get("/gm/dashboard");
        setDashboard(response.data?.data || emptyDashboard);
      } catch (error) {
        console.error("Gagal memuat dashboard GM:", error);
        setDashboard(emptyDashboard);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const budgetChartData = useMemo(
    () =>
      [...dashboard.projects]
        .sort((a, b) => b.budget - a.budget)
        .map((project) => ({
          name: project.name,
          budget: project.budget,
          pj: project.pj,
        })),
    [dashboard.projects]
  );

  const activeProjects = useMemo(
    () =>
      dashboard.projects
        .filter((project) => project.status !== "completed")
        .sort((a, b) => b.progress - a.progress),
    [dashboard.projects]
  );

  return (
    <GMLayout>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <SummaryCard
            label="Proyek Aktif"
            value={dashboard.summary.active_projects.toLocaleString("id-ID")}
            icon={<Briefcase className="text-[#1E3A8A]" />}
          />
          <SummaryCard
            label="Progres Rata-rata"
            value={`${dashboard.summary.average_progress}%`}
            icon={<TrendingUp className="text-green-600" />}
          />
          <SummaryCard
            label="Total Anggaran"
            value={formatCompactRupiah(dashboard.summary.total_budget)}
            icon={<DollarSign className="text-yellow-600" />}
          />
          <SummaryCard
            label="Total Laporan"
            value={dashboard.summary.total_reports.toLocaleString("id-ID")}
            icon={<ClipboardList className="text-purple-600" />}
          />
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold">Grafik Anggaran Proyek</h3>
              <p className="text-sm text-gray-500">
                Diurutkan dari anggaran terbesar sampai terendah berdasarkan proyek yang diinput PJ.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-800">{formatRupiah(dashboard.summary.total_budget)}</span>
            </div>
          </div>

          {loading ? (
            <div className="h-[320px] flex items-center justify-center text-sm text-gray-500">
              Memuat grafik...
            </div>
          ) : budgetChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(280, budgetChartData.length * 64)}>
              <BarChart data={budgetChartData} layout="vertical" margin={{ top: 8, right: 32, bottom: 8, left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCompactRupiah(Number(value))}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={170}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [formatRupiah(Number(value)), "Anggaran"]}
                  labelFormatter={(label) => `Proyek: ${label}`}
                />
                <Bar dataKey="budget" radius={[0, 8, 8, 0]} fill="#1E3A8A" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-500">
              Belum ada proyek dari PJ.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-4">Proyek Aktif</h3>

            <div className="space-y-4">
              {activeProjects.map((project) => {
                const meta = statusMeta[project.status] || statusMeta.planned;

                return (
                  <div key={project.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.location || "-"}</p>
                        <p className="text-xs text-gray-400 mt-1">PJ: {project.pj}</p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs w-fit ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm">
                        <span>Progres</span>
                        <span>{project.progress}%</span>
                      </div>

                      <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                        <div
                          className="bg-[#1E3A8A] h-2 rounded-full"
                          style={{ width: `${Math.min(project.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {!loading && activeProjects.length === 0 && (
                <div className="bg-gray-50 p-6 rounded-lg text-center text-sm text-gray-500">
                  Belum ada proyek aktif dari PJ.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-4">Status Proyek</h3>
            <div className="space-y-3">
              <StatusRow label="Direncanakan" value={dashboard.summary.status_counts.planned} className="bg-gray-100 text-gray-600" />
              <StatusRow label="Berjalan" value={dashboard.summary.status_counts.running} className="bg-green-100 text-green-600" />
              <StatusRow label="Terlambat" value={dashboard.summary.status_counts.delayed} className="bg-red-100 text-red-600" />
              <StatusRow label="Selesai" value={dashboard.summary.status_counts.completed} className="bg-blue-100 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </GMLayout>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm flex justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h2 className="text-2xl font-bold mt-1">{value}</h2>
      </div>
      <div className="shrink-0">{icon}</div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex items-center justify-between border rounded-lg p-3">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>
        {value}
      </span>
    </div>
  );
}
