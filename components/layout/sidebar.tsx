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
  Package2,
  PanelLeftClose, // Ikon untuk menutup sidebar
  PanelLeftOpen,
  Tags, // Ikon untuk membuka sidebar
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Definisi Menu Item
const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "staff"],
  },
  {
    title: "Produk",
    href: "/dashboard/products",
    icon: Package,
    roles: ["admin", "manager", "staff"],
  },
  {
    title: "Kategori",
    href: "/dashboard/categories",
    icon: Tags,
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
    roles: ["admin", "manager"],
  },
  {
    title: "Pengguna",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin", "manager"],
  },
];

interface SidebarProps {
  userRole: string;
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
  isMobile?: boolean;
}

export function Sidebar({
  userRole,
  isCollapsed = false,
  toggleSidebar,
  isMobile = false,
}: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = sidebarItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <div className='flex h-full flex-col'>
      {/* HEADER SIDEBAR */}
      <div
        className={cn(
          "flex h-14 items-center border-b px-3 lg:h-[60px]",
          // Jika Collapsed: Center content (hanya tombol)
          // Jika Expanded: Space Between (Logo Kiri, Tombol Kanan)
          isCollapsed ? "justify-center" : "justify-between",
        )}
      >
        {/* LOGO (Hanya tampil jika TIDAK collapsed) */}
        {!isCollapsed && (
          <Link
            href='/'
            className='flex items-center gap-2 font-semibold truncate'
          >
            <Package2 className='h-6 w-6' />
            <span className='truncate'>InventoryPro</span>
          </Link>
        )}

        {/* TOMBOL TOGGLE (Hanya di Desktop) */}
        {!isMobile && toggleSidebar && (
          <Button
            variant='ghost'
            size='icon'
            className={cn("h-8 w-8", isCollapsed && "h-9 w-9")} // Sesuaikan ukuran saat collapsed
            onClick={toggleSidebar}
          >
            {isCollapsed ? (
              <PanelLeftOpen className='h-5 w-5' /> // Ikon Buka (Panah ke Kanan/Kotak)
            ) : (
              <PanelLeftClose className='h-5 w-5' /> // Ikon Tutup (Panah ke Kiri/Kotak)
            )}
            <span className='sr-only'>Toggle Sidebar</span>
          </Button>
        )}
      </div>

      {/* MENU ITEMS */}
      <div className='flex-1 overflow-auto py-4 px-2'>
        <nav className='grid gap-1'>
          <TooltipProvider delayDuration={0}>
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              // Render Button Content
              const ButtonContent = (
                <span
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "transparent",
                    isCollapsed ? "justify-center px-2" : "",
                  )}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && <span>{item.title}</span>}
                </span>
              );

              // Jika Collapsed, bungkus dengan Tooltip
              if (isCollapsed && !isMobile) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>{ButtonContent}</Link>
                    </TooltipTrigger>
                    <TooltipContent side='right'>{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={index} href={item.href}>
                  {ButtonContent}
                </Link>
              );
            })}
          </TooltipProvider>
        </nav>
      </div>
    </div>
  );
}
