/**
 * Risk-level / status indicator. Meaning is carried by text + a symbol and a
 * border style, never by colour alone (Brief Sections 9.6 & 16.3). Uses
 * approved blue tints only.
 */
const SYMBOL: Record<string, string> = {
  High: "▲▲▲",
  Medium: "▲▲",
  Low: "▲",
  Unacceptable: "■■■",
  Gap: "✕",
  "Needs attention": "▲",
  Addressed: "✓",
};

export function LevelBadge({ level }: { level: string }) {
  const symbol = SYMBOL[level] ?? "•";
  const emphatic = level === "High" || level === "Unacceptable" || level === "Gap";
  return (
    <span
      className="badge"
      style={{
        borderStyle: emphatic ? "solid" : "dashed",
        borderWidth: emphatic ? 3 : 2,
      }}
    >
      <span aria-hidden="true">{symbol}</span>
      <span>{level}</span>
    </span>
  );
}
