"use client";

import { useTransition } from "react";
import { deleteCategory } from "./actions";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        "Yakin hapus kategori ini? Produk dalam kategori ini mungkin akan kehilangan kategorinya.",
      )
    )
      return;

    startTransition(async () => {
      try {
        await deleteCategory(id);
        toast.success("Kategori dihapus");
      } catch (error: any) {
        toast.error("Gagal menghapus: " + error.message);
      }
    });
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className='text-red-500 hover:text-red-700 hover:bg-red-50'
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Trash2 className='h-4 w-4' />
      )}
    </Button>
  );
}
