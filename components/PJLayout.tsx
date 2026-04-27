"use client";

import SidebarPJ from "./SidebarPJ";
import NavbarPJ from "./NavbarPJ";

export default function PJLayout({ children }: any) {
  return (
    <div className="flex">

      {/* SIDEBAR */}
      <SidebarPJ />

      {/* CONTENT */}
      <div className="ml-64 flex-1 h-screen overflow-hidden bg-gray-100 flex flex-col">

        {/* NAVBAR */}
        <NavbarPJ />

        {/* PAGE CONTENT */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

      </div>

    </div>
  );
}