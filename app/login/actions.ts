"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// Definisi tipe state untuk useActionState
// Kita bisa mengembangkan ini untuk validasi field-specific (Zod) nanti
export type LoginState = {
  message?: string | null;
  errors?: {
    email?: string[];
    password?: string[];
    fullName?: string[];
  };
};

// ==========================================
// 1. LOGIN / SIGN IN
// ==========================================
export async function login(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validasi sederhana
  if (!email || !password) {
    return { message: "Email dan password wajib diisi." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Kembalikan pesan error tanpa redirect agar user bisa mencoba lagi
    return { message: error.message };
  }

  // Jika sukses, refresh cache layout dan redirect
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ==========================================
// 2. REGISTER / SIGN UP
// ==========================================
export async function signup(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const origin = (await headers()).get("origin");

  // Validasi input
  if (!email || !password || !fullName) {
    return { message: "Semua field (Nama, Email, Password) wajib diisi." };
  }

  if (password.length < 6) {
    return { message: "Password harus minimal 6 karakter." };
  }

  // Proses Sign Up
  // PENTING: options.data.full_name dikirim agar Trigger Database 'handle_new_user'
  // bisa otomatis mengisi tabel 'public.profiles'.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { message: error.message };
  }

  // Berhasil mendaftar
  return {
    message:
      "Registrasi berhasil! Silakan cek email Anda untuk memverifikasi akun sebelum login.",
  };
}

// ==========================================
// 3. LOGOUT / SIGN OUT
// ==========================================
// Logout biasanya tidak butuh state, jadi bisa function biasa
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}

// ==========================================
// 4. FORGOT PASSWORD (REQUEST LINK)
// ==========================================
export async function forgotPassword(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const origin = (await headers()).get("origin");

  if (!email) {
    return { message: "Email wajib diisi." };
  }

  // Mengirim email reset password.
  // 'redirectTo' akan mengarahkan user ke route handler auth/callback,
  // yang kemudian menukar token dan me-redirect ke halaman /reset-password.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    // Demi keamanan, terkadang kita tidak ingin memberi tahu jika email tidak terdaftar.
    // Tapi untuk UX admin internal, menampilkan error message asli Supabase tidak apa-apa.
    return { message: error.message };
  }

  return {
    message:
      "Link reset password telah dikirim ke email Anda (jika terdaftar).",
  };
}

// ==========================================
// 5. UPDATE PASSWORD (CONFIRM RESET)
// ==========================================
export async function updatePassword(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { message: "Password wajib diisi." };
  }

  if (password !== confirmPassword) {
    return { message: "Password dan konfirmasi tidak cocok." };
  }

  if (password.length < 6) {
    return { message: "Password harus minimal 6 karakter." };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { message: error.message };
  }

  // Sukses update password, redirect ke dashboard
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
