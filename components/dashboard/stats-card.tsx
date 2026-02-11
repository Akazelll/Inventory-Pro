import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Coins, Layers } from "lucide-react";

export function StatsCards({ stats }: { stats: any }) {
  const items = [
    {
      title: "Total Produk",
      value: stats.total_products,
      icon: <Package className='h-4 w-4 text-blue-600' />,
      description: "Jenis barang terdaftar",
    },
    {
      title: "Total Stok",
      value: stats.total_stock,
      icon: <Layers className='h-4 w-4 text-emerald-600' />,
      description: "Total unit di gudang",
    },
    {
      title: "Stok Menipis",
      value: stats.low_stock_count,
      icon: <AlertTriangle className='h-4 w-4 text-rose-600' />,
      description: "Perlu segera restock",
      color: stats.low_stock_count > 0 ? "text-rose-600" : "",
    },
    {
      title: "Nilai Aset",
      value: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(stats.total_asset_value),
      icon: <Coins className='h-4 w-4 text-amber-600' />,
      description: "Estimasi nilai modal",
    },
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {items.map((item, i) => (
        <Card key={i} className='shadow-sm border-none'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{item.title}</CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
