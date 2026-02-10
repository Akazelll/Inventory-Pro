"use client";

import { deleteProduct } from "./actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        if (confirm("Yakin hapus produk ini?")) await deleteProduct(id);
      }}
    >
      <Button
        variant='ghost'
        size='icon'
        className='text-destructive hover:bg-destructive/10'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </form>
  );
}
