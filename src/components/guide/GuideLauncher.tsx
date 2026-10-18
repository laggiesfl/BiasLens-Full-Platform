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

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        requestAnimationFrame(() => launcherRef.current?.focus());
      }
      // A return shortcut is useful when focus has moved into the main website.
      // Do not trap Tab: this is a non-modal Guide and the page stays available.
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "g") {
        event.preventDefault();
        closeRef.current?.focus();
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
          id="biaslens-guide-panel"
          className={styles.panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby="guide-launcher-title"
        >
          <div className={styles.panelHeader}>
            <div>
              <strong id="guide-launcher-title">BiasLens Guide</strong>
              <span style={{ display: "block", fontSize: "0.75rem" }}>Return to Guide: Alt+Shift+G</span>
            </div>
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
