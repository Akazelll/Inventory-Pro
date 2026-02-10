"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Truck,
} from "lucide-react";

// Definisi Menu Item
const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "staff"], // Semua bisa akses
  },
  {
    title: "Produk",
    href: "/dashboard/products",
    icon: Package,
    roles: ["admin", "manager", "staff"],
  },
  {
    title: "Inventaris",
    href: "/dashboard/inventory",
    icon: ShoppingCart,
    roles: ["admin", "manager", "staff"],
  },
  {
    title: "Supplier",
    href: "/dashboard/suppliers",
    icon: Truck,
    roles: ["admin", "manager"], // Staff tidak bisa akses menu ini (opsional, sesuai req)
  },
  {
    title: "Pengguna",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin"], // Hanya Admin
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin", "manager"],
  },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  // Filter menu berdasarkan role user
  const filteredItems = sidebarItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <nav className='grid items-start gap-2'>
      {filteredItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link key={index} href={item.href}>
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <Icon className='mr-2 h-4 w-4' />
              <span>{item.title}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
