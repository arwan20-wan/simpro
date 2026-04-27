"use client";

import GMSidebar from "./GMSidebar";
import GMNavbar from "./GMNavbar";

export default function GMLayout({ children }: any) {
  return (
    <div className="flex">

      {/* SIDEBAR */}
      <GMSidebar/>

      {/* CONTENT */}
      <div className="ml-64 flex-1 h-screen overflow-hidden bg-gray-100 flex flex-col">

        {/* NAVBAR */}
        <GMNavbar/>

        {/* PAGE CONTENT */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

      </div>

    </div>
  );
}