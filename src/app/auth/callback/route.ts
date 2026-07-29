import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the redirect from Supabase auth emails (confirmation, magic link,
 * password reset). Exchanges the code for a session, then sends the user on.
 * Failures are logged with their cause and reported distinctly to the user.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  const next =
    type === "recovery" ? "/update-password" : searchParams.get("next") ?? "/";

  const fail = (message: string, reason: string) => {
    console.error("[auth/callback] sign-in failed:", reason);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`
    );
  };

  if (errorParam) {
    return fail(
      "This sign-in link has expired or has already been used. Sign-in links work once only. Please request a new one below.",
      `supabase returned ${errorParam}: ${errorDesc ?? "no description"}`
    );
  }

  if (!code) {
    return fail(
      "That sign-in link looks incomplete. Please request a new one below.",
      "no code parameter present in callback URL"
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return fail(
      "This sign-in link could not be completed. It may have expired, already been used, or been opened in a different browser from the one where you requested it. Please request a new link below and open it in this browser.",
      `exchangeCodeForSession: ${error.name}: ${error.message}`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
