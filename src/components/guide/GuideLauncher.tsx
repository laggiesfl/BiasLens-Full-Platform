"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BiasLensGuide } from "./BiasLensGuide";
import styles from "./GuideLauncher.module.css";

export function GuideLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        requestAnimationFrame(() => launcherRef.current?.focus());
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => element.getClientRects().length > 0);
      if (!focusables.length) {
        event.preventDefault();
        closeRef.current?.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (pathname === "/guide") return null;

  return (
    <>
      {open && (
        <aside
          ref={panelRef}
          id="biaslens-guide-panel"
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-launcher-title"
        >
          <div className={styles.panelHeader}>
            <strong id="guide-launcher-title">BiasLens Guide</strong>
            <button
              ref={closeRef}
              type="button"
              className={styles.close}
              onClick={() => {
                setOpen(false);
                requestAnimationFrame(() => launcherRef.current?.focus());
              }}
            >
              Close
            </button>
          </div>
          <div className={styles.panelBody}>
            <BiasLensGuide embedded />
          </div>
        </aside>
      )}

      {!open && (
        <button
          ref={launcherRef}
          type="button"
          className={styles.launcher}
          aria-expanded="false"
          aria-controls="biaslens-guide-panel"
          onClick={() => setOpen(true)}
        >
          Ask BiasLens Guide
        </button>
      )}
    </>
  );
}
