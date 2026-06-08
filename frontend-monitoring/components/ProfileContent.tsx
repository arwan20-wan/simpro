"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react";
import API from "@/services/api";

type Profile = {
  name: string;
  email: string;
  phone: string;
  position: string;
  birthDate: string;
  address: string;
  profilePhotoUrl: string | null;
};

type ProfileContentProps = {
  fallbackPosition: string;
};

const initialProfile = (fallbackPosition: string): Profile => ({
  name: "Pengguna SIMPRO",
  email: "-",
  phone: "-",
  position: fallbackPosition,
  birthDate: "",
  address: "-",
  profilePhotoUrl: null,
});

function normalizeUser(user: any, fallbackPosition: string): Profile {
  return {
    name: user?.name || "Pengguna SIMPRO",
    email: user?.email || "-",
    phone: user?.phone || "-",
    position: user?.position || fallbackPosition,
    birthDate: user?.birth_date || "",
    address: user?.address || "-",
    profilePhotoUrl: user?.profile_photo_url || null,
  };
}

function updateStoredUser(user: any) {
  if (typeof window === "undefined") return;

  const rawUser = localStorage.getItem("simpro_user");
  const currentUser = rawUser ? JSON.parse(rawUser) : {};
  localStorage.setItem("simpro_user", JSON.stringify({ ...currentUser, ...user }));
}

export default function ProfileContent({ fallbackPosition }: ProfileContentProps) {
  const [profile, setProfile] = useState<Profile>(() => initialProfile(fallbackPosition));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawUser = localStorage.getItem("simpro_user");

      if (rawUser) {
        try {
          setProfile(normalizeUser(JSON.parse(rawUser), fallbackPosition));
        } catch {
          // ignore invalid storage format
        }
      }
    }

    API.get("/me")
      .then((response) => {
        const user = response.data.user;
        updateStoredUser(user);
        setProfile(normalizeUser(user, fallbackPosition));
      })
      .catch((error) => {
        console.error("Gagal memuat profil:", error);
      });
  }, [fallbackPosition]);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_photo", file);
    setUploading(true);

    try {
      const response = await API.post("/profile-photo", formData);
      const user = response.data.user;
      updateStoredUser(user);
      setProfile(normalizeUser(user, fallbackPosition));
    } catch (error) {
      console.error("Gagal upload foto profil:", error);
      alert("Gagal mengubah foto profil. Pastikan file berupa gambar dan ukuran maksimal 5MB.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const initials = profile.name
    .split(" ")
    .map((word) => word[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Profil Saya</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6 flex flex-col items-center text-center">
          <div className="w-40 h-40 rounded-full overflow-hidden shrink-0">
            {profile.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt="Foto profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1E3A8A] text-white flex items-center justify-center text-3xl font-bold">
                {initials || "U"}
              </div>
            )}
          </div>

          <h2 className="mt-4 text-lg font-semibold">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.position}</p>

          <label
            htmlFor="uploadFotoProfil"
            className="mt-4 w-full bg-[#1E3A8A] text-white py-2 rounded-lg text-center cursor-pointer block"
          >
            {uploading ? "Mengunggah..." : "Ubah Foto Profil"}
          </label>
          <input
            id="uploadFotoProfil"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="hidden"
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Informasi Pribadi</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nama Lengkap</label>
                <div className="flex items-center gap-2 border p-2 rounded-lg mt-1">
                  <User size={16} />
                  <input value={profile.name} readOnly className="w-full outline-none bg-transparent" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <div className="flex items-center gap-2 border p-2 rounded-lg mt-1">
                  <Mail size={16} />
                  <input value={profile.email} readOnly className="w-full outline-none bg-transparent" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Nomor Telepon</label>
                <div className="flex items-center gap-2 border p-2 rounded-lg mt-1">
                  <Phone size={16} />
                  <input value={profile.phone} readOnly className="w-full outline-none bg-transparent" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Tanggal Lahir</label>
                <div className="flex items-center gap-2 border p-2 rounded-lg mt-1">
                  <Calendar size={16} />
                  <input type="date" value={profile.birthDate} readOnly className="w-full outline-none bg-transparent" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Alamat</label>
                <div className="flex items-start gap-2 border p-2 rounded-lg mt-1">
                  <MapPin size={16} className="mt-1 shrink-0" />
                  <textarea
                    className="w-full bg-transparent outline-none"
                    rows={3}
                    value={profile.address}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
