"use client";

import { useActionState } from "react";
import { forgotPassword, LoginState } from "@/app/login/actions";
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
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

const initialState: LoginState = { message: null };

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    forgotPassword,
    initialState,
  );

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <Link
            href='/login'
            className='flex items-center text-sm text-muted-foreground hover:text-primary mb-2'
          >
            <ArrowLeft className='mr-2 h-4 w-4' /> Kembali ke Login
          </Link>
          <CardTitle>Lupa Password?</CardTitle>
          <CardDescription>
            Masukkan email Anda, kami akan mengirimkan link reset.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className='space-y-4'>
            {state.message && (
              <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' name='email' type='email' required />
            </div>
          </CardContent>
          <CardFooter>
            <Button className='w-full' type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Kirim Link Reset
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
