"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "@/components/products/barcode-scanner";
import { ScanBarcode, PackagePlus, Info, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function NewProductPage() {
  const [barcode, setBarcode] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Handler saat scan berhasil
  const handleScanSuccess = (code: string) => {
    setBarcode(code);
    setIsScannerOpen(false);
    // Tips: Di sini kita bisa tambahkan suara 'beep' nanti
  };

  return (
    <div className='max-w-3xl mx-auto space-y-6'>
      {/* Breadcrumb / Back Button */}
      <Link
        href='/dashboard/products'
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit'
      >
        <ArrowLeft className='h-4 w-4' /> Kembali ke Daftar Produk
      </Link>

      <div className='space-y-1'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Tambah Produk Baru
        </h1>
        <p className='text-muted-foreground'>
          Lengkapi data di bawah untuk mendaftarkan barang ke sistem.
        </p>
      </div>

      <Card className='border-none shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <PackagePlus className='h-5 w-5 text-primary' /> Informasi Utama
          </CardTitle>
          <CardDescription>
            Pastikan barcode atau SKU produk unik dan tidak duplikat.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* SEKSI BARCODE - FITUR SCANNER */}
          <div className='p-4 bg-muted/30 rounded-xl border border-dashed border-primary/20 space-y-4'>
            <div className='flex items-center justify-between'>
              <label className='text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2'>
                <ScanBarcode className='h-4 w-4' /> Barcode / SKU
              </label>
            </div>

            <div className='flex gap-3'>
              <div className='relative flex-1'>
                <Input
                  placeholder='Scan atau ketik barcode produk...'
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className='font-mono bg-white h-11 border-primary/20 focus-visible:ring-primary'
                />
              </div>
              <Button
                type='button'
                variant='default'
                onClick={() => setIsScannerOpen(true)}
                className='h-11 px-6 shadow-md hover:shadow-lg transition-all gap-2'
              >
                <ScanBarcode className='h-4 w-4' /> Scan Barang
              </Button>
            </div>

            <div className='flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg text-[11px] text-blue-700 leading-relaxed border border-blue-100'>
              <Info className='h-3.5 w-3.5 mt-0.5 shrink-0' />
              <p>
                Gunakan scanner untuk mengambil kode dari kemasan produk secara
                otomatis. Jika produk tidak memiliki barcode, Anda bisa mengetik
                SKU manual (Contoh: BRG-001).
              </p>
            </div>
          </div>

          {/* Form lainnya (Nama, Harga, Stok Awal) bisa diletakkan di bawah sini */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Nama Produk</label>
              <Input placeholder='Contoh: Kopi Arabika 250gr' />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Harga Satuan</label>
              <Input type='number' placeholder='0' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Komponen Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
      />
    </div>
  );
}
