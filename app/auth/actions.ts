"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();

  // 1. Perintahkan Supabase untuk mengakhiri sesi
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Gagal logout:", error.message);
  }

  // 2. Redirect paksa ke halaman login
  redirect("/login");
}
