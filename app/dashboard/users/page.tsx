import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCog, ShieldAlert, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Memaksa Next.js untuk selalu mengambil data terbaru (mencegah caching data user baru)
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = await createClient();

  // 1. Ambil data sesi User saat ini
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Ambil profil user yang sedang login untuk cek Role (Security UI)
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const isAdmin = currentUserProfile?.role === "admin";

  // 3. Ambil semua data profil dari database
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className='space-y-6'>
      {/* HEADER SECTION */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Manajemen Pengguna
          </h1>
          <p className='text-muted-foreground'>
            Kelola hak akses dan daftar karyawan di sistem.
          </p>
        </div>

        {/* Tombol Tambah hanya tampil untuk Admin */}
        {isAdmin && (
          <Link href='/dashboard/users/new'>
            <Button className='shadow-md'>
              <PlusCircle className='mr-2 h-4 w-4' /> Tambah User Baru
            </Button>
          </Link>
        )}
      </div>

      {/* MAIN TABLE SECTION */}
      <Card className='border-none shadow-sm'>
        <CardHeader className='bg-muted/10 pb-4'>
          <CardTitle className='flex items-center gap-2 text-base font-semibold'>
            <UserCog className='h-5 w-5 text-primary' /> Daftar Akun Terdaftar
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0 sm:p-6'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-muted/30'>
                <TableRow>
                  <TableHead className='w-[300px]'>Nama Lengkap</TableHead>
                  <TableHead>Informasi Kontak</TableHead>
                  <TableHead>Peran (Role)</TableHead>
                  <TableHead>Tanggal Bergabung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles && profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <TableRow
                      key={profile.id}
                      className='hover:bg-muted/5 transition-colors'
                    >
                      {/* Kolom Nama & Avatar */}
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0'>
                            {profile.full_name?.substring(0, 2).toUpperCase() ||
                              "UN"}
                          </div>
                          <div className='flex flex-col'>
                            <span className='font-semibold text-sm'>
                              {profile.full_name || "Tanpa Nama"}
                            </span>
                            {user?.id === profile.id && (
                              <span className='text-[10px] text-emerald-600 font-bold uppercase tracking-tighter'>
                                Sesi Anda Aktif
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Kolom Email */}
                      <TableCell>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Mail className='h-3.5 w-3.5' />
                          {profile.email}
                        </div>
                      </TableCell>

                      {/* Kolom Role */}
                      <TableCell>
                        <Badge
                          className='capitalize font-medium shadow-none px-2.5 py-0.5'
                          variant={
                            profile.role === "admin"
                              ? "default"
                              : profile.role === "manager"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {profile.role || "staff"}
                        </Badge>
                      </TableCell>

                      {/* Kolom Tanggal */}
                      <TableCell>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Calendar className='h-3.5 w-3.5' />
                          {new Date(profile.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='h-32 text-center text-muted-foreground'
                    >
                      {error
                        ? `Gagal memuat data: ${error.message}`
                        : "Tidak ada data pengguna ditemukan."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Aler jika bukan Admin */}
          {!isAdmin && (
            <div className='m-4 p-4 bg-amber-50 text-amber-800 rounded-lg flex items-start gap-3 text-sm border border-amber-200 shadow-sm'>
              <ShieldAlert className='h-5 w-5 shrink-0 mt-0.5' />
              <div>
                <p className='font-bold'>Akses Terbatas</p>
                <p className='opacity-90'>
                  Anda tidak memiliki izin untuk mengedit atau menambahkan
                  pengguna. Hubungi Administrator untuk perubahan akses.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
