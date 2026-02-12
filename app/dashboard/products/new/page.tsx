import { createClient } from "@/utils/supabase/server";
import { ProductForm } from "./product-form"; // Mengambil komponen form Anda
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewProductPage() {
  const supabase = await createClient();

  // Ambil data pendukung untuk dropdown di form
  const [categoriesRes, suppliersRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("suppliers").select("id, name").order("name"),
  ]);

  return (
    <div className='space-y-6'>
      {/* Tombol Kembali */}
      <Link
        href='/dashboard/products'
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'
      >
        <ArrowLeft className='h-4 w-4' /> Kembali ke Daftar Produk
      </Link>

      <div className='space-y-1'>
        <h1 className='text-3xl font-bold tracking-tight'>Tambah Produk</h1>
        <p className='text-muted-foreground'>
          Daftarkan produk baru ke dalam sistem inventaris Anda.
        </p>
      </div>

      {/* DI SINI ADALAH TEMPAT PRODUCT FORM DIPANGGIL */}
      <ProductForm
        categories={categoriesRes.data || []}
        suppliers={suppliersRes.data || []}
      />
    </div>
  );
}
