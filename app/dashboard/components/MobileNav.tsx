"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  Clock,
  ShieldCheck,
  History,
  CreditCard,
} from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export default function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // FIX: Beri tipe eksplisit
  let menus: MenuItem[] = [];

  if (role === "USER") {
    menus = [
      { href: "/dashboard", icon: Home, label: "Home" },
      { href: "/dashboard/booking", icon: CalendarDays, label: "Booking" },
      { href: "/dashboard/history", icon: Clock, label: "Riwayat" },
    ];
  }

  if (role === "ADMIN") {
    menus = [
      { href: "/dashboard/admin", icon: Home, label: "Home" },
      { href: "/dashboard/admin/bookings", icon: ShieldCheck, label: "Approval" },
      { href: "/dashboard/admin/history", icon: History, label: "History" },
      { href: "/dashboard/admin/transactions", icon: CreditCard, label: "Transaksi" },
    ];
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 md:hidden z-50">
      {menus.map((m) => {
        const Icon = m.icon;
        return (
          <Link
            key={m.href}
            href={m.href}
            className={`flex flex-col items-center text-xs ${
              isActive(m.href) ? "text-indigo-600" : "text-gray-500"
            }`}
          >
            <Icon size={20} />
            <span>{m.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
