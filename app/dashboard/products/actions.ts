"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/schemas";

export type State = {
  success: boolean;
  message: string | null;
  errors?: {
    [key: string]: string[];
  };
};

export async function createProduct(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();

  // 1. Validasi Input (Sekarang termasuk supplier_id)
  const validatedFields = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    category_id: formData.get("category_id"),
    supplier_id: formData.get("supplier_id"), // <--- Ambil data supplier
    description: formData.get("description"),
    price: formData.get("price"),
    current_stock: formData.get("current_stock"),
    min_stock_level: formData.get("min_stock_level"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Gagal validasi data. Mohon periksa input Anda.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Logic Upload Gambar (TETAP SAMA SEPERTI SEBELUMNYA)
  let imageUrl = null;
  const imageFile = formData.get("image") as File;

  if (imageFile && imageFile.size > 0) {
    if (!imageFile.type.startsWith("image/")) {
      return { success: false, message: "File harus berupa gambar (JPG/PNG)." };
    }
    if (imageFile.size > 2 * 1024 * 1024) {
      return { success: false, message: "Ukuran gambar maksimal 2MB." };
    }
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);
    if (uploadError)
      return {
        success: false,
        message: "Gagal upload: " + uploadError.message,
      };
    const { data } = supabase.storage.from("products").getPublicUrl(fileName);
    imageUrl = data.publicUrl;
  }

  // 3. Insert ke Database
  // Handle empty string supplier_id menjadi null agar database tidak error uuid invalid
  const supplierIdValue =
    validatedFields.data.supplier_id === ""
      ? null
      : validatedFields.data.supplier_id;

  const { error: dbError } = await supabase.from("products").insert({
    name: validatedFields.data.name,
    sku: validatedFields.data.sku,
    category_id: validatedFields.data.category_id,
    supplier_id: supplierIdValue, // <--- Simpan ke DB
    description: validatedFields.data.description,
    price: validatedFields.data.price,
    current_stock: validatedFields.data.current_stock,
    min_stock_level: validatedFields.data.min_stock_level,
    image_url: imageUrl,
  });

  if (dbError) {
    if (dbError.code === "23505") {
      return {
        success: false,
        message: "SKU produk sudah terdaftar. Gunakan SKU lain.",
        errors: { sku: ["SKU ini sudah digunakan."] },
      };
    }
    return { success: false, message: "Database Error: " + dbError.message };
  }

  revalidatePath("/dashboard/products");
  return { success: true, message: "Produk berhasil ditambahkan!" };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.message);
  }
  revalidatePath("/dashboard/products");
}
