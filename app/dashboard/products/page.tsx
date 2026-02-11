import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  PackageSearch,
  Barcode as BarcodeIcon,
  Search,
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
import { DeleteProductButton } from "./delete-button";
import { Input } from "@/components/ui/input";

export default async function ProductsPage() {
  const supabase = await createClient();

  // Fetch produk join kategori (kolom barcode akan ikut terambil karena menggunakan *)
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className='space-y-6'>
      {/* HEADER SECTION */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Produk</h1>
          <p className='text-muted-foreground'>
            Kelola katalog barang dan pantau status stok Anda.
          </p>
        </div>
        <Link href='/dashboard/products/new'>
          <Button className='shadow-md'>
            <PlusCircle className='mr-2 h-4 w-4' /> Tambah Produk
          </Button>
        </Link>
      </div>

      {/* FILTER & SEARCH BAR (Visual Only for now) */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Cari berdasarkan nama, SKU, atau scan barcode...'
          className='pl-10 max-w-md bg-card'
        />
      </div>

      {/* TABLE SECTION */}
      <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
        <Table>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              <TableHead className='w-[80px]'>Gambar</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Barcode / SKU</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className='text-right'>Harga</TableHead>
              <TableHead className='w-[100px] text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center h-48 text-muted-foreground'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <PackageSearch className='h-10 w-10 opacity-20' />
                    <p>Belum ada data produk yang terdaftar.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => (
                <TableRow
                  key={product.id}
                  className='hover:bg-muted/5 transition-colors'
                >
                  <TableCell>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className='h-12 w-12 rounded-lg object-cover bg-muted border'
                      />
                    ) : (
                      <div className='h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground border border-dashed font-medium'>
                        NO IMG
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='font-semibold text-sm'>
                        {product.name}
                      </span>
                      <span className='text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]'>
                        {product.description || "Tidak ada deskripsi"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col gap-1'>
                      {/* Tampilkan Badge Barcode jika ada */}
                      {product.barcode ? (
                        <div className='flex items-center gap-1.5 text-xs font-mono text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded border border-emerald-100'>
                          <BarcodeIcon className='h-3 w-3' />
                          {product.barcode}
                        </div>
                      ) : (
                        <span className='text-[10px] text-muted-foreground italic'>
                          No Barcode
                        </span>
                      )}
                      <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-tight'>
                        SKU: {product.sku}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary' className='font-normal'>
                      {product.categories?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className='font-mono'
                      variant={
                        product.current_stock <= product.min_stock_level
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {product.current_stock} Unit
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right font-bold'>
                    Rp {product.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      {/* Tombol Edit bisa ditambahkan di sini nanti */}
                      <DeleteProductButton id={product.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
