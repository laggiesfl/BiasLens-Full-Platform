"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type SectionTarget = {
  index: number;
  label: string;
};

function sectionLabel(section: Element, index: number): string {
  const heading = section.querySelector("h1, h2");
  const text = heading?.textContent?.replace(/\s+/g, " ").trim();
  return text || `Section ${index + 1}`;
}

export function HomeSectionNavigator() {
  const pathname = usePathname();
  const [sections, setSections] = useState<SectionTarget[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("");

  const isHomepage = pathname === "/";

  useEffect(() => {
    if (!isHomepage) return;

    const elements = Array.from(document.querySelectorAll("#main-content > section"));
    const targets = elements.map((section, index) => ({
      index,
      label: sectionLabel(section, index),
    }));
    setSections(targets);
  }, [isHomepage]);

  const currentLabel = useMemo(
    () => sections[currentIndex]?.label || "Page section",
    [sections, currentIndex],
  );

  if (!isHomepage || sections.length === 0) return null;

  function moveTo(index: number) {
    const targetIndex = Math.max(0, Math.min(index, sections.length - 1));
    const element = document.querySelectorAll("#main-content > section")[targetIndex] as HTMLElement | undefined;
    if (!element) return;

    element.scrollIntoView({ behavior: "auto", block: "start" });
    setCurrentIndex(targetIndex);
    setStatus(`Moved to ${sections[targetIndex].label}.`);
  }

  function chooseSection(event: ChangeEvent<HTMLSelectElement>) {
    moveTo(Number(event.target.value));
  }

  return (
    <nav className="public-section-navigator" aria-label="Page sections">
      <div className="public-shell public-section-navigator-inner">
        <strong className="public-section-navigator-title">Move through this page</strong>
        <button
          type="button"
          className="public-section-nav-button"
          onClick={() => moveTo(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          ← Previous section
        </button>
        <label className="public-section-select-label" htmlFor="homepage-section-select">Page section</label>
        <select
          id="homepage-section-select"
          className="public-section-select"
          value={currentIndex}
          onChange={chooseSection}
          aria-label="Page sections"
        >
          {sections.map((section) => (
            <option key={section.index} value={section.index}>{section.label}</option>
          ))}
        </select>
        <button
          type="button"
          className="public-section-nav-button"
          onClick={() => moveTo(currentIndex + 1)}
          disabled={currentIndex === sections.length - 1}
        >
          Next section →
        </button>
        <span className="sr-only" aria-live="polite">{status || `Current section: ${currentLabel}.`}</span>
      </div>
    </nav>
  );
}
