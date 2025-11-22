"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import HeaderMobile from "./components/HeaderMobile";
import DrawerSidebar from "./components/DrawerSidebar";
import MobileNav from "./components/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  // ❗ FIX PALING PENTING:
  // Jangan pakai layout user untuk halaman admin.
  if (pathname.startsWith("/dashboard/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      {/* MIDTRANS SNAP */}
      <script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      ></script>

      <div className="flex min-h-screen">

        {/* SIDEBAR USER (DESKTOP) */}
        <div className="hidden md:flex fixed top-0 left-0 h-full w-64 z-50 bg-white">
          <Sidebar />
        </div>

        {/* MOBILE DRAWER SIDEBAR */}
        <DrawerSidebar open={open} onClose={() => setOpen(false)} />

        {/* MAIN */}
        <div className="flex-1 md:ml-64 pb-20 md:pb-0">
          <HeaderMobile onMenu={() => setOpen(true)} />
          <main className="pt-20 md:pt-8">{children}</main>
        </div>

        {session?.user?.role === "USER" && <MobileNav role="USER" />}
      </div>
    </>
  );
}
