import type { Role } from "@/lib/roles";

/**
 * Guided Bias Risk Questionnaire configuration (Brief Section 7).
 *
 * Questions are config-driven so they can be edited without touching UI code.
 * Branching is handled by `visibleIf(role, answers)` on each question, covering
 * both role-based and jurisdiction-based branching.
 *
 * Yes/No questions use the `yesnounsure` type, which offers a third answer:
 * "Not sure". This is deliberate and it matters. The risk engine treats an
 * unanswered or unknown question differently from a "no" — because they mean
 * different things. Someone who does not know whether their supplier retrains
 * the model has not told us the risk is absent; they have told us it is
 * unverified. Without a "Not sure" option people guess, guesses tend towards
 * "no", and the report comes out more reassuring than the facts support.
 *
 * Values are stored as the strings "true", "false" and "unsure" so that the
 * engine's existing asBool() helper continues to work unchanged. Answers saved
 * before this change are real booleans; both forms are handled everywhere.
 */

export type Answers = Record<string, string | string[] | boolean>;

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "yesno"
  | "yesnounsure"
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

/**
 * True when a yes/no/unsure answer is affirmative, in either the current
 * string form or the older boolean form. Use this rather than `=== true`,
 * which silently stopped matching when the storage format changed.
 */
export function isYes(v: unknown): boolean {
  return v === true || v === "true";
}

/** Profile columns that are boolean in the database and must not receive "unsure". */
export const BOOLEAN_PROFILE_FIELDS = new Set([
  "eu_reach",
  "sensitive_data",
  "children_vulnerable",
  "public_authority",
]);

/**
 * Converts a stored answer to a value a nullable boolean column will accept.
 * "unsure", blank and undefined all become NULL, which is the correct meaning:
 * not known. Writing the string "unsure" to a boolean column fails.
 */
export function toNullableBoolean(v: unknown): boolean | null {
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return null;
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
  "If you are not sure, choose “Not sure”. That is a real answer and it is better than guessing.";

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
        help: "Choose all that apply. Naming a group does not count against you — it is what allows the assessment to check that group.",
      },
      {
        id: "children_vulnerable",
        label: "Could it affect children or vulnerable people?",
        type: "yesnounsure",
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
        type: "yesnounsure",
        help: "Sensitive information includes race, health, disability, religion, sex life, or biometric data like faces or fingerprints.",
      },
      {
        id: "biometric",
        label: "Does it use facial recognition or other biometrics?",
        type: "yesnounsure",
        help: "Biometric identification carries some of the highest risk under both SA and EU rules. Biometrics also include voice, fingerprints and eye scans.",
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
        type: "yesnounsure",
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
        // isYes() rather than `=== true`: answers are now stored as strings,
        // and a strict comparison would silently stop showing this question.
        visibleIf: (_role, a) => isYes(a.eu_reach),
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
        type: "yesnounsure",
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
        help: "Describe anything you have seen or heard — unfair outcomes, errors, or complaints. Reporting a concern does not raise your risk score. It is what allows the concern to be examined.",
      },
      {
        id: "complaints",
        label: "Have people complained or appealed?",
        type: "yesnounsure",
        help: yesNoHelpForAffected,
      },
    ],
  },
  {
    id: "lifecycle",
    title: "How the system decides and changes",
    intro:
      "These last questions are about things that cannot be seen from a description of the system. They cover uses that may be banned outright, and the ways a system can start behaving differently after it is switched on. “Not sure” is a proper answer here — many of these are things only a supplier can confirm.",
    questions: [
      {
        id: "emotion_inference",
        label: "Does the system try to work out how someone is feeling?",
        type: "yesnounsure",
        help: "For example: reading a face, a voice or body signals to judge mood, stress, honesty or engagement. In the workplace or in education this may be banned outright in the EU, so it is checked before anything else.",
      },
      {
        id: "social_scoring",
        label:
          "Does it give people a score or rating based on their behaviour or personal characteristics?",
        type: "yesnounsure",
        help: "A score used to decide how someone is treated in a situation unrelated to where the information came from. This is restricted in the EU, especially for public bodies.",
      },
      {
        id: "profiling",
        label:
          "Does it build a profile of a person to predict something about them?",
        type: "yesnounsure",
        help: "Profiling means using personal data to work out or predict things like performance at work, reliability, health, interests or behaviour. This answer matters a great deal: profiling removes an exemption that some systems can otherwise rely on.",
      },
      {
        id: "education_purpose",
        label: "What is the system used for in education?",
        type: "select",
        options: [
          { value: "admission", label: "Deciding who gets admitted or accepted" },
          { value: "assignment", label: "Placing learners into institutions or programmes" },
          { value: "learning_outcomes", label: "Marking, grading or evaluating learning" },
          { value: "appropriate_level", label: "Deciding what level someone should be taught at" },
          { value: "exam_monitoring", label: "Watching for cheating during tests" },
          { value: "content_only", label: "Only delivering learning content — none of the above" },
          { value: "unsure", label: "Not sure" },
        ],
        help: "Education systems are only treated as high-risk for certain purposes. A system that only delivers content, without assessing or gating learners, is not automatically high-risk. Answer accurately — this can change the whole classification.",
        visibleIf: (_role, a) => a.decision_domain === "education",
      },
      {
        id: "carries_state",
        label:
          "Does the system carry anything from one decision to the next, or start fresh each time?",
        type: "yesnounsure",
        options: [
          { value: "true", label: "It carries something forward" },
          { value: "false", label: "It starts fresh each time" },
          { value: "unsure", label: "Not sure" },
        ],
        help: "Some systems remember what they have already seen while working through a batch — for example, a shortlisting tool that compares each applicant to the ones before. This is the single strongest warning sign for bias that develops through use, because a pattern can form from very few examples with no retraining at all.",
      },
      {
        id: "outputs_become_inputs",
        label: "Do the system's own results get fed back in as new data?",
        type: "yesnounsure",
        help: "For example, decisions it made last month become part of what it learns from this month. This can make an early mistake reinforce itself.",
      },
      {
        id: "retraining",
        label: "How does the system get updated or retrained?",
        type: "select",
        options: [
          { value: "never", label: "It is never retrained" },
          { value: "we_control", label: "We retrain it, and we control when" },
          { value: "supplier_with_notice", label: "The supplier updates it and tells us" },
          { value: "supplier_without_notice", label: "The supplier updates it without telling us" },
          { value: "unsure", label: "Not sure" },
        ],
        help: "If a supplier can change the system without telling you, an assessment can stop describing the system you are actually using. Many contracts do not cover this — if you do not know, that is worth knowing.",
      },
      {
        id: "outcome_monitoring",
        label: "Do you check whether outcomes differ between groups of people?",
        type: "select",
        options: [
          { value: "regular", label: "Yes, regularly and on a schedule" },
          { value: "occasional", label: "Occasionally, or when something prompts it" },
          { value: "no", label: "No" },
          { value: "unsure", label: "Not sure" },
        ],
        help: "This means comparing results for different groups — for example, are disabled applicants rejected more often? Without this, a pattern that develops after launch would not be noticed.",
      },
      {
        id: "disability_data_held",
        label: "Do you hold data about whether the people affected are disabled?",
        type: "select",
        options: [
          { value: "yes", label: "Yes, we hold it and may use it for monitoring" },
          { value: "no", label: "No, we do not hold it" },
          { value: "not_lawful", label: "We hold it but may not lawfully use it for this" },
          { value: "unsure", label: "Not sure" },
        ],
        help: "This is asked because it changes how the assessment must work. Disability is usually not recorded, so checking outcomes by group cannot detect harm to disabled people. Where the data does not exist, impact has to be assessed by examining what the system filters on instead. Saying no does not count against you.",
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
