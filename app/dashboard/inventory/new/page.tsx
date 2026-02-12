import { createClient } from "@/utils/supabase/server";
import { TransactionForm } from "./transaction-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewTransactionPage() {
  const supabase = await createClient();

  // Ambil data produk untuk pencocokan barcode & dropdown manual
  const { data: products } = await supabase
    .from("products")
    .select("id, name, barcode, sku, current_stock")
    .order("name");

  return (
    <div className='max-w-3xl mx-auto space-y-6'>
      <Link
        href='/dashboard/inventory'
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit'
      >
        <ArrowLeft className='h-4 w-4' /> Kembali ke Riwayat
      </Link>

      <div className='space-y-1'>
        <h1 className='text-3xl font-bold tracking-tight'>Transaksi Barang</h1>
        <p className='text-muted-foreground'>
          Catat perubahan stok masuk atau keluar secara akurat.
        </p>
      </div>

      {/* Memanggil Client Form */}
      <TransactionForm products={products || []} />
    </div>
  );
}
