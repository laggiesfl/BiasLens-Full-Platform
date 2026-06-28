import { t } from "@/lib/i18n";

/**
 * Status indicator. Meaning is always carried by text + a symbol, never by
 * colour alone (Section 16.3 / 17.2). Uses approved blue tints only.
 */
const SYMBOLS: Record<string, string> = {
  draft: "◐",
  in_review: "⟳",
  completed: "✓",
  exported: "↧",
  archived: "▣",
};

export function StatusBadge({ status }: { status: string }) {
  const label =
    (t.status as Record<string, string>)[status] ?? status.replace("_", " ");
  const symbol = SYMBOLS[status] ?? "•";
  return (
    <span className="badge">
      <span className="dot" aria-hidden="true">
        {symbol}
      </span>
      <span>{label}</span>
    </span>
  );
}
