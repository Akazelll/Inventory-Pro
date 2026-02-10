import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Package2 } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Cek User Auth
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // 2. Cek Role di Table Profiles
  // Kita asumsikan relasi user -> profiles sudah ada (1:1)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "staff"; // Default fallback

  return (
    <div className='grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'>
      {/* Sidebar Desktop */}
      <div className='hidden border-r bg-muted/40 md:block'>
        <div className='flex h-full max-h-screen flex-col gap-2'>
          <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
            <Link href='/' className='flex items-center gap-2 font-semibold'>
              <Package2 className='h-6 w-6' />
              <span className=''>InventoryPro</span>
            </Link>
          </div>
          <div className='flex-1 overflow-auto py-2 px-2'>
            <Sidebar userRole={userRole} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex flex-col'>
        <Header email={user.email!} role={userRole} />
        <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
          {children}
        </main>
      </div>
    </div>
  );
}
