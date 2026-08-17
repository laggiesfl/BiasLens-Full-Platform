"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BiasLensGuide } from "./BiasLensGuide";
import styles from "./GuideLauncher.module.css";

export function GuideLauncher() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        requestAnimationFrame(() => launcherRef.current?.focus());
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {open && (
        <aside
          className={styles.panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby="guide-launcher-title"
        >
          <div className={styles.panelHeader}>
            <strong id="guide-launcher-title">BiasLens Guide</strong>
            <div className={styles.panelActions}>
              <Link className={styles.fullPage} href="/guide">
                Open full page
              </Link>
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
          </div>
          <div className={styles.panelBody}>
            <BiasLensGuide />
          </div>
        </aside>
      )}

      <button
        ref={launcherRef}
        type="button"
        className={styles.launcher}
        aria-expanded={open}
        aria-controls="biaslens-guide-panel"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Close BiasLens Guide" : "Ask BiasLens Guide"}
      </button>
    </>
  );
}
