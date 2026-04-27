"use client";

export default function Navbar() {
  return (
    <div className="bg-white border-b border-gray-200 flex items-center justify-between px-8 py-2 ">

      <h1 className="text-xl font-bold text-gray-600">
        Selamat Datang Admin
      </h1>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold">Admin Sistem</p>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>

        <div className="w-12 h-12 bg-[#1E3A8A] text-white flex items-center justify-center rounded-full  font-semibold">
          A
        </div>
      </div>

    </div>
  );
}