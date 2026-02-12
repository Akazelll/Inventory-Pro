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

  // 0. Persiapan Data (Sanitize input kosong menjadi null/undefined)
  const rawBarcode = formData.get("barcode") as string;
  const barcodeToSave = rawBarcode?.trim() === "" ? null : rawBarcode?.trim();

  const rawSupplierId = formData.get("supplier_id") as string;
  const supplierIdToSave =
    rawSupplierId === "" || rawSupplierId === "empty" ? null : rawSupplierId;

  // 1. Validasi Input menggunakan Zod
  const validatedFields = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    barcode: barcodeToSave, // Masukkan barcode ke validasi
    category_id: formData.get("category_id"),
    supplier_id: supplierIdToSave,
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

  // 2. Logic Upload Gambar
  let imageUrl = null;
  const imageFile = formData.get("image") as File;

  // Cek apakah file ada dan valid (bukan file kosong dengan nama 'undefined')
  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    // Validasi tipe mime
    if (!imageFile.type.startsWith("image/")) {
      return { success: false, message: "File harus berupa gambar (JPG/PNG)." };
    }
    // Validasi ukuran (2MB)
    if (imageFile.size > 2 * 1024 * 1024) {
      return { success: false, message: "Ukuran gambar maksimal 2MB." };
    }

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);

    if (uploadError) {
      return {
        success: false,
        message: "Gagal upload gambar: " + uploadError.message,
      };
    }

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);
    imageUrl = data.publicUrl;
  }

  // 3. Insert ke Database
  // Kita gunakan data dari validatedFields.data agar aman,
  // tapi pastikan 'barcode' dan 'supplier_id' masuk dengan benar.
  const { error: dbError } = await supabase.from("products").insert({
    name: validatedFields.data.name,
    sku: validatedFields.data.sku,
    barcode: barcodeToSave, // <--- PENTING: Simpan Barcode di sini
    category_id: validatedFields.data.category_id,
    supplier_id: supplierIdToSave,
    description: validatedFields.data.description,
    price: validatedFields.data.price,
    current_stock: validatedFields.data.current_stock,
    min_stock_level: validatedFields.data.min_stock_level,
    image_url: imageUrl,
  });

  if (dbError) {
    // Handle Unique Violation (Code 23505)
    if (dbError.code === "23505") {
      // Cek pesan error untuk tahu apakah yg duplikat SKU atau Barcode
      if (dbError.details.includes("sku")) {
        return {
          success: false,
          message: "Gagal: SKU produk ini sudah terdaftar.",
          errors: { sku: ["SKU sudah digunakan."] },
        };
      }
      if (dbError.details.includes("barcode")) {
        return {
          success: false,
          message: "Gagal: Barcode ini sudah terdaftar pada produk lain.",
          errors: { barcode: ["Barcode sudah digunakan."] },
        };
      }
      return { success: false, message: "Data duplikat terdeteksi." };
    }
    return { success: false, message: "Database Error: " + dbError.message };
  }

  revalidatePath("/dashboard/products");
  return { success: true, message: "Produk berhasil ditambahkan!" };
}

// Update fungsi delete agar mengembalikan status
export async function deleteProduct(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    // Kita bisa throw error agar ditangkap oleh block try-catch di client (delete-button.tsx)
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/products");
  return { success: true, message: "Produk dihapus." };
}
