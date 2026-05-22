"use client";

export type RiwayatItem = {
  type: "tambah" | "edit" | "hapus";
  title: string;
  desc: string;
  time: string;
  tanggal: string;
};

const KEY = "riwayat_data";

// 🔥 Ambil data
export const getRiwayat = (): RiwayatItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Gagal ambil riwayat:", error);
    return [];
  }
};

// 🔥 Tambah data
export const addRiwayat = (item: RiwayatItem) => {
  try {
    const oldData = getRiwayat();
    const newData = [item, ...oldData];

    localStorage.setItem(KEY, JSON.stringify(newData));
  } catch (error) {
    console.error("Gagal simpan riwayat:", error);
  }
};

// 🔥 Optional: hapus semua riwayat (kalau nanti butuh)
export const clearRiwayat = () => {
  localStorage.removeItem(KEY);
};