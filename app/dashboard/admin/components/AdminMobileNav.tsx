"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldCheck, History, CreditCard, QrCode } from "lucide-react";

export default function AdminMobileNav() {
  const pathname = usePathname();

  const menus = [
    { href: "/dashboard/admin", label: "Home", icon: Home },
    { href: "/dashboard/admin/bookings", label: "Approval", icon: ShieldCheck },
    { href: "/dashboard/admin/history", label: "History", icon: History },
    { href: "/dashboard/admin/transactions", label: "Transaksi", icon: CreditCard },
    { href: "/dashboard/admin/scanner", label: "Scan", icon: QrCode },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 z-50">
      {menus.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-xs transition ${
              active ? "text-indigo-600 font-semibold" : "text-gray-500"
            }`}
          >
            <Icon size={22} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
