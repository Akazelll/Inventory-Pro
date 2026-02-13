import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { PlusCircle, Layers } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteCategoryButton } from "./delete-button";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Kategori Produk</h1>
        <Link href='/dashboard/categories/new'>
          <Button>
            <PlusCircle className='mr-2 h-4 w-4' /> Tambah Kategori
          </Button>
        </Link>
      </div>

      <div className='rounded-md border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='text-center h-24 text-muted-foreground'
                >
                  Belum ada kategori. Silakan buat baru.
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className='font-medium flex items-center gap-2'>
                    <Layers className='h-4 w-4 text-muted-foreground' />
                    {category.name}
                  </TableCell>
                  <TableCell className='text-muted-foreground font-mono text-sm'>
                    {category.slug}
                  </TableCell>
                  <TableCell className='max-w-[300px] truncate'>
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>
                    <DeleteCategoryButton id={category.id} />
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
