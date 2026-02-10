"use client";

import { useActionState } from "react";
import { signup, LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

const initialState: LoginState = { message: null, errors: {} };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Daftar Akun Baru</CardTitle>
          <CardDescription>
            Buat akun untuk mengakses sistem inventaris.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className='space-y-4'>
            {state.message && (
              <Alert
                variant={
                  state.message.includes("berhasil") ? "default" : "destructive"
                }
              >
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className='space-y-2'>
              <Label htmlFor='fullName'>Nama Lengkap</Label>
              <Input
                id='fullName'
                name='fullName'
                placeholder='John Doe'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='john@example.com'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' name='password' type='password' required />
            </div>
          </CardContent>
          <CardFooter className='flex flex-col gap-4'>
            <Button className='w-full' type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Daftar Sekarang
            </Button>
            <div className='text-sm text-center'>
              Sudah punya akun?{" "}
              <Link href='/login' className='text-primary hover:underline'>
                Login disini
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
