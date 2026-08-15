import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const origin =
          process.env.NODE_ENV === "development"
            ? requestUrl.origin
            : forwardedHost
              ? `https://${forwardedHost}`
              : requestUrl.origin;

        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (error) {
      console.error("[auth/callback] failed to exchange OAuth code:", error);
    }
  }

  return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
}
