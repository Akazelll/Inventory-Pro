"use client";

import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    // Menggunakan startTransition agar UI tidak membeku saat proses server action
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleLogout}
      disabled={isPending}
      className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50'
    >
      {isPending ? (
        <span className='flex items-center gap-2 italic opacity-70'>
          Keluar...
        </span>
      ) : (
        <span className='flex items-center gap-2'>
          <LogOut className='h-4 w-4' />
          Keluar Sesi
        </span>
      )}
    </Button>
  );
}
