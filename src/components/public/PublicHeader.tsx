import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GuideLauncher } from "@/components/guide/GuideLauncher";
import { ListenToPage } from "./ListenToPage";
import { HomeSectionNavigator } from "./HomeSectionNavigator";

export function PublicHeader() {
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
            <a href="/#why">Why BiasLens</a>
            <a href="/#offers">Offers</a>
            <a href="/#proof">Proof</a>
            <Link href="/guide">BiasLens Guide</Link>
            <a href="/#founder">Founder note</a>
          </nav>

          <div className="public-header-actions">
            <ListenToPage targetId="main-content" />
            <Link href="/login" className="public-text-link">Sign in</Link>
            <Link href="/enquire" className="public-button public-button-primary">Assess one AI system</Link>
          </div>
        </div>
      </header>
      <HomeSectionNavigator />
      <GuideLauncher />
    </>
  );
}
