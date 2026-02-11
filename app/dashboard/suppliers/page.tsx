import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, Phone, Mail } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteSupplierButton } from "./delete-button";

export default async function SuppliersPage() {
  const supabase = await createClient();

  // Ambil data supplier, urutkan dari yang terbaru
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Supplier</h1>
        <Link href='/dashboard/suppliers/new'>
          <Button>
            <PlusCircle className='mr-2 h-4 w-4' /> Tambah Supplier
          </Button>
        </Link>
      </div>

      <div className='rounded-md border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Perusahaan</TableHead>
              <TableHead>Kontak Person</TableHead>
              <TableHead>Kontak Info</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center h-24 text-muted-foreground'
                >
                  Belum ada data supplier.
                </TableCell>
              </TableRow>
            ) : (
              suppliers?.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className='font-medium flex items-center gap-2'>
                    <Building2 className='h-4 w-4 text-muted-foreground' />
                    {supplier.name}
                  </TableCell>
                  <TableCell>{supplier.contact_person || "-"}</TableCell>
                  <TableCell>
                    <div className='flex flex-col text-sm text-muted-foreground gap-1'>
                      {supplier.phone && (
                        <div className='flex items-center gap-1'>
                          <Phone className='h-3 w-3' /> {supplier.phone}
                        </div>
                      )}
                      {supplier.email && (
                        <div className='flex items-center gap-1'>
                          <Mail className='h-3 w-3' /> {supplier.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className='max-w-[200px] truncate'
                    title={supplier.address}
                  >
                    {supplier.address || "-"}
                  </TableCell>
                  <TableCell>
                    <DeleteSupplierButton id={supplier.id} />
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
