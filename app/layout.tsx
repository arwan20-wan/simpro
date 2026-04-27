import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

import BootstrapClient from "../components/BootstrapClient";

export const metadata: Metadata = {
  title: "Monitoring Proyek",
  description: "Sistem Monitoring Proyek",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}