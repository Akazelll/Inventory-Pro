import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Parameter 'next' digunakan untuk redirect setelah login berhasil (misal: /reset-password)
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // Penting untuk deployment Vercel
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // Localhost
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // Vercel / Production
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Jika error, kembalikan ke halaman login dengan indikator error
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
