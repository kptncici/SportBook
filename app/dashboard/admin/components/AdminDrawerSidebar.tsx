"use client";

import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminDrawerSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-50 transform transition-transform md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar />
      </div>
    </>
  );
}
