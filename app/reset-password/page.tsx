"use client";

import { useActionState } from "react";
import { updatePassword, LoginState } from "@/app/login/actions";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: LoginState = { message: null };

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Set Password Baru</CardTitle>
          <CardDescription>
            Silakan masukkan password baru Anda.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className='space-y-4'>
            {state.message && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <div className='space-y-2'>
              <Label htmlFor='password'>Password Baru</Label>
              <Input id='password' name='password' type='password' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Konfirmasi Password</Label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className='w-full' type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Ubah Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
