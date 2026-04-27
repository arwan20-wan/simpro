"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex relative">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 bg-gray-100 min-h-screen flex flex-col relative z-0">

        {/* NAVBAR */}
        <Navbar />

        {/* CONTENT */}
        <main className="p-6 flex-1">
          {children}
        </main>

      </div>

    </div>
  );
}