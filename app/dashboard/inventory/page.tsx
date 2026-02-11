import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  FileText,
  LayoutList,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryReport from "./inventory-report"; // Impor komponen laporan baru

export default async function InventoryPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("inventory_transactions")
    .select(
      `
      *,
      products (name, sku),
      profiles (full_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className='space-y-6'>
      {/* HEADER */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Inventaris</h1>
          <p className='text-muted-foreground'>
            Pusat kendali stok dan laporan transaksi.
          </p>
        </div>
        <Link href='/dashboard/inventory/new'>
          <Button size='lg' className='gap-2 shadow-md'>
            <Plus className='h-4 w-4' /> Transaksi Baru
          </Button>
        </Link>
      </div>

      {/* TABS SYSTEM */}
      <Tabs defaultValue='history' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 max-w-[400px] mb-6 shadow-sm'>
          <TabsTrigger value='history' className='gap-2'>
            <LayoutList className='h-4 w-4' /> Riwayat Cepat
          </TabsTrigger>
          <TabsTrigger value='reports' className='gap-2'>
            <FileText className='h-4 w-4' /> Laporan Ekspor
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RIWAYAT TRANSAKSI TERAKHIR */}
        <TabsContent value='history' className='space-y-4'>
          <Card className='border-none shadow-sm'>
            <CardHeader className='flex flex-row items-center gap-2 pb-2'>
              <History className='h-5 w-5 text-primary' />
              <CardTitle className='text-base font-semibold'>
                50 Transaksi Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted/30 hover:bg-muted/30'>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Oleh</TableHead>
                    <TableHead className='text-right'>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='text-center h-32 text-muted-foreground'
                      >
                        Belum ada transaksi inventaris.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions?.map((trx) => (
                      <TableRow key={trx.id} className='hover:bg-muted/5'>
                        <TableCell className='text-xs text-muted-foreground whitespace-nowrap'>
                          {new Date(trx.created_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={
                              trx.type === "IN"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }
                          >
                            {trx.type === "IN" ? (
                              <span className='flex items-center gap-1 text-[10px]'>
                                <ArrowDownLeft className='h-3 w-3' /> Masuk
                              </span>
                            ) : (
                              <span className='flex items-center gap-1 text-[10px]'>
                                <ArrowUpRight className='h-3 w-3' /> Keluar
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium text-sm'>
                              {/* @ts-ignore */}
                              {trx.products?.name}
                            </span>
                            <span className='text-[10px] text-muted-foreground font-mono'>
                              {/* @ts-ignore */}
                              {trx.products?.sku}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='font-bold font-mono text-sm'>
                          {trx.type === "IN" ? "+" : "-"}
                          {trx.quantity}
                        </TableCell>
                        <TableCell className='text-xs'>
                          {/* @ts-ignore */}
                          {trx.profiles?.full_name || "System"}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground italic text-xs max-w-[150px] truncate'>
                          {trx.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: LAPORAN & EKSPOR */}
        <TabsContent value='reports'>
          <InventoryReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
