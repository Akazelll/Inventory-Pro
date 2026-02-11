import { z } from "zod";

// Validasi input produk
export const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  sku: z.string().min(3, "SKU minimal 3 karakter"),
  category_id: z.string().uuid("Kategori wajib dipilih"),
  // TAMBAHAN BARU: Supplier ID
  supplier_id: z
    .string()
    .uuid("Supplier tidak valid")
    .optional()
    .or(z.literal("")),

  description: z.string().optional(),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  current_stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  min_stock_level: z.coerce.number().int().min(1, "Minimal stok level harus 1"),
  image: z.any().optional(),
});

// Schema supplier
export const supplierSchema = z.object({
  name: z.string().min(2, "Nama supplier wajib diisi"),
  contact_person: z.string().optional(),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
});

// Schema Transaksi
export const transactionSchema = z.object({
  product_id: z.string().uuid("Produk wajib dipilih"),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().min(1, "Jumlah minimal 1"),
  notes: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

// PERBAIKAN DI SINI (userRegisterSchema):
export const userRegisterSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  // Hapus object config error, biarkan array saja.
  role: z.enum(["admin", "manager", "staff"]),
});

export type UserRegisterFormValues = z.infer<typeof userRegisterSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
});

// Validasi Ganti Password
export const passwordSchema = z
  .object({
    password: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });