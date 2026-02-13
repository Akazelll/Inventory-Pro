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

  // 1. Cek User yang sedang login (untuk audit trail / pencatat transaksi)
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

  // 3. Simpan Transaksi (Update Stok via RPC)
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

  // ============================================================
  // LOGIKA NOTIFIKASI & EMAIL (BROADCAST KE ADMIN & MANAGER)
  // ============================================================

  // Kita hanya cek notifikasi jika barang KELUAR (stok berkurang)
  if (type === "OUT") {
    // A. Ambil data produk TERBARU setelah dikurangi
    const { data: product } = await supabase
      .from("products")
      .select("name, current_stock, min_stock_level")
      .eq("id", product_id)
      .single();

    // B. Logika Kritis: Apakah stok SEKARANG <= Batas Minimum?
    if (product && product.current_stock <= product.min_stock_level) {
      const alertTitle = `🚨 Stok Kritis: ${product.name}`;
      const alertMessage = `Stok tersisa ${product.current_stock} unit (Min: ${product.min_stock_level}). Segera restock!`;

      // C. Cari SIAPA SAJA yang harus menerima notifikasi (Admin & Manager)
      // Query ke tabel profiles untuk ambil user dengan role tertentu
      const { data: recipients } = await supabase
        .from("profiles")
        .select("id, email")
        .in("role", ["admin", "manager"]); // Staff gudang biasa mungkin tidak perlu email, sesuaikan jika perlu

      if (recipients && recipients.length > 0) {
        // --- 1. KIRIM NOTIFIKASI INTERNAL (NAVBAR) KE BANYAK USER ---
        const notifications = recipients.map((recipient) => ({
          user_id: recipient.id, // ID Admin/Manager
          title: alertTitle,
          message: alertMessage,
          is_read: false,
          created_at: new Date().toISOString(),
        }));

        // Insert Bulk (Banyak sekaligus)
        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (notifError) {
          console.error("Gagal insert notifikasi DB:", notifError);
        }

        // --- 2. KIRIM EMAIL (RESEND) KE BANYAK USER ---
        // Ambil list email yang valid
        const emailTargets = recipients
          .map((r) => r.email)
          .filter((email) => email !== null && email !== "") as string[];

        if (emailTargets.length > 0) {
          try {
            // PENTING UNTUK RESEND FREE TIER:
            // Jika Anda masih Free Tier, Anda hanya bisa kirim ke email Anda sendiri.
            // Gunakan logika di bawah ini:

            // Opsi A: Production (Kirim ke semua target via BCC)
            await resend.emails.send({
              from: "IMS Admin <onboarding@resend.dev>",
              to: "delivered@resend.dev", // Dummy receiver agar tidak error
              bcc: emailTargets, // Kirim ke semua Admin & Manager via BCC
              subject: alertTitle,
              react: StockAlertEmail({
                productName: product.name,
                currentStock: product.current_stock,
                minStock: product.min_stock_level,
                productUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/products`,
              }),
            });

            console.log("Email alert terkirim ke:", emailTargets);
          } catch (emailError) {
            console.error("Gagal kirim email:", emailError);
          }
        }
      }
    }
  }

  // Refresh halaman terkait
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Transaksi Berhasil! Stok ${type === "IN" ? "bertambah" : "berkurang"}.`,
  };
}
