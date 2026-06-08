"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  DollarSign,
  User,
  LogOut,
} from "lucide-react";
import { logout } from "@/services/auth";

export default function SidebarPJ() {
  const pathname = usePathname();

  const menu = [
    {
      name: "Dashboard",
      href: "/dashboard/pj",
      icon: LayoutDashboard,
    },
    {
      name: "Laporan",
      href: "/dashboard/pj/laporan",
      icon: FileText,
    },
    {
      name: "Lapangan",
      href: "/dashboard/pj/lapangan",
      icon: ClipboardList,
    },
    {
      name: "Keuangan",
      href: "/dashboard/pj/keuangan",
      icon: DollarSign,
    },
    {
      name: "Profil",
      href: "/dashboard/pj/profil",
      icon: User,
    },
  ];

  return (
        <div className="w-65 h-screen bg-[#1E3A8A] text-white fixed left-0 top-0 flex flex-col justify-between">

      {/* LOGO */}
       <div>
        <div className="p-6 border-b border-blue-600">
          <h1 className="text-white text-2xl font-bold">SIMPRO</h1>
          <p className="text-blue-200 text-sm mt-1">
            Sistem Monitoring Proyek
          </p>
        </div>

        {/* MENU */}
        <ul className="px-3 py-4 space-y-2">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={index}>
                <Link href={item.href}>
                  <div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-white text-[#1E3A8A] font-semibold"
                          : "text-white hover:bg-blue-700"
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">
                      {item.name}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* LOGOUT */}
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-white hover:text-gray-200"
        >
          <LogOut size={18} />
          <span className="text-sm">Keluar</span>
        </button>
      </div>
    </div>
  );
}
