"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({
  onScan,
  isOpen,
  onClose,
}: BarcodeScannerProps) {
  // Gunakan Ref untuk melacak instance scanner agar tidak terduplikasi
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Hanya jalankan jika modal terbuka
    if (!isOpen) return;

    // Tambahkan sedikit delay agar Dialog selesai rendering/animasi
    const timer = setTimeout(() => {
      const element = document.getElementById("reader");
      if (!element) return;

      // Inisialisasi scanner
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true, // Fitur senter untuk gudang gelap
        },
        false,
      );

      scannerRef.current.render(
        (decodedText) => {
          onScan(decodedText);
          // Berhenti dan tutup setelah sukses
          if (scannerRef.current) {
            scannerRef.current
              .clear()
              .then(() => {
                onClose();
              })
              .catch((err) => console.error(err));
          }
        },
        (error) => {
          // Abaikan error scanning frame-by-frame
        },
      );
    }, 300); // Delay 300ms cukup untuk animasi Dialog shadcn

    // Cleanup saat komponen unmount atau modal tertutup
    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          // Abaikan error jika sudah tertutup
        });
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScan, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Camera className='h-5 w-5' /> Barcode Scanner
          </DialogTitle>
        </DialogHeader>

        {/* Kontainer scanner */}
        <div className='relative w-full aspect-square bg-muted rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden'>
          <div id='reader' className='w-full h-full'></div>

          {/* Panduan Visual */}
          <div className='absolute inset-0 border-[40px] border-black/40 pointer-events-none'>
            <div className='w-full h-full border-2 border-primary/50 relative'>
              {/* Garis pemindai merah (opsional untuk estetika) */}
              <div className='absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse' />
            </div>
          </div>
        </div>

        <p className='text-[10px] text-center text-muted-foreground italic'>
          Arahkan barcode tepat ke dalam kotak di atas.
        </p>
      </DialogContent>
    </Dialog>
  );
}
