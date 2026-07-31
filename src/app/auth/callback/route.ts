import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the redirect from Supabase auth emails: invitation, magic sign-in
 * link, and password reset. Exchanges the one-time code for a session, then
 * sends the person on to the right place.
 *
 * Two things this route must get right:
 *  1. It must say WHY a link failed, not just that it did. Telling someone to
 *     "try again" when the same thing will happen again is not an error
 *     message, it is a dead end. (WCAG 3.3.3 Error Suggestion.)
 *  2. It must log the underlying reason to the server, so a failure can be
 *     diagnosed from the Vercel runtime logs rather than guessed at.
 */

/**
 * Only relative paths are accepted, so a crafted link cannot use this route to
 * bounce someone off to another site while they are mid sign-in.
 */
function safeNext(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  const next = safeNext(searchParams.get("next"));

  // A password reset must land on the "set a new password" screen. We check
  // both signals because Supabase does not guarantee the `type` parameter on
  // every flow, and we set `next` ourselves when we request the reset.
  const isRecovery = type === "recovery" || next === "/update-password";

  const destination = isRecovery ? "/update-password" : (next ?? "/");

  // Send a failed reset back to the reset screen, not the sign-in screen.
  const failPage = isRecovery ? "/reset-password" : "/login";

  const fail = (message: string, reason: string) => {
    console.error("[auth/callback] failed:", reason);
    return NextResponse.redirect(
      `${origin}${failPage}?error=${encodeURIComponent(message)}`
    );
  };

  if (errorParam) {
    return fail(
      isRecovery
        ? "This password reset link has expired or has already been used. Reset links work once only. Please request a new one below."
        : "This sign-in link has expired or has already been used. Sign-in links work once only. Please request a new one below.",
      `supabase returned ${errorParam}: ${errorDesc ?? "no description"}`
    );
  }

  if (!code) {
    return fail(
      "That link is missing the part that proves it came from us. It may have been altered by an email program. Please request a new one below.",
      "no code parameter present on the callback URL"
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return fail(
      isRecovery
        ? "This password reset link could not be completed. It may have expired, it may already have been used, or it may have been opened in a different browser or on a different device from the one you requested it on. Request a new link below and open it in this same browser."
        : "This sign-in link could not be completed. It may have expired, it may already have been used, or it may have been opened in a different browser or on a different device from the one you requested it on. Request a new link below and open it in this same browser.",
      `exchangeCodeForSession: ${error.name}: ${error.message}`
    );
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
