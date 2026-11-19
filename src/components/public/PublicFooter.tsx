import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-shell public-footer-grid">
        <div>
          <h2>BiasLens by BeAccessible</h2>
          <p>Evidence-led algorithmic accountability and bias-risk assessment.</p>
          <p><a href="mailto:hello@beaccessible.co.za">hello@beaccessible.co.za</a></p>
        </div>
        <div>
          <h2>Accessibility and privacy</h2>
          <p>This public experience is designed for keyboard operation, screen-reader navigation, reflow and visible focus, with a read-aloud convenience control that does not replace semantic accessibility.</p>
          <p><Link href="/ai-transparency">AI Transparency Statement</Link> · <Link href="/accessibility-statement">Accessibility Statement</Link> · <Link href="/privacy">Privacy Notice</Link></p>
        </div>
      </div>
    </footer>
  );
}
