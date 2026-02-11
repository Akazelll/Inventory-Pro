import { createClient } from "@/utils/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, History } from "lucide-react";

// Memastikan data selalu fresh
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch Stats & Chart Data secara paralel (Lebih Cepat)
  const [statsRes, chartRes, activityRes] = await Promise.all([
    supabase.rpc("get_dashboard_stats"),
    supabase.rpc("get_inventory_chart_data"),
    supabase.rpc("get_recent_transactions"), // Kita buat RPC sederhana atau query biasa
  ]);

  // Fallback jika RPC recent transactions belum dibuat, gunakan query builder:
  const { data: recentTransactions } = await supabase
    .from("inventory_transactions")
    .select(
      `
      id, quantity, type, created_at,
      products ( name ),
      profiles ( full_name )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className='space-y-8'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Dashboard Overview
          </h1>
          <p className='text-muted-foreground'>
            Pantau kesehatan inventaris Anda secara real-time.
          </p>
        </div>
        <Link href='/dashboard/inventory/new'>
          <Button className='shadow-md'>Buat Transaksi Baru</Button>
        </Link>
      </div>

      {/* Stats Section */}
      <StatsCards stats={statsRes.data || {}} />

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
        {/* Chart Section - Dinamis dari SQL */}
        <Card className='col-span-4 border-none shadow-sm'>
          <CardHeader>
            <CardTitle>Arus Barang</CardTitle>
            <CardDescription>
              Perbandingan stok masuk dan keluar dalam 7 hari terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className='pl-2'>
            <OverviewChart data={chartRes.data || []} />
          </CardContent>
        </Card>

        {/* Recent Activity Section - Dinamis dari Query */}
        <Card className='col-span-3 border-none shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div className='space-y-1'>
              <CardTitle className='flex items-center gap-2'>
                <History className='h-4 w-4 text-primary' /> Aktivitas Terbaru
              </CardTitle>
              <CardDescription>Log pergerakan barang terakhir.</CardDescription>
            </div>
            <Link href='/dashboard/inventory'>
              <Button variant='ghost' size='icon'>
                <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <RecentActivity transactions={recentTransactions || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
