"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState({
    name: "Admin Sistem",
    position: "Administrator",
    profile_photo_url: null,
  });

  useEffect(() => {
    const rawUser = localStorage.getItem("simpro_user");
    if (!rawUser) return;

    try {
      const parsed = JSON.parse(rawUser);
      setUser({
        name: parsed.name || "Admin Sistem",
        position: parsed.position || "Administrator",
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
    <div className="bg-white border-b border-gray-200 flex items-center justify-between px-8 py-2 ">

      <h1 className="text-xl font-bold text-gray-600">
        Selamat Datang Admin
      </h1>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold mb-0 leading-tight">{user.name}</p>
          <p className="text-xs text-gray-500 mt-0">{user.position}</p>
        </div>

        {user.profile_photo_url ? (
          <img
            src={user.profile_photo_url}
            alt="Foto profil"
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-[#1E3A8A] text-white flex items-center justify-center rounded-full font-semibold">
            {initials || "A"}
          </div>
        )}
      </div>

    </div>
  );
}
