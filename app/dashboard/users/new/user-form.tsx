"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "../actions";
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
import { Loader2, UserPlus, Shield, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

export function UserForm() {
  const [state, formAction, isPending] = useActionState(createUser, {
    success: false,
    message: null,
    errors: {},
  });
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      const timer = setTimeout(() => {
        router.push("/dashboard/users");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className='max-w-2xl mx-auto py-6'>
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserPlus className='h-5 w-5' /> Tambah Karyawan Baru
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <User className='h-4 w-4 text-muted-foreground' /> Nama Lengkap
              </Label>
              <Input name='full_name' placeholder='Contoh: John Doe' required />
              {state.errors?.full_name && (
                <p className='text-destructive text-xs'>
                  {state.errors.full_name}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-muted-foreground' /> Email Login
              </Label>
              <Input
                name='email'
                type='email'
                placeholder='karyawan@perusahaan.com'
                required
              />
              {state.errors?.email && (
                <p className='text-destructive text-xs'>{state.errors.email}</p>
              )}
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Lock className='h-4 w-4 text-muted-foreground' /> Password
                </Label>
                <Input
                  name='password'
                  type='password'
                  placeholder='Minimal 6 karakter'
                  required
                  minLength={6}
                />
                {state.errors?.password && (
                  <p className='text-destructive text-xs'>
                    {state.errors.password}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-muted-foreground' /> Role /
                  Jabatan
                </Label>
                <Select name='role' required defaultValue='staff'>
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih Role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='staff'>Staff (Gudang)</SelectItem>
                    <SelectItem value='manager'>Manager</SelectItem>
                    <SelectItem value='admin'>Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {state.errors?.role && (
                  <p className='text-destructive text-xs'>
                    {state.errors.role}
                  </p>
                )}
              </div>
            </div>

            <div className='pt-4 flex gap-3 justify-end'>
              <Button
                variant='outline'
                type='button'
                onClick={() => router.back()}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Membuat...
                  </>
                ) : (
                  "Buat Akun"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
