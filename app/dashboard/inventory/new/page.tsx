"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { BarcodeScanner } from "@/components/products/barcode-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScanBarcode, Package, ArrowRightLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewTransactionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Form States
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [type, setType] = useState("OUT"); // Default barang keluar
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  // Ambil daftar produk untuk fallback manual
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, barcode, current_stock");
      setProducts(data || []);
    };
    fetchProducts();
  }, [supabase]);

  // LOGIKA UTAMA: Handle Hasil Scan
  const handleScanResult = async (decodedBarcode: string) => {
    const product = products.find((p) => p.barcode === decodedBarcode);

    if (product) {
      setSelectedProductId(product.id);
      toast.success(`Produk ditemukan: ${product.name}`);
      // Memberikan efek getar jika di HP
      if (navigator.vibrate) navigator.vibrate(200);
    } else {
      toast.error("Barcode tidak terdaftar di sistem!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) return toast.error("Lengkapi data!");

    setLoading(true);
    // Panggil RPC atau logic update stok yang sudah kita buat sebelumnya
    const { error } = await supabase.from("inventory_transactions").insert({
      product_id: selectedProductId,
      type,
      quantity: parseInt(quantity),
      notes,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Transaksi berhasil dicatat!");
      router.push("/dashboard/inventory");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 bg-primary/10 rounded-lg'>
          <ArrowRightLeft className='h-6 w-6 text-primary' />
        </div>
        <h1 className='text-2xl font-bold'>Transaksi Inventaris</h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <Card className='border-none shadow-sm'>
          <CardContent className='pt-6 space-y-4'>
            {/* BUTTON SCANNER */}
            <Button
              type='button'
              variant='outline'
              className='w-full h-16 border-dashed border-2 flex flex-col gap-1 hover:bg-primary/5 hover:border-primary/50 transition-all'
              onClick={() => setIsScannerOpen(true)}
            >
              <ScanBarcode className='h-6 w-6 text-primary' />
              <span className='text-xs font-bold uppercase tracking-widest'>
                Klik untuk Scan Barang
              </span>
            </Button>

            <div className='grid grid-cols-2 gap-4'>
              {/* PILIHAN PRODUK (Bisa via scan atau manual) */}
              <div className='col-span-2 space-y-2'>
                <label className='text-sm font-medium'>Pilih Produk</label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger className='h-11'>
                    <SelectValue placeholder='Pilih atau Scan Barang...' />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (Stok: {p.current_stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TIPE TRANSAKSI */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Jenis Transaksi</label>
                <div className='flex border rounded-md p-1 bg-muted/50'>
                  <button
                    type='button'
                    onClick={() => setType("IN")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${type === "IN" ? "bg-white shadow-sm text-emerald-600" : "text-muted-foreground"}`}
                  >
                    MASUK
                  </button>
                  <button
                    type='button'
                    onClick={() => setType("OUT")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${type === "OUT" ? "bg-white shadow-sm text-rose-600" : "text-muted-foreground"}`}
                  >
                    KELUAR
                  </button>
                </div>
              </div>

              {/* JUMLAH */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Jumlah (Qty)</label>
                <Input
                  type='number'
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder='0'
                  className='h-11'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Catatan (Opsional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Misal: Restock bulanan atau Pengiriman ke Toko A'
              />
            </div>
          </CardContent>
        </Card>

        <div className='flex gap-3'>
          <Button
            type='button'
            variant='ghost'
            onClick={() => router.back()}
            className='flex-1'
          >
            Batal
          </Button>
          <Button type='submit' className='flex-1' disabled={loading}>
            {loading ? (
              <Loader2 className='animate-spin h-4 w-4 mr-2' />
            ) : (
              "Simpan Transaksi"
            )}
          </Button>
        </div>
      </form>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanResult}
      />
    </div>
  );
}
