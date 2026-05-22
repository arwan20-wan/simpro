"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import API from "@/services/api";

type LoginErrorResponse = {
  message?: string;
  errors?: {
    username?: string[];
  };
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/login", {
        username,
        password,
      });

      localStorage.setItem("simpro_token", response.data.token);
      localStorage.setItem("simpro_user", JSON.stringify(response.data.user));
      router.push(response.data.redirect_to);
    } catch (err: unknown) {
      const data = axios.isAxiosError<LoginErrorResponse>(err)
        ? err.response?.data
        : undefined;
      const message =
        data?.message ||
        data?.errors?.username?.[0] ||
        "Login gagal. Periksa username dan password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* 🔵 Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-[#1E3A8A]"></div>

      {/* 🏗️ Pattern Diagonal */}
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,white_0px,white_2px,transparent_2px,transparent_20px)]"></div>

      {/* 📦 Card Login */}
      <div className="relative bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl w-[400px]">

        <h1 className="text-4xl font-bold text-center !text-[#1E3A8A] mb-2">
          SIMPRO
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Sistem Monitoring Proyek
        </p>

        {/* Username */}
        <div className="mb-4">
          <label className="text-sm text-gray-700">
            Username (ID Karyawan)
          </label>
          <input
            type="text"
            placeholder="Masukkan ID Karyawan"
            className="form-control mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="text-sm text-gray-700">
            Password
          </label>
          <input
            type="password"
            placeholder="Masukkan password Anda"
            className="form-control mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn w-full py-2 !bg-[#1E3A8A] hover:!bg-[#162d6b] text-white rounded-lg"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Admin: &quot;admin&quot; / &quot;admin12345&quot;. Karyawan: ID karyawan / &quot;123456&quot;.
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-5 text-white text-sm">
        © 2026 SIMPRO - Sistem Monitoring Proyek Konstruksi
      </div>
    </div>
  );
}
