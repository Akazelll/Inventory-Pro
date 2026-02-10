"use client";

import { useActionState } from "react";
import { login, LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2, Package2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

const initialState: LoginState = {
  message: null,
  errors: {},
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      {/* KIRI: Branding & Testimonial */}
      <div className='hidden lg:flex flex-col bg-slate-900 text-white p-10 justify-between'>
        <div className='flex items-center gap-2 text-lg font-bold'>
          <Package2 className='h-6 w-6' />
          <span>InventoryPro</span>
        </div>

        <div className='space-y-4'>
          <blockquote className='text-lg'>
            "Sistem manajemen inventaris ini telah mengubah cara kami mengelola
            stok gudang. Akurat, cepat, dan sangat mudah digunakan."
          </blockquote>
          <div className='text-sm text-slate-400'>
            &mdash; Tim Operasional Gudang
          </div>
        </div>
      </div>

      {/* KANAN: Form Login */}
      <div className='flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950'>
        <div className='w-full max-w-md space-y-6'>
          <div className='flex flex-col space-y-2 text-center lg:text-left'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Selamat Datang Kembali
            </h1>
            <p className='text-sm text-muted-foreground'>
              Masukkan email dan password Anda untuk masuk.
            </p>
          </div>

          <Card className='border-0 shadow-none lg:border lg:shadow-sm bg-transparent lg:bg-card'>
            <form action={formAction}>
              <CardContent className='space-y-4 pt-6'>
                {/* Alert jika ada error */}
                {state.message && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Gagal Login</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                  </Alert>
                )}

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='nama@perusahaan.com'
                    required
                    className='h-11'
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='password'>Password</Label>
                    <Link
                      href='/forgot-password'
                      className='text-sm font-medium text-primary hover:underline'
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    placeholder='••••••••'
                    required
                    className='h-11'
                  />
                </div>
              </CardContent>

              <CardFooter className='flex flex-col gap-4'>
                <Button
                  className='w-full h-11'
                  type='submit'
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Memproses...
                    </>
                  ) : (
                    "Masuk ke Dashboard"
                  )}
                </Button>

                {/* Link ke Register */}
                <div className='text-center text-sm'>
                  Belum punya akun?{" "}
                  <Link
                    href='/register'
                    className='font-medium underline underline-offset-4 hover:text-primary'
                  >
                    Daftar sekarang
                  </Link>
                </div>

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t' />
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-background px-2 text-muted-foreground'>
                      Info Legal
                    </span>
                  </div>
                </div>

                <p className='text-xs text-center text-muted-foreground px-8'>
                  Dengan masuk, Anda setuju dengan{" "}
                  <Link
                    href='#'
                    className='underline underline-offset-4 hover:text-primary'
                  >
                    Syarat & Ketentuan
                  </Link>{" "}
                  serta{" "}
                  <Link
                    href='#'
                    className='underline underline-offset-4 hover:text-primary'
                  >
                    Kebijakan Privasi
                  </Link>{" "}
                  kami.
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
