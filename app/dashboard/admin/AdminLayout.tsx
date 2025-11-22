"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

import AdminSidebar from "./components/AdminSidebar";
import AdminHeaderMobile from "./components/AdminHeaderMobile";
import AdminDrawerSidebar from "./components/AdminDrawerSidebar";
import AdminMobileNav from "./components/AdminMobileNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR (DESKTOP) */}
      <div className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-white border-r z-50">
        <AdminSidebar />
      </div>

      {/* MOBILE DRAWER */}
      <AdminDrawerSidebar open={open} onClose={() => setOpen(false)} />

      {/* MAIN AREA */}
      <div className="flex-1 md:ml-64 pb-20 md:pb-0">

        {/* MOBILE HEADER */}
        <AdminHeaderMobile onMenu={() => setOpen(true)} />

        {/* PAGE CONTENT */}
        <main className="pt-20 md:pt-8 px-4 md:px-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* MOBILE NAV */}
      {session?.user?.role === "ADMIN" && <AdminMobileNav />}
    </div>
  );
}
