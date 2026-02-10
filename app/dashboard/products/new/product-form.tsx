"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function ProductForm({ categories }: { categories: any[] }) {
  const [state, formAction, isPending] = useActionState(createProduct, {
    success: false,
    message: null,
    errors: {},
  });

  const router = useRouter();

  // State untuk Preview Gambar
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect: Handle Toast & Redirect
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      const timer = setTimeout(() => {
        router.push("/dashboard/products");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  // Handle Image Change untuk Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  // Handle Hapus Gambar
  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form action={formAction}>
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* KOLOM KIRI: Informasi Utama */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>
                  Nama Produk <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  name='name'
                  placeholder='Contoh: Kopi Arabika Premium 1kg'
                  required
                />
                {state.errors?.name && (
                  <p className='text-destructive text-xs'>
                    {state.errors.name}
                  </p>
                )}
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='description'>Deskripsi</Label>
                <Textarea
                  id='description'
                  name='description'
                  placeholder='Jelaskan detail produk...'
                  className='min-h-[120px]'
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventaris & Kategori</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='sku'>
                    SKU (Kode Barang) <span className='text-red-500'>*</span>
                  </Label>
                  <Input id='sku' name='sku' placeholder='PROD-001' required />
                  {state.errors?.sku && (
                    <p className='text-destructive text-xs'>
                      {state.errors.sku}
                    </p>
                  )}
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='category_id'>
                    Kategori <span className='text-red-500'>*</span>
                  </Label>
                  <Select name='category_id' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih Kategori' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state.errors?.category_id && (
                    <p className='text-destructive text-xs'>
                      {state.errors.category_id}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: Gambar & Harga */}
        <div className='space-y-6'>
          {/* Upload Gambar */}
          <Card>
            <CardHeader>
              <CardTitle>Gambar Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4'>
                {preview ? (
                  <div className='relative aspect-square w-full rounded-md border overflow-hidden'>
                    <img
                      src={preview}
                      alt='Preview'
                      className='object-cover w-full h-full'
                    />
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute top-2 right-2 h-6 w-6'
                      onClick={handleRemoveImage}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className='aspect-square w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors'
                  >
                    <div className='p-3 bg-muted rounded-full'>
                      <Upload className='h-6 w-6 text-muted-foreground' />
                    </div>
                    <span className='text-sm text-muted-foreground font-medium'>
                      Klik untuk upload
                    </span>
                  </div>
                )}

                {/* Hidden Input */}
                <Input
                  ref={fileInputRef}
                  id='image'
                  name='image'
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleImageChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Harga & Stok */}
          <Card>
            <CardHeader>
              <CardTitle>Harga & Stok</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-2'>
                <Label htmlFor='price'>
                  Harga Satuan (Rp) <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='price'
                  name='price'
                  type='number'
                  min='0'
                  defaultValue='0'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='current_stock'>Stok Awal</Label>
                  <Input
                    id='current_stock'
                    name='current_stock'
                    type='number'
                    min='0'
                    defaultValue='0'
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='min_stock_level'>Min. Alert</Label>
                  <Input
                    id='min_stock_level'
                    name='min_stock_level'
                    type='number'
                    min='1'
                    defaultValue='5'
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className='flex items-center justify-end gap-4 mt-8 pt-4 border-t'>
        <Button
          variant='outline'
          type='button'
          onClick={() => router.back()}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type='submit' disabled={isPending} className='min-w-[150px]'>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Menyimpan...
            </>
          ) : (
            "Simpan Produk"
          )}
        </Button>
      </div>
    </form>
  );
}
