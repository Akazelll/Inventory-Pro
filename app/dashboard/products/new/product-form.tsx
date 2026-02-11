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
import { Loader2, Upload, X, ScanBarcode } from "lucide-react";
import { toast } from "sonner";
import { BarcodeScanner } from "@/components/products/barcode-scanner"; // Pastikan path import benar

export function ProductForm({
  categories,
  suppliers,
}: {
  categories: any[];
  suppliers: any[];
}) {
  const [state, formAction, isPending] = useActionState(createProduct, {
    success: false,
    message: null,
    errors: {},
  });

  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE UNTUK SCANNER ---
  const [barcode, setBarcode] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
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
                    Nama Produk <span className='text-destructive'>*</span>
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
                <CardTitle>Data Master & Barcode</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* --- INPUT BARCODE DENGAN SCANNER --- */}
                <div className='grid gap-2 p-4 bg-muted/20 rounded-xl border border-dashed border-primary/20'>
                  <Label htmlFor='barcode' className='text-primary font-bold'>
                    Barcode / SKU Produk
                  </Label>
                  <div className='flex gap-2'>
                    <Input
                      id='barcode'
                      name='barcode' // Supaya terbaca di Server Action
                      placeholder='Klik Scan atau ketik barcode...'
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className='font-mono bg-white h-11 border-primary/20 focus-visible:ring-primary'
                    />
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={() => setIsScannerOpen(true)}
                      className='h-11 px-6 gap-2'
                    >
                      <ScanBarcode className='h-4 w-4' /> Scan
                    </Button>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='sku'>
                      SKU (Internal ID){" "}
                      <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='sku'
                      name='sku'
                      placeholder='PROD-001'
                      required
                    />
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='category_id'>
                      Kategori <span className='text-destructive'>*</span>
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
                  </div>

                  <div className='grid gap-2 md:col-span-2'>
                    <Label htmlFor='supplier_id'>Supplier Utama</Label>
                    <Select name='supplier_id'>
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih Supplier (Opsional)' />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((sup) => (
                          <SelectItem key={sup.id} value={sup.id}>
                            {sup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KOLOM KANAN: Gambar & Harga */}
          <div className='space-y-6'>
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
                      className='aspect-square w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50'
                    >
                      <Upload className='h-6 w-6 text-muted-foreground' />
                      <span className='text-sm text-muted-foreground font-medium'>
                        Klik untuk upload
                      </span>
                    </div>
                  )}
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

            <Card>
              <CardHeader>
                <CardTitle>Harga & Stok</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='price'>
                    Harga Satuan (Rp){" "}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='price'
                    name='price'
                    type='number'
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
                      defaultValue='5'
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className='flex items-center justify-end gap-4 mt-8 pt-4 border-t'>
          <Button
            variant='outline'
            type='button'
            onClick={() => router.back()}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type='submit'
            disabled={isPending}
            className='min-w-[150px] shadow-lg'
          >
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

      {/* COMPONENT SCANNER MODAL */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code) => setBarcode(code)}
      />
    </>
  );
}
