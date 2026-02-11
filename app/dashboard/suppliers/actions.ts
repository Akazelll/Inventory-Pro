"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { supplierSchema } from "@/lib/schemas";

export type State = {
  success: boolean;
  message: string | null;
  errors?: {
    [key: string]: string[];
  };
};

export async function createSupplier(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();

  // 1. Validasi
  const validatedFields = supplierSchema.safeParse({
    name: formData.get("name"),
    contact_person: formData.get("contact_person"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validasi gagal. Cek inputan Anda.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Insert DB
  const { error } = await supabase
    .from("suppliers")
    .insert(validatedFields.data);

  if (error) {
    return { success: false, message: "Gagal menyimpan: " + error.message };
  }

  revalidatePath("/dashboard/suppliers");
  return { success: true, message: "Supplier berhasil ditambahkan!" };
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/suppliers");
}
