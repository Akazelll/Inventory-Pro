import { createClient } from "@/utils/supabase/server";
import { ProductForm } from "./product-form"; // Component Client
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewProductPage() {
  const supabase = await createClient();

  // Kita butuh data kategori untuk dropdown
  const { data: categories } = await supabase.from("categories").select("*");

  return (
    <div className='max-w-2xl mx-auto'>
      <Card>
        <CardHeader>
          <CardTitle>Tambah Produk Baru</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Kita lempar data kategori ke form */}
          <ProductForm categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  );
}
