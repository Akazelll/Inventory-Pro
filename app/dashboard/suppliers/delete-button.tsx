"use client";

import { deleteSupplier } from "./actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteSupplierButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (
      confirm(
        "Yakin hapus supplier ini? Produk yang terhubung mungkin akan kehilangan referensi supplier.",
      )
    ) {
      try {
        await deleteSupplier(id);
        toast.success("Supplier dihapus");
      } catch (e) {
        toast.error("Gagal menghapus supplier");
      }
    }
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className='text-destructive hover:bg-destructive/10'
      onClick={handleDelete}
    >
      <Trash2 className='h-4 w-4' />
    </Button>
  );
}
