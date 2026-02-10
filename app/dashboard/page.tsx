import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  CreditCard,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// Helper untuk format Rupiah
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch Data secara Paralel (untuk performa)
  // Kita mengambil data yang diperlukan saja untuk menghitung statistik
  const [productsRes, transactionsRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, price, current_stock, min_stock_level"),
    supabase
      .from("inventory_transactions")
      .select(
        `
        id, 
        type, 
        quantity, 
        created_at, 
        products (name), 
        profiles (full_name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const products = productsRes.data || [];
  const recentTransactions = transactionsRes.data || [];

  // 2. Hitung Statistik (Business Logic)

  // A. Total Produk
  const totalProducts = products.length;

  // B. Total Stok (Jumlah item fisik)
  const totalStockItems = products.reduce(
    (acc, curr) => acc + curr.current_stock,
    0,
  );

  // C. Total Nilai Aset (Harga x Stok)
  const totalAssetValue = products.reduce(
    (acc, curr) => acc + curr.price * curr.current_stock,
    0,
  );

  // D. Stok Menipis (Logic: current <= min)
  const lowStockCount = products.filter(
    (p) => p.current_stock <= p.min_stock_level,
  ).length;

  return (
    <div className='flex-1 space-y-4'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
      </div>

      {/* --- STATISTIC CARDS --- */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Widget 1: Total Nilai Aset */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Nilai Aset
            </CardTitle>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalAssetValue)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Estimasi valuasi stok saat ini
            </p>
          </CardContent>
        </Card>

        {/* Widget 2: Total Produk */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Produk</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalProducts}</div>
            <p className='text-xs text-muted-foreground'>
              {totalStockItems} unit total item fisik
            </p>
          </CardContent>
        </Card>

        {/* Widget 3: Stok Menipis */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Stok Menipis</CardTitle>
            <AlertTriangle className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${lowStockCount > 0 ? "text-destructive" : ""}`}
            >
              {lowStockCount}
            </div>
            <p className='text-xs text-muted-foreground'>
              Produk di bawah level minimum
            </p>
          </CardContent>
        </Card>

        {/* Widget 4: Aktivitas */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Aktivitas</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              +{recentTransactions.length}
            </div>
            <p className='text-xs text-muted-foreground'>
              Transaksi baru-baru ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- RECENT TRANSACTIONS TABLE --- */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4 lg:col-span-7'>
          <CardHeader>
            <CardTitle>Transaksi Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Oleh</TableHead>
                  <TableHead className='text-right'>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-center h-24 text-muted-foreground'
                    >
                      Belum ada transaksi.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTransactions.map((trx) => (
                    <TableRow key={trx.id}>
                      <TableCell className='font-medium'>
                        {/* @ts-ignore: join result */}
                        {trx.products?.name || "Produk dihapus"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            trx.type === "IN"
                              ? "default" // Hitam/Putih (Masuk)
                              : trx.type === "OUT"
                                ? "destructive" // Merah (Keluar)
                                : "secondary" // Abu-abu (Adjustment)
                          }
                          className='flex w-fit items-center gap-1'
                        >
                          {trx.type === "IN" && (
                            <TrendingUp className='h-3 w-3' />
                          )}
                          {trx.type === "OUT" && (
                            <TrendingDown className='h-3 w-3' />
                          )}
                          {trx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {trx.type === "OUT" ? "-" : "+"}
                        {trx.quantity}
                      </TableCell>
                      <TableCell>
                        {/* @ts-ignore: join result */}
                        {trx.profiles?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell className='text-right text-muted-foreground'>
                        {new Date(trx.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
