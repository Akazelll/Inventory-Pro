"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Layers } from "lucide-react";
import { toast } from "sonner";

export function CategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, {
    success: false,
    message: null,
    errors: {},
  });
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      const timer = setTimeout(() => {
        router.push("/dashboard/categories");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className='max-w-2xl mx-auto space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Layers className='h-5 w-5 text-primary' />
            Detail Kategori
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>
              Nama Kategori <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='name'
              name='name'
              placeholder='Contoh: Elektronik, Pakaian, Makanan...'
              required
            />
            {state.errors?.name && (
              <p className='text-destructive text-xs font-medium'>
                {state.errors.name}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Deskripsi (Opsional)</Label>
            <Textarea
              id='description'
              name='description'
              placeholder='Deskripsi singkat tentang kategori ini...'
              className='resize-none'
            />
          </div>
        </CardContent>
      </Card>

      <div className='flex items-center justify-end gap-4'>
        <Button
          variant='outline'
          type='button'
          onClick={() => router.back()}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Menyimpan...
            </>
          ) : (
            "Simpan Kategori"
          )}
        </Button>
      </div>
    </form>
  );
}
