import Link from "next/link";
import { Logo } from "@/components/Logo";

export default async function SignUpPage() {
  return (
    <main className="auth-wrap" id="main-content">
      <div className="card auth-card stack">
        <div className="cluster" style={{ gap: 12 }}>
          <Logo />
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>BiasLens</h1>
            <p className="muted" style={{ margin: 0 }}>
              Algorithmic bias testing and accountability by BeAccessible
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: "1.2rem" }}>Access by invitation</h2>

        <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#1A1A2E" }}>
          BiasLens is a professional compliance platform for organisations
          deploying AI systems. Access is granted after an onboarding
          consultation.
        </p>

        <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#1A1A2E" }}>
          To request access, contact us at{" "}
          <a
            href="mailto:hello@beaccessible.co.za"
            style={{ color: "#1F3F6B", fontWeight: 600 }}
          >
            hello@beaccessible.co.za
          </a>{" "}
          or visit{" "}
          <a
            href="https://beaccessible.co.za"
            style={{ color: "#1F3F6B", fontWeight: 600 }}
            target="_blank"
            rel="noopener noreferrer"
          >
            beaccessible.co.za
          </a>
          .
        </p>

        <div
          style={{
            background: "#E6EEF8",
            borderLeft: "3px solid #1F3F6B",
            borderRadius: "0 6px 6px 0",
            padding: "0.875rem 1rem",
            fontSize: "0.875rem",
            color: "#1F3F6B",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ fontWeight: 600, color: "#1F3F6B" }}>
            Sign in here →
          </Link>
        </div>
      </div>
    </main>
  );
}
