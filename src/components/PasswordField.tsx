"use client";

import { useState } from "react";

/**
 * Accessible password input with a show/hide toggle.
 * The toggle is a real button (keyboard operable, 48px target) and announces
 * its state to screen readers via aria-pressed and a clear label.
 */
export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
  describedBy,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  minLength?: number;
  describedBy?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          aria-describedby={describedBy}
          required
          style={{ paddingRight: 96 }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-controls={id}
          className="btn btn-secondary"
          style={{
            position: "absolute",
            right: 4,
            top: 4,
            minHeight: 40,
            height: "calc(100% - 8px)",
            padding: "0 12px",
          }}
        >
          {show ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      </div>
    </div>
  );
}
