"use client";

export default function NavbarPJ() {
  return (
    <div className="w-full bg-white border-b px-6 py-4 flex justify-between items-center">

      {/* LEFT */}
      <h1 className="text-lg font-semibold text-gray-800">
        Selamat datang Penanggung Jawab
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* TEXT */}
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">
            Ahmad Fauzi
          </p>
          <p className="text-xs text-gray-500">
            Penanggung Jawab Konstruksi
          </p>
        </div>

        {/* AVATAR */}
        <div className="w-9 h-9 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-semibold">
          A
        </div>

      </div>

    </div>
  );
}