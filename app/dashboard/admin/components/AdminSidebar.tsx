"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  ShieldCheck,
  History,
  CreditCard,
  QrCode,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menus = [
    { href: "/dashboard/admin", icon: Home, name: "Dashboard" },
    { href: "/dashboard/admin/fields", icon: CalendarDays, name: "Lapangan" },
    { href: "/dashboard/admin/bookings", icon: ShieldCheck, name: "Approval" },
    { href: "/dashboard/admin/history", icon: History, name: "Riwayat" },
    { href: "/dashboard/admin/transactions", icon: CreditCard, name: "Transaksi" },
    { href: "/dashboard/admin/scanner", icon: QrCode, name: "Scan QR" },
  ];

  return (
    <aside
      className="
        hidden md:flex
        fixed top-0 left-0
        w-64 h-full
        bg-white border-r shadow-sm
        flex-col z-50
      "
    >
      {/* HEADER */}
      <div className="px-6 py-5 text-2xl font-bold border-b">
        <span className="text-indigo-600">⚽</span> SportBook
        <div className="text-xs text-gray-400 mt-1">Admin Panel</div>
      </div>

      {/* MENU ITEMS */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menus.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t p-4 text-center text-xs text-gray-500">
        Admin Panel v0.1
      </div>
    </aside>
  );
}
