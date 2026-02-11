"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/schemas";

export type State = {
  success: boolean;
  message: string | null;
  errors?: {
    [key: string]: string[];
  };
};

export async function createTransaction(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();

  // 1. Ambil User ID (Untuk audit trail)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  // 2. Validasi Input
  const validatedFields = transactionSchema.safeParse({
    product_id: formData.get("product_id"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { product_id, type, quantity, notes } = validatedFields.data;

  // 3. Panggil RPC Database (Proses Atomik)
  const { data, error } = await supabase.rpc("create_inventory_transaction", {
    p_product_id: product_id,
    p_type: type,
    p_quantity: quantity,
    p_notes: notes || "",
    p_user_id: user.id,
  });

  if (error) {
    // Tangkap error custom dari database (misal: stok kurang)
    return { success: false, message: error.message };
  }

  // 4. Sukses
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/products"); // Refresh juga halaman produk agar stok update
  revalidatePath("/dashboard"); // Refresh dashboard utama

  return {
    success: true,
    message: `Berhasil! Stok ${type === "IN" ? "bertambah" : "berkurang"}.`,
  };
}
