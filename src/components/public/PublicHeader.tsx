import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GuideLauncher } from "@/components/guide/GuideLauncher";
import { ListenToPage } from "./ListenToPage";
import { HomeSectionNavigator } from "./HomeSectionNavigator";
import { createClient } from "@/lib/supabase/server";

// Shows whether the visitor is signed in, so people are not left wondering after signing in.
async function signedInEmail(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

const NAV = [
  { href: "/who-its-for", label: "Who it is for" },
  { href: "/offers", label: "Offers" },
  { href: "/why-biaslens", label: "Why BiasLens" },
  { href: "/proof", label: "Proof" },
  { href: "/guide", label: "BiasLens Guide" },
];

export async function PublicHeader({ current }: { current?: string } = {}) {
  const email = await signedInEmail();
  return (
    <>
      <header className="public-header">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div className="public-shell public-header-inner">
          <Link href="/" className="public-brand" aria-label="BiasLens by BeAccessible home">
            <Logo size={48} />
            <span>
              <strong>BiasLens</strong>
              <small>by BeAccessible</small>
            </span>
          </Link>

          <nav aria-label="Public navigation" className="public-nav">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} aria-current={current === item.href ? "page" : undefined}>{item.label}</Link>
            ))}
          </nav>

          <div className="public-header-actions">
            <ListenToPage targetId="main-content" />
            {email ? (
              <>
                <span className="public-signed-in" title={email}>Signed in</span>
                <Link href="/dashboard" className="public-text-link">Go to dashboard</Link>
              </>
            ) : (
              <Link href="/login" className="public-text-link">Sign in</Link>
            )}
            <Link href="/enquire" className="public-button public-button-primary">Assess one AI system</Link>
          </div>
        </div>
      </header>
      <HomeSectionNavigator />
      <GuideLauncher />
    </>
  );
}
