"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Requests a password reset link from the browser rather than from a server
 * action.
 *
 * Why this has to run in the browser:
 * Supabase uses the PKCE flow. resetPasswordForEmail creates a one-time secret
 * called a code verifier, which must be stored in the same browser that will
 * later open the emailed link. A server action stores it on the server, where
 * the browser never receives it, so the exchange at /auth/callback always
 * fails. This is the identical fault that broke magic-link sign-in, and it is
 * fixed the same way. See MagicLinkButton.tsx.
 */
export function ResetPasswordForm({
  emailLabel,
  submitLabel,
}: {
  emailLabel: string;
  submitLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();

    if (!email) {
      setStatus("error");
      setMessage("Enter the email address you use for BiasLens.");
      (form.elements.namedItem("email") as HTMLInputElement | null)?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage(
      "Check your email for a link to set a new password. Open it in this same browser, on this same device. The link can be used once, and it expires after an hour."
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="stack"
      style={{ marginTop: 0 }}
      noValidate
    >
      <div className="field">
        <label htmlFor="email">{emailLabel}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby="reset-status"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%" }}
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending your link…" : submitLabel}
      </button>

      {/*
        This paragraph is always present in the page, even when empty, so that
        screen readers treat it as a live region from the outset and reliably
        announce whatever appears in it. Regions added to the page only at the
        moment they gain content are announced far less dependably.
      */}
      <p
        id="reset-status"
        role="status"
        aria-live="polite"
        className={
          status === "error"
            ? "form-error"
            : status === "sent"
              ? "form-success"
              : undefined
        }
        style={{ marginBottom: 0 }}
      >
        {message}
      </p>
    </form>
  );
}
