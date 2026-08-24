/**
 * BiasLens epistemic evidence state.
 *
 * Collection status answers: "Do we have the item?"
 * Evidence state answers: "What does the available evidence justify?"
 *
 * Text and symbols are both used so meaning never depends on colour alone.
 */
const META: Record<
  string,
  { label: string; symbol: string; description: string; emphatic?: boolean }
> = {
  established: {
    label: "Established",
    symbol: "✓",
    description: "Directly supported by evidence that has been checked and is sufficiently reliable for this claim.",
    emphatic: true,
  },
  derived: {
    label: "Derived",
    symbol: "=",
    description: "Calculated or logically derived from established evidence, with the derivation recorded.",
  },
  inferred: {
    label: "Inferred",
    symbol: "~",
    description: "A reasonable interpretation or conclusion, but not directly demonstrated by the available evidence.",
  },
  unknown: {
    label: "Unknown",
    symbol: "?",
    description: "Required evidence is missing, unavailable, insufficient or not yet assessed.",
    emphatic: true,
  },
  conflicted: {
    label: "Conflicted",
    symbol: "!",
    description: "Available evidence sources materially disagree or cannot yet be reconciled.",
    emphatic: true,
  },
};

export type EvidenceState = keyof typeof META;

export const EVIDENCE_STATES = Object.entries(META).map(([value, meta]) => ({
  value,
  label: meta.label,
  description: meta.description,
}));

export function isEvidenceState(value: string): value is EvidenceState {
  return value in META;
}

export function EvidenceStateBadge({ state }: { state: string }) {
  const meta = META[state] ?? {
    label: state || "Unknown",
    symbol: "?",
    description: "Evidence state not recognised.",
    emphatic: true,
  };

  return (
    <span
      className="badge"
      style={{ borderStyle: meta.emphatic ? "solid" : "dashed" }}
      title={meta.description}
    >
      <span aria-hidden="true">{meta.symbol}</span>
      <span>{meta.label}</span>
    </span>
  );
}
