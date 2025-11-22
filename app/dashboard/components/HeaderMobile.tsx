"use client";

import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";

export default function HeaderMobile({ onMenu }: { onMenu?: () => void }) {
  const pathname = usePathname();

  // Tentukan judul berdasarkan path
  const getTitle = () => {
    if (pathname.startsWith("/dashboard/admin/bookings")) return "Approval Booking";
    if (pathname.startsWith("/dashboard/admin/fields")) return "Data Lapangan";
    if (pathname.startsWith("/dashboard/admin/history")) return "Riwayat Admin";
    if (pathname.startsWith("/dashboard/admin/transactions")) return "Transaksi";
    if (pathname.startsWith("/dashboard/admin/scanner")) return "Scan QR";
    if (pathname.startsWith("/dashboard/admin")) return "Dashboard Admin";

    if (pathname.startsWith("/dashboard/booking")) return "Booking Lapangan";
    if (pathname.startsWith("/dashboard/history")) return "Riwayat Booking";
    if (pathname.startsWith("/dashboard")) return "Dashboard";

    return "SportBook";
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 flex items-center justify-between px-4 h-14">
      {/* Menu Button */}
      <button onClick={onMenu} className="p-2 text-gray-700">
        <Menu size={24} />
      </button>

      {/* Title */}
      <h1 className="text-lg font-semibold text-gray-800">{getTitle()}</h1>

      {/* User Profile Button */}
      <button className="p-2 text-gray-700">
        <User size={24} />
      </button>
    </header>
  );
}
