"use client";

import { useActionState, useEffect, useRef } from "react";
import { updatePassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, {
    success: false,
    message: null,
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} ref={formRef} className='space-y-6 max-w-md'>
      <div className='space-y-2'>
        <Label htmlFor='password'>Password Baru</Label>
        <Input id='password' name='password' type='password' required />
        {state.errors?.password && (
          <p className='text-destructive text-xs'>{state.errors.password}</p>
        )}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='confirmPassword'>Konfirmasi Password</Label>
        <Input
          id='confirmPassword'
          name='confirmPassword'
          type='password'
          required
        />
        {state.errors?.confirmPassword && (
          <p className='text-destructive text-xs'>
            {state.errors.confirmPassword}
          </p>
        )}
      </div>
      <Button
        type='submit'
        disabled={isPending}
        variant='destructive'
        className='gap-2'
      >
        {isPending ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <KeyRound className='h-4 w-4' />
        )}
        Update Password
      </Button>
    </form>
  );
}
