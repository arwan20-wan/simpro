"use client";

import { useEffect, useState } from "react";

export default function GMNavbar() {
  const [user, setUser] = useState({
    name: "Pengguna",
    position: "General Manager",
    profile_photo_url: null as string | null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawUser = localStorage.getItem("simpro_user");
    if (!rawUser) return;

    try {
      const parsed = JSON.parse(rawUser);
      setUser({
        name: parsed.name || "Pengguna",
        position: parsed.position || "General Manager",
        profile_photo_url: parsed.profile_photo_url || null,
      });
    } catch {
      // ignore invalid storage format
    }
  }, []);

  const initials = user.name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full bg-white border-b px-6 py-6 flex justify-between items-center">

      {/* LEFT */}
      <h1 className="text-lg font-semibold text-gray-800">
        Selamat datang {user.position}
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* TEXT */}
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800 mb-0 leading-tight">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 mt-0">
            {user.position}
          </p>
        </div>

        {/* AVATAR */}
        {user.profile_photo_url ? (
          <img
            src={user.profile_photo_url}
            alt="Foto profil"
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-semibold">
            {initials || "U"}
          </div>
        )}

      </div>

    </div>
  );
}
