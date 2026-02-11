"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupplier } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, User, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

export function SupplierForm() {
  const [state, formAction, isPending] = useActionState(createSupplier, {
    success: false,
    message: null,
    errors: {},
  });
  const router = useRouter();

  // Effect: Handle Toast & Redirect
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      const timer = setTimeout(() => {
        router.push("/dashboard/suppliers");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className='space-y-8'>
      <div className='grid gap-6 md:grid-cols-2'>
        {/* KARTU 1: Informasi Perusahaan */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Building2 className='h-5 w-5 text-primary' />
              Informasi Perusahaan
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>
                Nama Perusahaan <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='name'
                name='name'
                placeholder='Contoh: PT. Sumber Makmur Jaya'
                required
              />
              {state.errors?.name && (
                <p className='text-destructive text-xs font-medium'>
                  {state.errors.name}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address' className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-muted-foreground' /> Alamat
                Lengkap
              </Label>
              <Textarea
                id='address'
                name='address'
                placeholder='Jl. Kawasan Industri No. 123, Jakarta...'
                className='min-h-[120px] resize-none'
              />
            </div>
          </CardContent>
        </Card>

        {/* KARTU 2: Kontak Person */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <User className='h-5 w-5 text-primary' />
              Kontak & Detail
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='contact_person'>Contact Person (PIC)</Label>
              <Input
                id='contact_person'
                name='contact_person'
                placeholder='Contoh: Bpk. Budi Santoso'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phone' className='flex items-center gap-2'>
                <Phone className='h-4 w-4 text-muted-foreground' /> Nomor
                Telepon
              </Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                placeholder='0812xxxxxxx'
              />
              {state.errors?.phone && (
                <p className='text-destructive text-xs font-medium'>
                  {state.errors.phone}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email' className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-muted-foreground' /> Email Resmi
              </Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='sales@supplier-resmi.com'
              />
              {state.errors?.email && (
                <p className='text-destructive text-xs font-medium'>
                  {state.errors.email}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className='flex items-center justify-end gap-4 pt-4 border-t'>
        <Button
          variant='outline'
          type='button'
          onClick={() => router.back()}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type='submit' className='min-w-[140px]' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Menyimpan...
            </>
          ) : (
            "Simpan Supplier"
          )}
        </Button>
      </div>
    </form>
  );
}
