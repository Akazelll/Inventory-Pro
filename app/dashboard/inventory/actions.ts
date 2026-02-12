"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/schemas";
import { Resend } from "resend";
import { StockAlertEmail } from "@/components/emails/stock-alert-email";

// Inisialisasi Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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

  // 1. Cek User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Sesi habis. Login ulang." };
  }

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
      message: "Data input tidak valid.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { product_id, type, quantity, notes } = validatedFields.data;

  // 3. Simpan Transaksi (Update Stok)
  const { error } = await supabase.rpc("create_inventory_transaction", {
    p_product_id: product_id,
    p_type: type,
    p_quantity: quantity,
    p_notes: notes || "",
    p_user_id: user.id,
  });

  if (error) {
    console.error("RPC Error:", error);
    return { success: false, message: error.message };
  }

  // --- LOGIKA NOTIFIKASI (EMAIL & NAVBAR) ---

  // Kita hanya cek notifikasi jika barang KELUAR (stok berkurang)
  if (type === "OUT") {
    // Ambil data produk TERBARU setelah dikurangi
    const { data: product } = await supabase
      .from("products")
      .select("name, current_stock, min_stock_level")
      .eq("id", product_id)
      .single();

    // Logika Kritis: Apakah stok SEKARANG <= Batas Minimum?
    if (product && product.current_stock <= product.min_stock_level) {
      const alertTitle = `🚨 Stok Kritis: ${product.name}`;
      const alertMessage = `Stok tersisa ${product.current_stock} unit (Min: ${product.min_stock_level}). Segera restock!`;

      // A. KIRIM NOTIFIKASI KE NAVBAR (DATABASE)
      // Ini yang bikin lonceng bunyi
      await supabase.from("notifications").insert({
        user_id: user.id, // Kirim notif ke user yang sedang login (bisa diubah ke admin id)
        title: alertTitle,
        message: alertMessage,
        is_read: false,
      });

      // B. KIRIM EMAIL (RESEND)
      try {
        // PENTING: Untuk Free Tier Resend, 'to' HARUS email yang sama dengan pendaftaran Resend
        // Ganti 'delivered@resend.dev' dengan email Anda yang terdaftar di Resend untuk testing
        const emailResponse = await resend.emails.send({
          from: "IMS Admin <onboarding@resend.dev>",
          to: user.email!, // Pastikan user.email ini valid dan terdaftar di Resend (jika free tier)
          subject: alertTitle,
          react: StockAlertEmail({
            productName: product.name,
            currentStock: product.current_stock,
            minStock: product.min_stock_level,
            productUrl:
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          }),
        });

        console.log("Email Result:", emailResponse);
      } catch (emailError) {
        console.error("Gagal kirim email:", emailError);
      }
    }
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Transaksi Berhasil! Stok ${type === "IN" ? "bertambah" : "berkurang"}.`,
  };
}
