"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/schemas";

// Tipe data untuk State yang dikembalikan ke Client
export type State = {
  success: boolean;
  message: string | null;
  errors?: {
    [key: string]: string[];
  };
};

// ==========================================
// CREATE PRODUCT (TAMBAH PRODUK)
// ==========================================
export async function createProduct(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();

  // 1. Validasi Input menggunakan Zod
  // Kita ambil data mentah dari FormData dan validasi
  const validatedFields = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    category_id: formData.get("category_id"),
    description: formData.get("description"),
    price: formData.get("price"),
    current_stock: formData.get("current_stock"),
    min_stock_level: formData.get("min_stock_level"),
    // Image divalidasi manual logic-nya di bawah
  });

  // Jika validasi gagal, kembalikan error field ke form
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Gagal validasi data. Mohon periksa input Anda.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Logic Upload Gambar (Opsional)
  let imageUrl = null;
  const imageFile = formData.get("image") as File;

  // Cek apakah user mengupload file (size > 0)
  if (imageFile && imageFile.size > 0) {
    // Validasi tipe file (Server side check)
    if (!imageFile.type.startsWith("image/")) {
      return { success: false, message: "File harus berupa gambar (JPG/PNG)." };
    }

    // Validasi ukuran (misal maks 2MB)
    if (imageFile.size > 2 * 1024 * 1024) {
      return { success: false, message: "Ukuran gambar maksimal 2MB." };
    }

    // Generate nama file unik: timestamp-randomstring.ext
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload ke Supabase Storage bucket 'products'
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);

    if (uploadError) {
      return {
        success: false,
        message: "Gagal upload gambar: " + uploadError.message,
      };
    }

    // Dapatkan Public URL untuk disimpan di DB
    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  // 3. Insert ke Database
  const { error: dbError } = await supabase.from("products").insert({
    name: validatedFields.data.name,
    sku: validatedFields.data.sku,
    category_id: validatedFields.data.category_id,
    description: validatedFields.data.description,
    price: validatedFields.data.price,
    current_stock: validatedFields.data.current_stock,
    min_stock_level: validatedFields.data.min_stock_level,
    image_url: imageUrl,
    supplier_id: null, // Nanti diisi saat modul Supplier sudah jadi
  });

  if (dbError) {
    // Handle duplicate SKU error (kode unik constraint psql)
    if (dbError.code === "23505") {
      return {
        success: false,
        message: "SKU produk sudah terdaftar. Gunakan SKU lain.",
        errors: { sku: ["SKU ini sudah digunakan."] },
      };
    }
    return { success: false, message: "Database Error: " + dbError.message };
  }

  // 4. Sukses
  // Kita refresh cache halaman list produk agar data baru muncul
  revalidatePath("/dashboard/products");

  // Return success: true agar Client bisa memunculkan Toast & Redirect
  return {
    success: true,
    message: "Produk berhasil ditambahkan!",
  };
}

// ==========================================
// DELETE PRODUCT (HAPUS PRODUK)
// ==========================================
export async function deleteProduct(id: string) {
  const supabase = await createClient();

  // Hapus data (Gambar di storage dibiarkan atau bisa dihapus juga jika ingin bersih total)
  // Untuk tahap ini, kita hapus record DB saja dulu.
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/products");
}
