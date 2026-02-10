"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Package2 } from "lucide-react";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import Link from "next/link";

export function Header({ email, role }: { email: string; role: string }) {
  return (
    <header className='flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6'>
      {/* Mobile Menu Trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant='outline' size='icon' className='shrink-0 md:hidden'>
            <Menu className='h-5 w-5' />
            <span className='sr-only'>Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='flex flex-col'>
          <nav className='grid gap-2 text-lg font-medium'>
            <Link
              href='#'
              className='flex items-center gap-2 text-lg font-semibold'
            >
              <Package2 className='h-6 w-6' />
              <span className='sr-only'>InventoryPro</span>
            </Link>
            {/* Sidebar versi Mobile */}
            <Sidebar userRole={role} />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Logo Desktop */}
      <div className='w-full flex-1'>
        {/* Bisa diisi breadcrumbs atau search bar nanti */}
      </div>

      {/* Right Side Icons */}
      <ThemeToggle />
      <UserNav email={email} role={role} />
    </header>
  );
}
