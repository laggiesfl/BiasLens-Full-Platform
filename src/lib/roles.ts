/**
 * Platform roles (Section 5). Each role adapts the dashboard wording,
 * guidance and suggested next steps. Role can be changed in Account Settings.
 */
export type Role =
  | "civil_society"
  | "business"
  | "government"
  | "affected_individual"
  | "admin";

export interface RoleConfig {
  value: Role;
  label: string;
  shortLabel: string;
  description: string;
  primaryNeed: string;
  /** Plain-language next steps shown on the dashboard. */
  nextSteps: string[];
}

export const ROLES: Record<Exclude<Role, "admin">, RoleConfig> = {
  civil_society: {
    value: "civil_society",
    label: "Civil society, journalist or activist",
    shortLabel: "Civil society",
    description:
      "You investigate algorithmic systems and need to gather evidence you can rely on.",
    primaryNeed: "Investigate algorithmic systems and generate evidence.",
    nextSteps: [
      "Create an investigation assessment",
      "Complete the guided bias risk questionnaire",
      "Generate a risk classification you can cite",
      "Build an evidence log as you gather records",
    ],
  },
  business: {
    value: "business",
    label: "Business or AI developer",
    shortLabel: "Business",
    description:
      "You need internal audit, compliance, governance and remediation tools.",
    primaryNeed: "Internal audit, compliance, governance and remediation.",
    nextSteps: [
      "Create an AI system profile",
      "Run the guided bias risk questionnaire",
      "Map your system to SA, EU and human rights obligations",
      "Generate a board-ready or compliance-ready report",
    ],
  },
  government: {
    value: "government",
    label: "Government or public-sector procurement officer",
    shortLabel: "Government",
    description:
      "You need procurement due diligence, risk review and oversight tools.",
    primaryNeed: "Procurement due diligence and public-sector oversight.",
    nextSteps: [
      "Create a procurement review",
      "Capture the vendor, purpose, domain and affected people",
      "Classify the risk under SA and EU frameworks",
      "Generate an information request to the supplier",
    ],
  },
  affected_individual: {
    value: "affected_individual",
    label: "Affected individual or community member",
    shortLabel: "Affected individual",
    description:
      "You want plain-language help to understand, document and challenge an AI decision.",
    primaryNeed: "Understand, document and challenge a harmful AI decision.",
    nextSteps: [
      "Start a guided support flow",
      "Describe the decision that affected you",
      "Note the harm or barrier you experienced",
      "Build an evidence log to keep your records together",
    ],
  },
};

export const ROLE_OPTIONS = Object.values(ROLES);

export function roleLabel(role: Role | null | undefined): string {
  if (!role) return "No role selected";
  if (role === "admin") return "BeAccessible administrator";
  return ROLES[role]?.shortLabel ?? "Unknown role";
}
