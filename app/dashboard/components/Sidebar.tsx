"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  Home,
  ShieldCheck,
  Clock,
  History,
  CreditCard,
} from "lucide-react";

interface MenuItem {
  href: string;
  name: string;
  icon: any;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (!role) return null;

  let menus: MenuItem[] = [];

  if (role === "USER") {
    menus = [
      { href: "/dashboard", name: "Dashboard", icon: Home },
      { href: "/dashboard/booking", name: "Booking", icon: CalendarDays },
      { href: "/dashboard/history", name: "Riwayat", icon: Clock },
    ];
  }

  if (role === "ADMIN") {
    menus = [
      { href: "/dashboard/admin", name: "Dashboard", icon: Home },
      { href: "/dashboard/admin/fields", name: "Lapangan", icon: CalendarDays },
      { href: "/dashboard/admin/bookings", name: "Approval", icon: ShieldCheck },
      { href: "/dashboard/admin/history", name: "Riwayat Booking", icon: History },
      { href: "/dashboard/admin/transactions", name: "Transaksi", icon: CreditCard },
      { href: "/dashboard/admin/scanner", name: "Scan QR", icon: ShieldCheck },
    ];
  }

  return (
    <aside
      className="
        fixed top-0 left-0
        w-64 h-full
        bg-white border-r shadow-sm
        flex flex-col
        z-40
      "
    >

      <div className="px-4 py-4 text-xl font-bold">
        <span className="text-indigo-600">⚽</span> SportBook
      </div>

      <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
        {menus.map((m) => {
          const Icon = m.icon;
          const active =
            pathname === m.href || pathname.startsWith(m.href + "/");

          return (
            <Link
              key={m.href}
              href={m.href}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon size={18} />
              {m.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 text-center">
        <p className="text-sm font-semibold text-gray-700">
          {session?.user?.name}
        </p>
        <p className="text-xs text-gray-400 capitalize">
          {role.toLowerCase()}
        </p>
        <p className="text-xs text-gray-400 mt-1">v0.1</p>
      </div>
    </aside>
  );
}
