"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminHeaderMobile({
  onMenu,
}: {
  onMenu: () => void;
}) {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith("/dashboard/admin/fields")) return "Lapangan";
    if (pathname.startsWith("/dashboard/admin/bookings")) return "Approval";
    if (pathname.startsWith("/dashboard/admin/history")) return "Riwayat";
    if (pathname.startsWith("/dashboard/admin/transactions")) return "Transaksi";
    if (pathname.startsWith("/dashboard/admin/scanner")) return "Scan QR";
    return "Dashboard Admin";
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b shadow-sm h-14 flex items-center justify-between px-4 z-50">
      <button onClick={onMenu} className="p-2 text-gray-700">
        <Menu size={24} />
      </button>

      <h1 className="text-lg font-semibold">{getTitle()}</h1>

      <div className="w-6" />
    </header>
  );
}
