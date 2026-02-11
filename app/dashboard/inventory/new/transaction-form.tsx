"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  AlertCircle,
  Search,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Definisi Props
interface Product {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
}

interface TransactionFormProps {
  products: Product[];
}

export function TransactionForm({ products }: TransactionFormProps) {
  // --- STATE ---
  const [state, formAction, isPending] = useActionState(createTransaction, {
    success: false,
    message: null,
    errors: {},
  });

  const router = useRouter();

  // Form Inputs
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("IN");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number | "">("");

  // --- LOGIC ---
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const currentStock = selectedProduct?.current_stock || 0;
  const qtyNum = Number(quantity) || 0;

  // Proyeksi Stok
  const projectedStock =
    transactionType === "IN" ? currentStock + qtyNum : currentStock - qtyNum;

  // Validasi
  const isStockInsufficient = transactionType === "OUT" && projectedStock < 0;
  const isSubmitDisabled =
    isPending || !selectedProduct || qtyNum <= 0 || isStockInsufficient;

  // --- EFFECT ---
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      const timer = setTimeout(() => router.push("/dashboard/inventory"), 1000);
      return () => clearTimeout(timer);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  // --- RENDER ---
  return (
    <form action={formAction} className='w-full max-w-6xl mx-auto py-6'>
      <input type='hidden' name='type' value={transactionType} />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* === KOLOM KIRI: INPUT (2/3) === */}
        <div className='lg:col-span-2 flex flex-col gap-8'>
          {/* SECTION 1: TIPE TRANSAKSI */}
          <section className='space-y-4'>
            <Label className='text-base font-semibold'>Jenis Transaksi</Label>
            <div className='grid grid-cols-2 gap-4'>
              <TypeSelectionButton
                type='IN'
                currentType={transactionType}
                onClick={() => {
                  setTransactionType("IN");
                  setQuantity("");
                }}
                label='Barang Masuk'
                description='Stok Bertambah'
                icon={<ArrowDownToLine className='h-6 w-6' />}
                activeColor='border-emerald-500 bg-emerald-50 text-emerald-700'
              />
              <TypeSelectionButton
                type='OUT'
                currentType={transactionType}
                onClick={() => {
                  setTransactionType("OUT");
                  setQuantity("");
                }}
                label='Barang Keluar'
                description='Stok Berkurang'
                icon={<ArrowUpFromLine className='h-6 w-6' />}
                activeColor='border-rose-500 bg-rose-50 text-rose-700'
              />
            </div>
          </section>

          {/* SECTION 2: DETAIL BARANG */}
          <section className='space-y-4'>
            <Label className='text-base font-semibold'>Detail Barang</Label>
            <Card className='border shadow-sm'>
              <CardContent className='p-6 space-y-6'>
                {/* Select Product */}
                <div className='space-y-2'>
                  <Label className='text-sm text-muted-foreground'>
                    Pilih Produk
                  </Label>
                  <Select
                    name='product_id'
                    onValueChange={setSelectedProductId}
                    required
                  >
                    <SelectTrigger className='h-12 bg-background'>
                      <div className='flex items-center gap-3 text-muted-foreground w-full overflow-hidden'>
                        <Search className='h-4 w-4 shrink-0 opacity-50' />
                        <SelectValue placeholder='Cari produk...' />
                      </div>
                    </SelectTrigger>
                    <SelectContent className='max-h-[300px]'>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id} className='py-3'>
                          <span className='font-medium'>{p.name}</span>
                          <Badge
                            variant='outline'
                            className='ml-2 font-mono text-[10px] text-muted-foreground'
                          >
                            {p.sku}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state.errors?.product_id && (
                    <p className='text-destructive text-sm font-medium'>
                      {state.errors.product_id}
                    </p>
                  )}
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                  {/* Quantity */}
                  <div className='space-y-2'>
                    <Label className='text-sm text-muted-foreground'>
                      Jumlah Unit
                    </Label>
                    <div className='relative'>
                      <Input
                        name='quantity'
                        type='number'
                        min='1'
                        placeholder='0'
                        required
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className={cn(
                          "h-12 text-lg font-semibold pr-12",
                          isStockInsufficient &&
                            "border-destructive ring-destructive/20 bg-destructive/5",
                        )}
                      />
                      <span className='absolute right-3 top-3 text-xs font-bold text-muted-foreground'>
                        PCS
                      </span>
                    </div>
                    {isStockInsufficient && (
                      <div className='flex items-center gap-1.5 text-destructive text-xs font-medium mt-1.5 animate-in slide-in-from-top-1'>
                        <AlertCircle className='h-3.5 w-3.5' />
                        <span>Stok tidak cukup (Max: {currentStock})</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className='space-y-2'>
                    <Label className='text-sm text-muted-foreground'>
                      Catatan
                    </Label>
                    <Input
                      name='notes'
                      placeholder='Contoh: No. Invoice'
                      className='h-12'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ACTION BUTTONS (Desktop View: Muncul di bawah form kiri) */}
          <div className='hidden lg:flex items-center justify-end gap-4 pt-4 border-t'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => router.back()}
              disabled={isPending}
              className='h-12 px-6 text-muted-foreground hover:text-foreground'
            >
              Batalkan
            </Button>
            <Button
              type='submit'
              className={cn(
                "h-12 px-8 text-base font-semibold shadow-md transition-all min-w-[200px]",
                isSubmitDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : transactionType === "IN"
                    ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200"
                    : "bg-rose-600 hover:bg-rose-700 hover:shadow-rose-200",
              )}
              disabled={isSubmitDisabled}
            >
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' /> Memproses...
                </>
              ) : (
                <>
                  {transactionType === "IN"
                    ? "Simpan Barang Masuk"
                    : "Simpan Barang Keluar"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* === KOLOM KANAN: SUMMARY (Sticky 1/3) === */}
        <div className='lg:col-span-1'>
          <div className='sticky top-6'>
            <SummaryCard
              product={selectedProduct}
              type={transactionType}
              currentStock={currentStock}
              quantity={qtyNum}
              projectedStock={projectedStock}
              isInsufficient={isStockInsufficient}
              isDisabled={isSubmitDisabled}
              isPending={isPending}
              onCancel={() => router.back()}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

// --- SUB COMPONENTS ---

function TypeSelectionButton({
  type,
  currentType,
  onClick,
  label,
  description,
  icon,
  activeColor,
}: any) {
  const isActive = currentType === type;
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 h-28 rounded-xl border-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isActive
          ? activeColor
          : "border-border bg-card hover:bg-accent/50 text-muted-foreground hover:border-muted-foreground/30",
      )}
    >
      <div
        className={cn(
          "p-2 rounded-full mb-2 transition-colors",
          isActive ? "bg-background/20" : "bg-muted",
        )}
      >
        {icon}
      </div>
      <span className='font-semibold text-sm'>{label}</span>
      <span className='text-xs opacity-70 font-medium'>{description}</span>
      {isActive && (
        <div className='absolute top-3 right-3 opacity-30'>
          <CheckCircle2 className='h-5 w-5' />
        </div>
      )}
    </button>
  );
}

function SummaryCard({
  product,
  type,
  currentStock,
  quantity,
  projectedStock,
  isInsufficient,
  isDisabled,
  isPending,
  onCancel,
}: any) {
  const isIncoming = type === "IN";
  const themeColor = isIncoming ? "text-emerald-600" : "text-rose-600";
  const themeBg = isIncoming
    ? "bg-emerald-600 hover:bg-emerald-700"
    : "bg-rose-600 hover:bg-rose-700";

  return (
    <Card
      className={cn(
        "shadow-sm overflow-hidden transition-all",
        !product && "bg-muted/30 border-dashed",
      )}
    >
      <CardHeader className='pb-3 border-b bg-muted/10'>
        <CardTitle className='text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
          <Package className='h-4 w-4' /> Simulasi Stok
        </CardTitle>
      </CardHeader>

      <CardContent className='pt-6 space-y-6'>
        {!product ? (
          <div className='py-8 text-center text-muted-foreground text-sm px-4'>
            Pilih produk di form sebelah kiri untuk melihat simulasi.
          </div>
        ) : (
          <>
            <div>
              <h3 className='font-bold text-lg leading-tight'>
                {product.name}
              </h3>
              <Badge
                variant='outline'
                className='mt-2 font-mono text-xs text-muted-foreground'
              >
                {product.sku}
              </Badge>
            </div>

            <div className='space-y-3 text-sm'>
              <div className='flex justify-between items-center p-2 rounded-md bg-muted/30'>
                <span className='text-muted-foreground'>Stok Awal</span>
                <span className='font-mono text-base'>{currentStock}</span>
              </div>

              <div className='flex justify-between items-center p-2 rounded-md bg-muted/30'>
                <span
                  className={cn(
                    "font-bold flex items-center gap-1.5",
                    themeColor,
                  )}
                >
                  {isIncoming ? (
                    <ArrowDownToLine className='h-4 w-4' />
                  ) : (
                    <ArrowUpFromLine className='h-4 w-4' />
                  )}
                  {isIncoming ? "Akan Masuk" : "Akan Keluar"}
                </span>
                <span className='font-mono text-base font-bold'>
                  {quantity > 0 ? quantity : 0}
                </span>
              </div>
            </div>

            <Separator />

            <div className='flex justify-between items-end'>
              <span className='text-sm font-semibold text-foreground/80'>
                Estimasi Akhir
              </span>
              <span
                className={cn(
                  "text-2xl font-bold font-mono tracking-tight",
                  isInsufficient ? "text-destructive" : "text-foreground",
                )}
              >
                {projectedStock}
              </span>
            </div>
          </>
        )}

        {/* Action Buttons (Mobile Only) */}
        {/* 'lg:hidden' artinya tombol ini HILANG di layar besar, karena sudah ada tombol desktop di kolom kiri */}
        <div className='pt-2 space-y-3 lg:hidden'>
          <Button
            type='submit'
            className={cn(
              "w-full h-12 text-base font-bold shadow-sm",
              isDisabled ? "opacity-50" : themeBg,
            )}
            disabled={isDisabled}
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Memproses...
              </>
            ) : (
              "Konfirmasi"
            )}
          </Button>
          <Button
            variant='outline'
            type='button'
            onClick={onCancel}
            className='w-full h-12'
          >
            Batalkan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
