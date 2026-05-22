"use client";

import { useEffect } from "react";

export default function DashboardPage() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <div>
      Dashboard
    </div>
  );
}