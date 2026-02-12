"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "../actions"; // Pastikan action ini sudah dibuat
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarcodeScanner } from "@/components/products/barcode-scanner";
import {
  ScanBarcode,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";

export function TransactionForm({ products }: { products: any[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createTransaction, {
    success: false,
    message: null,
  });

  // --- STATE LOKAL ---
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [type, setType] = useState("OUT"); // Default keluar

  // Sinkronisasi Toast dari Server Action
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/dashboard/inventory");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  // LOGIKA SCANNER
  const handleScanSuccess = (decodedBarcode: string) => {
    const found = products.find((p) => p.barcode === decodedBarcode);
    if (found) {
      setSelectedProductId(found.id);
      toast.success(`Ditemukan: ${found.name}`);
      if (navigator.vibrate) navigator.vibrate(200);
    } else {
      toast.error(`Barcode ${decodedBarcode} tidak terdaftar!`);
    }
    setIsScannerOpen(false);
  };

  return (
    <>
      <form action={formAction} className='space-y-6'>
        <Card className='border-none shadow-sm'>
          <CardHeader>
            <CardTitle className='text-lg'>Input Transaksi</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* BUTTON SCANNER BESAR (Mobile First) */}
            <div className='space-y-3'>
              <Label className='text-xs font-bold uppercase text-muted-foreground'>
                Langkah 1: Scan Barang
              </Label>
              <Button
                type='button'
                variant='outline'
                className='w-full h-24 border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all group shadow-sm'
                onClick={() => setIsScannerOpen(true)}
              >
                <ScanBarcode className='h-8 w-8 text-primary group-hover:scale-110 transition-transform' />
                <span className='text-sm font-semibold tracking-wide'>
                  AKTIFKAN SCANNER
                </span>
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t'>
              {/* DROPDOWN PRODUK (Hidden input untuk menyimpan ID produk dari scanner) */}
              <div className='space-y-2 md:col-span-2'>
                <Label>Langkah 2: Konfirmasi Produk</Label>
                <input
                  type='hidden'
                  name='product_id'
                  value={selectedProductId}
                />
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger className='h-12 bg-white border-muted-foreground/20'>
                    <SelectValue placeholder='Pilih produk atau scan...' />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{p.name}</span>
                          <span className='text-[10px] text-muted-foreground'>
                            SKU: {p.sku} | Stok: {p.current_stock}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* JENIS TRANSAKSI */}
              <div className='space-y-2'>
                <Label>Jenis Transaksi</Label>
                <input type='hidden' name='type' value={type} />
                <div className='flex p-1 bg-muted rounded-lg border h-12'>
                  <button
                    type='button'
                    onClick={() => setType("IN")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md text-xs font-bold transition-all ${type === "IN" ? "bg-white shadow-sm text-emerald-600" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <ArrowDownLeft className='h-4 w-4' /> MASUK
                  </button>
                  <button
                    type='button'
                    onClick={() => setType("OUT")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md text-xs font-bold transition-all ${type === "OUT" ? "bg-white shadow-sm text-rose-600" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <ArrowUpRight className='h-4 w-4' /> KELUAR
                  </button>
                </div>
              </div>

              {/* JUMLAH */}
              <div className='space-y-2'>
                <Label htmlFor='quantity'>Jumlah Unit</Label>
                <Input
                  id='quantity'
                  name='quantity'
                  type='number'
                  placeholder='Contoh: 10'
                  className='h-12 bg-white border-muted-foreground/20 text-lg font-bold'
                  required
                />
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='notes'>Catatan (Opsional)</Label>
                <Input
                  id='notes'
                  name='notes'
                  placeholder='Misal: Restock dari gudang pusat'
                  className='bg-white border-muted-foreground/20'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex gap-4'>
          <Button
            type='button'
            variant='ghost'
            onClick={() => router.back()}
            className='flex-1 h-12'
          >
            Batal
          </Button>
          <Button
            type='submit'
            className='flex-1 h-12 text-lg shadow-lg'
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className='animate-spin h-5 w-5 mr-2' />
            ) : (
              "Simpan Transaksi"
            )}
          </Button>
        </div>
      </form>

      {/* PORTAL SCANNER */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
      />
    </>
  );
}
