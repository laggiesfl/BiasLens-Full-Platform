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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          aria-describedby={describedBy}
          required
          style={{
            width: "100%",
            minWidth: 0,
            margin: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-controls={id}
          className="btn btn-secondary"
          style={{
            minWidth: 88,
            minHeight: 48,
            height: "100%",
            margin: 0,
            padding: "0 18px",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeftWidth: 0,
            whiteSpace: "nowrap",
          }}
        >
          {show ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      </div>
    </div>
  );
}
