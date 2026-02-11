"use client";

import { useActionState, useEffect } from "react";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export function ProfileForm({ initialData }: { initialData: any }) {
  const [state, formAction, isPending] = useActionState(updateProfile, {
    success: false,
    message: null,
  });

  useEffect(() => {
    if (state.success) toast.success(state.message);
    else if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='full_name'>Nama Lengkap</Label>
        <Input
          id='full_name'
          name='full_name'
          defaultValue={initialData?.full_name}
          required
        />
      </div>
      <Button type='submit' disabled={isPending} className='gap-2'>
        {isPending ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <Save className='h-4 w-4' />
        )}
        Simpan Perubahan
      </Button>
    </form>
  );
}
