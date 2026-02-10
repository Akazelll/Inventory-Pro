import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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

export default async function ProductsPage() {
  const supabase = await createClient();

  // Fetch produk join kategori
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Produk</h1>
        <Link href='/dashboard/products/new'>
          <Button>
            <PlusCircle className='mr-2 h-4 w-4' /> Tambah Produk
          </Button>
        </Link>
      </div>

      <div className='rounded-md border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[80px]'>Gambar</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className='text-right'>Harga</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center h-24 text-muted-foreground'
                >
                  Belum ada data produk.
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className='h-10 w-10 rounded object-cover bg-muted'
                      />
                    ) : (
                      <div className='h-10 w-10 rounded bg-muted flex items-center justify-center text-xs'>
                        No IMG
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>{product.name}</TableCell>
                  <TableCell>{product.categories?.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.current_stock <= product.min_stock_level
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {product.current_stock} Unit
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    Rp {product.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <DeleteProductButton id={product.id} />
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
