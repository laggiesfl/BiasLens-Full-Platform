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
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
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
            <BiasLensGuide />
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
