"use client";

import AdminLayout from "@/components/AdminLayout";
import ProfileContent from "@/components/ProfileContent";

export default function ProfilAdmin() {
  return (
    <AdminLayout>
      <ProfileContent fallbackPosition="Administrator" />
    </AdminLayout>
  );
}
