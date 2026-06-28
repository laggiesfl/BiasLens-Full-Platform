import type { Role } from "@/lib/roles";

/**
 * Guided Bias Risk Questionnaire configuration (Brief Section 7).
 *
 * Questions are config-driven so they can be edited without touching UI code.
 * Branching is handled by `visibleIf(role, answers)` on each question, covering
 * both role-based and jurisdiction-based branching.
 */

export type Answers = Record<string, string | string[] | boolean>;

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "yesno"
  | "multiselect";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  hint?: string;
  /** Plain-language explanation (Grade 8) — why this matters / what to do. */
  help?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  visibleIf?: (role: Role, answers: Answers) => boolean;
}

export interface Step {
  id: string;
  title: string;
  intro?: string;
  questions: Question[];
}

const DOMAIN_OPTIONS = [
  "welfare",
  "policing",
  "healthcare",
  "financial services",
  "employment",
  "education",
  "migration",
  "justice",
  "other",
].map((d) => ({ value: d, label: d }));

const POPULATION_OPTIONS = [
  "People with disabilities",
  "Older persons",
  "Children",
  "Women",
  "Black South Africans",
  "Migrants or refugees",
  "Rural residents",
  "Low-income people",
  "Non-English / minority-language speakers",
  "LGBTQ+ people",
].map((p) => ({ value: p, label: p }));

const RIGHTS_OPTIONS = [
  "Equality / non-discrimination",
  "Privacy",
  "Access to social security or welfare",
  "Access to healthcare",
  "Access to employment",
  "Access to education",
  "Access to financial services",
  "Freedom of movement / migration",
  "Liberty and security (policing/justice)",
  "Dignity",
].map((r) => ({ value: r, label: r }));

const yesNoHelpForAffected =
  "If you are not sure, choose the answer that feels closest. You can change it later.";

export const QUESTIONNAIRE: Step[] = [
  {
    id: "basics",
    title: "System basics",
    intro: "Let us start with what the system is and who is behind it.",
    questions: [
      {
        id: "system_name",
        label: "What is the AI system called?",
        type: "text",
        required: true,
        help: "A name helps you keep track. If you do not know the official name, describe it briefly.",
      },
      {
        id: "provider",
        label: "Who owns or provides the system?",
        type: "text",
        help: "The organisation that built or supplies the system.",
      },
      {
        id: "deployer",
        label: "Who is using or deploying it?",
        type: "text",
        help: "The organisation that actually uses the system to make or support decisions.",
      },
      {
        id: "vendor",
        label: "Who is the vendor or supplier (if different)?",
        type: "text",
        visibleIf: (role) => role === "business" || role === "government",
      },
    ],
  },
  {
    id: "purpose",
    title: "Purpose and domain",
    questions: [
      {
        id: "purpose",
        label: "What is the system used for?",
        type: "textarea",
        required: true,
        help: "Describe the decision it makes or supports, in your own words.",
      },
      {
        id: "decision_domain",
        label: "Which area does it affect most?",
        type: "select",
        options: DOMAIN_OPTIONS,
        required: true,
        help: "Some areas — like welfare, policing, healthcare, employment and finance — carry higher risk.",
      },
      {
        id: "deployment_context",
        label: "Where and how is it used?",
        type: "text",
        help: "For example: in a call centre, online, at a border post, inside a hospital.",
      },
    ],
  },
  {
    id: "people",
    title: "People affected",
    intro: "Who could be affected by the decisions this system makes?",
    questions: [
      {
        id: "affected_populations",
        label: "Which groups could be affected?",
        type: "multiselect",
        options: POPULATION_OPTIONS,
        help: "Choose all that apply. Bias often affects some groups more than others.",
      },
      {
        id: "children_vulnerable",
        label: "Could it affect children or vulnerable people?",
        type: "yesno",
        help: "Systems affecting children or vulnerable people need extra care.",
      },
    ],
  },
  {
    id: "data",
    title: "Data and model inputs",
    questions: [
      {
        id: "data_sources",
        label: "What data does the system use?",
        type: "textarea",
        help: "For example: application forms, ID numbers, photos, payment history, health records.",
        visibleIf: (role) => role !== "affected_individual",
      },
      {
        id: "sensitive_data",
        label: "Does it use sensitive personal information?",
        type: "yesno",
        help: "Sensitive information includes race, health, disability, religion, sex life, or biometric data like faces or fingerprints.",
      },
      {
        id: "biometric",
        label: "Does it use facial recognition or other biometrics?",
        type: "yesno",
        help: "Biometric identification carries some of the highest risk under both SA and EU rules.",
      },
    ],
  },
  {
    id: "deployment",
    title: "Deployment and geography",
    questions: [
      {
        id: "geographies",
        label: "Where is the system used?",
        type: "text",
        help: "For example: South Africa only, or South Africa and the EU.",
      },
      {
        id: "eu_reach",
        label: "Does it reach the EU market or EU users?",
        type: "yesno",
        help: "If the system, its provider, deployer or output reaches the EU, the EU AI Act may also apply.",
      },
      {
        id: "eu_market_role",
        label: "What is your role for the EU market?",
        type: "select",
        options: [
          { value: "provider", label: "Provider (we build/supply it)" },
          { value: "deployer", label: "Deployer (we use it)" },
          { value: "both", label: "Both" },
          { value: "unsure", label: "Not sure" },
        ],
        help: "This affects which EU AI Act duties apply to you.",
        visibleIf: (_role, a) => a.eu_reach === true,
      },
    ],
  },
  {
    id: "oversight",
    title: "Human oversight",
    questions: [
      {
        id: "oversight_model",
        label: "How do people oversee the system?",
        type: "text",
        help: "For example: a person reviews every decision, only flagged cases, or no human review.",
      },
      {
        id: "human_review",
        label: "Can a person review or reverse a decision?",
        type: "select",
        options: [
          { value: "always", label: "Yes, a person reviews every decision" },
          { value: "flagged", label: "Only flagged or appealed cases" },
          { value: "on_request", label: "Only if someone asks" },
          { value: "none", label: "No human review" },
        ],
        help: "Less human oversight usually means higher risk.",
      },
      {
        id: "public_authority",
        label: "Is it used by a public authority?",
        type: "yesno",
        help: "Government and public-sector use raises the level of accountability required.",
      },
    ],
  },
  {
    id: "rights",
    title: "Rights and concerns",
    questions: [
      {
        id: "rights_affected",
        label: "Which rights or access could be affected?",
        type: "multiselect",
        options: RIGHTS_OPTIONS,
        help: "Choose all that apply. This helps map the system to human rights frameworks.",
      },
      {
        id: "known_concerns",
        label: "Are there known concerns, complaints or harms?",
        type: "textarea",
        help: "Describe anything you have seen or heard — unfair outcomes, errors, or complaints.",
      },
      {
        id: "complaints",
        label: "Have people complained or appealed?",
        type: "yesno",
        help: yesNoHelpForAffected,
      },
    ],
  },
];

export function visibleQuestions(
  step: Step,
  role: Role,
  answers: Answers
): Question[] {
  return step.questions.filter(
    (q) => !q.visibleIf || q.visibleIf(role, answers)
  );
}

export function totalSteps(): number {
  return QUESTIONNAIRE.length;
}

/** Fields that mirror columns on ai_system_profiles (synced on completion). */
export const PROFILE_FIELD_MAP: Record<string, string> = {
  system_name: "system_name",
  provider: "provider",
  deployer: "deployer",
  vendor: "vendor",
  purpose: "purpose",
  decision_domain: "decision_domain",
  deployment_context: "deployment_context",
  affected_populations: "affected_populations",
  data_sources: "data_sources",
  oversight_model: "oversight_model",
  human_review: "human_review",
  eu_reach: "eu_reach",
  sensitive_data: "sensitive_data",
  children_vulnerable: "children_vulnerable",
  public_authority: "public_authority",
  rights_affected: "rights_affected",
};
