"use server";

import { createClient } from "@supabase/supabase-js"; // Gunakan client standar JS untuk admin access
import { createClient as createServerClient } from "@/utils/supabase/server"; // Client standar untuk cek session
import { revalidatePath } from "next/cache";
import { userRegisterSchema } from "@/lib/schemas";

export type State = {
  success: boolean;
  message: string | null;
  errors?: {
    [key: string]: string[];
  };
};

export async function createUser(
  prevState: State,
  formData: FormData,
): Promise<State> {
  // 1. Cek apakah yang request adalah Admin (Security Check)
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentUserProfile?.role !== "admin") {
    return { success: false, message: "Hanya Admin yang boleh menambah user." };
  }

  // 2. Validasi Input
  const validatedFields = userRegisterSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, full_name, role } = validatedFields.data;

  // 3. Inisialisasi Supabase Admin Client (Bypass Auth)
  // Kita butuh ini agar saat create user baru, sesi admin yang sedang login TIDAK terputus.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  // 4. Create User di Auth Supabase
  const { data: newUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Langsung confirm email agar bisa login
      user_metadata: { full_name: full_name },
    });

  if (authError) {
    return {
      success: false,
      message: "Gagal membuat akun: " + authError.message,
    };
  }

  if (newUser.user) {
    // 5. Update Role di tabel Profiles
    // Trigger "handle_new_user" di database mungkin sudah membuat profile,
    // tapi kita perlu memaksa update ROLE-nya (karena defaultnya mungkin 'staff')

    // Kita tunggu sebentar atau langsung update/upsert
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role: role, full_name: full_name })
      .eq("id", newUser.user.id);

    if (profileError) {
      // Fallback jika trigger belum jalan, kita insert manual
      await supabaseAdmin.from("profiles").upsert({
        id: newUser.user.id,
        full_name: full_name,
        role: role,
        email: email,
      });
    }
  }

  revalidatePath("/dashboard/users");
  return { success: true, message: "User baru berhasil ditambahkan!" };
}
