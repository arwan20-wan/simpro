"use client";

import { useState } from "react";
import PJLayout from "@/components/PJLayout";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function ProfilPJ() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <PJLayout>
      <div className="space-y-4">

        {/* HEADER */}
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            Profil Saya
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="bg-white rounded-xl border p-6 flex flex-col items-center text-center">

            {/* AVATAR */}
              <div
  style={{
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
  }}
>
  {profileImage ? (
    <img
      src={profileImage}
      alt="Profile"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  ) : (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#1E3A8A",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "32px",
        fontWeight: "bold",
      }}
    >
      AF
    </div>
  )}
</div>

            <h2 className="mt-4 text-lg font-semibold">
              Ahmad Fauzi
            </h2>

            <p className="text-sm text-gray-500">
              Penanggung Jawab Konstruksi
            </p>

            {/* INFO */}
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2 justify-center">
                <Mail size={14} /> ahmad.fauzi@simpro.id
              </p>
              <p className="flex items-center gap-2 justify-center">
                <Phone size={14} /> +62 812-3456-7890
              </p>
              <p className="flex items-center gap-2 justify-center">
                <MapPin size={14} /> Jakarta, Indonesia
              </p>
            </div>

            {/* UPLOAD */}
            <label
              htmlFor="uploadFoto"
              className="mt-4 w-full bg-[#1E3A8A] text-white py-2 rounded-lg text-center cursor-pointer block"
            >
              Ubah Foto Profil
            </label>
            <input
              id="uploadFoto"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }} // 🔥 ini kunci utama
            />
          </div>

          {/* RIGHT */}
          <div className="col-span-2 space-y-6">

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Informasi Pribadi
              </h3>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-sm text-gray-600">Nama Lengkap</label>
                  <div className="flex items-center gap-2 border p-2 rounded-lg mt-1">
                    <User size={16} />
                    <input value="Ahmad Fauzi" className="w-full outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <div className="flex items-center gap-2 border p-2 rounded-lg mt-1">
                    <Mail size={16} />
                    <input value="ahmad.fauzi@simpro.id" className="w-full outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Nomor Telepon</label>
                  <div className="flex items-center gap-2 border p-2 rounded-lg mt-1">
                    <Phone size={16} />
                    <input value="+62 812-3456-7890" className="w-full outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Tanggal Lahir</label>
                  <div className="flex items-center gap-2 border p-2 rounded-lg mt-1">
                    <Calendar size={16} />
                    <input type="date" value="1990-05-15" className="w-full outline-none" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Alamat</label>
                  <textarea
                    className="w-full border p-2 rounded-lg mt-1"
                    rows={3}
                    defaultValue="Jl. Sudirman No. 123, Jakarta Selatan"
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </PJLayout>
  );
}