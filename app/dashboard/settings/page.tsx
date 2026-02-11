// JANGAN gunakan "use client" di sini
import { createClient } from "@/utils/supabase/server";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, ShieldCheck, Mail, Fingerprint } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Mengambil user auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Mengambil data profil dari tabel public.profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  return (
    <div className='max-w-4xl space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Kelola profil pribadi dan keamanan akun Anda.
        </p>
      </div>

      <Tabs defaultValue='profile' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 mb-8 max-w-md'>
          <TabsTrigger value='profile' className='gap-2'>
            <User className='h-4 w-4' /> Profil
          </TabsTrigger>
          <TabsTrigger value='security' className='gap-2'>
            <ShieldCheck className='h-4 w-4' /> Keamanan
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFIL */}
        <TabsContent value='profile' className='space-y-6'>
          <Card className='border-none shadow-sm'>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Perbarui nama yang akan dilihat oleh rekan kerja Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Email (Read Only - Informasi Saja) */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1.5'>
                  <Mail className='h-4 w-4' />
                  <span>Alamat Email</span>
                </div>
                <div className='p-3 bg-muted/50 rounded-md text-sm font-medium border border-border'>
                  {profile?.email}
                </div>
              </div>

              {/* Form Nama (Client Component) */}
              <ProfileForm initialData={profile} />
            </CardContent>
          </Card>

          <Card className='border-emerald-100 bg-emerald-50/20 shadow-none'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3 text-emerald-800'>
                <Fingerprint className='h-5 w-5' />
                <div className='text-sm'>
                  <p className='font-bold'>
                    Role Anda: {profile?.role?.toUpperCase()}
                  </p>
                  <p className='opacity-80 italic text-xs'>
                    Akses fitur Anda dibatasi berdasarkan peran ini.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: KEAMANAN */}
        <TabsContent value='security'>
          <Card className='border-none shadow-sm'>
            <CardHeader>
              <CardTitle>Ganti Kata Sandi</CardTitle>
              <CardDescription>
                Gunakan password yang kuat untuk menjaga akun Anda tetap aman.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Form Password (Client Component) */}
              <PasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
