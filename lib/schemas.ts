import { z } from "zod";

// Validasi Form Produk
export const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  sku: z.string().min(3, "SKU minimal 3 karakter"),
  category_id: z.string().uuid("Kategori wajib dipilih"), // Nanti kita ambil dari DB
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"), // coerce mengubah string input ke number
  current_stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  min_stock_level: z.coerce.number().int().min(1, "Minimal stok level harus 1"),
  image: z
    .any()
    .optional() // Gambar opsional saat edit
    .refine((file) => {
      if (!file) return true; // Jika tidak ada file, lolos (untuk edit)
      return file instanceof File || file.length > 0; // Harus berupa File
    }, "File gambar wajib diupload untuk produk baru"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
