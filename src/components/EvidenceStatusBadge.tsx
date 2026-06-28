/** Evidence status shown by text + symbol + border style (never colour alone). */
const META: Record<string, { label: string; symbol: string; emphatic?: boolean }> = {
  not_requested: { label: "Not requested", symbol: "○" },
  requested: { label: "Requested", symbol: "→" },
  partially_received: { label: "Partially received", symbol: "◐" },
  received: { label: "Received", symbol: "✓", emphatic: true },
  refused: { label: "Refused", symbol: "✕", emphatic: true },
  appealed: { label: "Appealed", symbol: "⤴" },
  escalated: { label: "Escalated", symbol: "⇧", emphatic: true },
  not_applicable: { label: "Not applicable", symbol: "–" },
};

export function EvidenceStatusBadge({ status }: { status: string }) {
  const m = META[status] ?? { label: status, symbol: "•" };
  return (
    <span className="badge" style={{ borderStyle: m.emphatic ? "solid" : "dashed" }}>
      <span aria-hidden="true">{m.symbol}</span>
      <span>{m.label}</span>
    </span>
  );
}

export const EVIDENCE_STATUSES = Object.entries(META).map(([value, m]) => ({
  value,
  label: m.label,
}));
