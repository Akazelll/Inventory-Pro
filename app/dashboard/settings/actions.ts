"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { profileSchema, passwordSchema } from "@/lib/schemas";

export type State = {
  success: boolean;
  message: string | null;
  errors?: { [key: string]: string[] };
};

// 1. Action Update Profil (Nama)
export async function updateProfile(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { success: false, message: "Sesi berakhir, silakan login kembali." };

  const validatedFields = profileSchema.safeParse({
    full_name: formData.get("full_name"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: validatedFields.data.full_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true, message: "Profil berhasil diperbarui!" };
}

// 2. Action Update Password
export async function updatePassword(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();

  const validatedFields = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: validatedFields.data.password,
  });

  if (error)
    return {
      success: false,
      message: "Gagal memperbarui password: " + error.message,
    };

  return { success: true, message: "Password berhasil diganti!" };
}
