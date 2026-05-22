"use client";

export default function GMNavbar() {
  return (
    <div className="w-full bg-white border-b px-6 py-6 flex justify-between items-center">

      {/* LEFT */}
      <h1 className="text-lg font-semibold text-gray-800">
        Selamat datang General Manager
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* TEXT */}
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">
            Siti Nurhaliza
          </p>
          <p className="text-xs text-gray-500">
            General Manager
          </p>
        </div>

        {/* AVATAR */}
        <div className="w-9 h-9 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-semibold">
          s
        </div>

      </div>

    </div>
  );
}