"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userRole: string;
  userEmail: string;
}

export function DashboardLayoutClient({
  children,
  userRole,
  userEmail,
}: DashboardLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className='flex min-h-screen w-full bg-muted/40'>
      {/* SIDEBAR DESKTOP */}
      <aside
        className={cn(
          "hidden border-r bg-background transition-[width] duration-300 ease-in-out md:flex md:flex-col",
          // Saat collapsed, lebar 70px cukup untuk icon centered
          isCollapsed ? "w-[70px]" : "w-[240px] lg:w-[280px]",
        )}
      >
        <Sidebar
          userRole={userRole}
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </aside>

      {/* MAIN CONTENT */}
      <div className='flex flex-1 flex-col min-w-0 overflow-hidden'>
        <Header email={userEmail} role={userRole} />
        <main className='flex-1 overflow-y-auto p-4 lg:p-6'>{children}</main>
      </div>
    </div>
  );
}
