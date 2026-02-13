"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { categorySchema } from "@/lib/schemas";

export type State = {
  success: boolean;
  message: string | null;
  errors?: {
    [key: string]: string[];
  };
};

// Helper untuk membuat slug (URL friendly) dari nama
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, "") // Hapus karakter non-word
    .replace(/\-\-+/g, "-"); // Ganti multiple - dengan single -
}

export async function createCategory(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();

  // 1. Validasi Input
  const validatedFields = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validasi gagal. Cek inputan Anda.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, description } = validatedFields.data;
  const slug = slugify(name);

  // 2. Insert ke Database
  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description,
  });

  if (error) {
    // Handle error duplicate (jika nama/slug sudah ada)
    if (error.code === "23505") {
      return {
        success: false,
        message: "Kategori dengan nama ini sudah ada.",
        errors: { name: ["Nama kategori harus unik."] },
      };
    }
    return { success: false, message: "Gagal menyimpan: " + error.message };
  }

  revalidatePath("/dashboard/categories");
  // Kita juga perlu refresh halaman produk/tambah produk agar dropdown kategori terupdate
  revalidatePath("/dashboard/products/new");

  return { success: true, message: "Kategori berhasil ditambahkan!" };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/categories");
}
