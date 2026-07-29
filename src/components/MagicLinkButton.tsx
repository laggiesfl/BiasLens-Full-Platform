"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Requests a magic sign-in link from the browser rather than a server action.
 * The PKCE code verifier must be stored in the browser that will open the
 * link. Requesting from a server action loses it, so sign-in then fails.
 */
export function MagicLinkButton({ label, hint }: { label: string; hint: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function requestLink() {
    const input = document.getElementById("email") as HTMLInputElement | null;
    const email = input?.value.trim() ?? "";

    if (!email) {
      setStatus("error");
      setMessage("Enter your email address first, then choose this option again.");
      input?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage(
      "Check your email for a sign-in link. Open it in this browser. You can close this tab once you have it."
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={requestLink}
        disabled={status === "sending"}
        className="btn btn-secondary"
        style={{ width: "100%" }}
      >
        {status === "sending" ? "Sending your sign-in link…" : label}
      </button>

      <p className="hint" style={{ marginBottom: 0 }}>
        {hint}
      </p>

      {message ? (
        <p
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={status === "error" ? "form-error" : "form-success"}
          style={{ marginBottom: 0 }}
        >
          {message}
        </p>
      ) : null}
    </>
  );
}
