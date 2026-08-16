import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Paths reachable without signing in.
 *
 * /accessibility-statement is public because an accessibility statement exists
 * for people who are hitting a barrier — including people who cannot get past
 * the sign-in screen. Behind sign-in it is unreachable by exactly the people it
 * is written for.
 *
 * /privacy is public because POPIA and the GDPR both expect a person to be able
 * to read how their information will be handled BEFORE they hand any of it
 * over. Behind sign-in, it could only be read by people who had already decided.
 *
 * The BiasLens public landing and qualification journey must also remain
 * reachable without an account. The enquiry API is deliberately public because
 * it performs its own validation, honeypot check, server-only Airtable write and
 * owner notification; it does not expose assessment data.
 */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/reset-password",
  "/auth/callback",
  "/accessibility-statement",
  "/privacy",
  "/enquire",
  "/enquire/thank-you",
  "/api/enquiries",
  "/api/enquiries/e2e-test",
];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // Allow Next internals and static assets through.
  return pathname.startsWith("/_next") || pathname.startsWith("/favicon");
}

/**
 * Refreshes the Supabase auth session on every request and guards
 * protected routes. Unauthenticated users are redirected to /login.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
