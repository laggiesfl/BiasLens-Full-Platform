/**
 * BiasLens risk classification engine (Brief Sections 7.4 & 15).
 *
 * Transparent, rule-based. Every classification decision is recorded as a
 * RationaleItem (rule, trigger, framework reference, plain-language explanation,
 * confidence and recommendation) so nothing is unexplained. Rules live here in
 * one place rather than scattered through the UI.
 */

export type Answers = Record<string, string | string[] | boolean | undefined>;
export type Level = "Low" | "Medium" | "High";
export type SaTier = "Unacceptable" | "High" | "Medium" | "Low";

export interface RationaleItem {
  rule: string;
  trigger: string;
  framework: string;
  explanation: string;
  confidence: "High" | "Medium" | "Indicative";
  recommendation: string;
}
export interface BiasScore {
  type: string;
  level: Level;
  note: string;
}
export interface PillarAlignment {
  pillar: string;
  status: "Addressed" | "Needs attention" | "Gap";
  note: string;
}
export interface Obligation {
  ref: string;
  title: string;
  why: string;
}
export interface RemediationCard {
  stage: "Pre-processing" | "In-processing" | "Post-processing";
  actions: string[];
}
export interface RiskResult {
  sa_tier: SaTier;
  eu_classification: string;
  eu_annex_category: string | null;
  ibm_bias_scores: BiasScore[];
  sa_pillar_alignment: PillarAlignment[];
  triggered_obligations: Obligation[];
  rationale: RationaleItem[];
  remediation: RemediationCard[];
  executive_summary: string;
}

const HIGH_RISK_DOMAINS: Record<string, string> = {
  employment: "Annex III(4) — Employment, workers management and access to self-employment",
  education: "Annex III(3) — Education and vocational training",
  welfare: "Annex III(5) — Access to essential public services and benefits",
  "financial services": "Annex III(5)(b) — Creditworthiness and credit scoring",
  policing: "Annex III(6) — Law enforcement",
  migration: "Annex III(7) — Migration, asylum and border control",
  justice: "Annex III(8) — Administration of justice and democratic processes",
  healthcare: "Annex III(5) — Access to essential (health) services",
};

function asBool(v: unknown): boolean {
  return v === true || v === "true";
}
function asArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}
function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function classify(answers: Answers): RiskResult {
  const domain = asStr(answers.decision_domain).toLowerCase();
  const publicAuthority = asBool(answers.public_authority);
  const biometric = asBool(answers.biometric);
  const sensitive = asBool(answers.sensitive_data);
  const children = asBool(answers.children_vulnerable);
  const euReach = asBool(answers.eu_reach);
  const humanReview = asStr(answers.human_review); // always|flagged|on_request|none
  const rights = asArray(answers.rights_affected);
  const populations = asArray(answers.affected_populations);
  const complaints = asBool(answers.complaints);
  const concerns = asStr(answers.known_concerns).trim();

  const rationale: RationaleItem[] = [];
  const obligations: Obligation[] = [];
  const seenObligations = new Set<string>();
  const addObligation = (o: Obligation) => {
    if (!seenObligations.has(o.ref)) {
      seenObligations.add(o.ref);
      obligations.push(o);
    }
  };

  // ---------- EU AI Act classification ----------
  let euClassification = "Minimal risk";
  let euAnnex: string | null = null;

  const prohibitedTrigger = biometric && domain === "policing";
  if (prohibitedTrigger) {
    euClassification = "Potentially prohibited or strictly restricted (Article 5)";
    rationale.push({
      rule: "Biometric identification in law enforcement",
      trigger: "Uses facial recognition / biometrics in a policing context",
      framework: "EU AI Act Article 5",
      explanation:
        "Real-time remote biometric identification in public spaces for law enforcement is banned or strictly restricted in the EU. This is one of the most serious categories.",
      confidence: "High",
      recommendation:
        "Confirm whether the use is real-time and in public spaces. If so, it is likely prohibited; seek legal advice before any EU deployment.",
    });
    addObligation({
      ref: "EU Art.5",
      title: "Check Article 5 prohibitions",
      why: "Biometric use in policing may be banned in the EU.",
    });
  } else if (HIGH_RISK_DOMAINS[domain]) {
    euClassification = "High-risk (Article 6 and Annex III)";
    euAnnex = HIGH_RISK_DOMAINS[domain];
    rationale.push({
      rule: "High-risk domain",
      trigger: `Decision domain is "${domain}"`,
      framework: "EU AI Act Article 6 and Annex III",
      explanation:
        "Systems used in this area are listed as high-risk in the EU AI Act because they can significantly affect people's rights and access to services.",
      confidence: "High",
      recommendation:
        "Treat as high-risk: complete risk management (Art.9), data governance (Art.10), human oversight (Art.14) and a Fundamental Rights Impact Assessment (Art.27).",
    });
    ["Art.9", "Art.10", "Art.13", "Art.14", "Art.15", "Art.27"].forEach((a) =>
      addObligation({
        ref: `EU ${a}`,
        title: euObligationTitle(a),
        why: "Required for high-risk AI systems.",
      })
    );
  } else if (domain) {
    euClassification = "Limited risk — transparency obligations (Article 50)";
    rationale.push({
      rule: "Limited-risk default",
      trigger: "Interacts with people but not in a listed high-risk area",
      framework: "EU AI Act Article 50",
      explanation:
        "People should be told when they are interacting with an AI system or AI-generated content.",
      confidence: "Medium",
      recommendation: "Provide clear disclosure that AI is in use.",
    });
    addObligation({
      ref: "EU Art.50",
      title: "Transparency to users",
      why: "Tell people they are dealing with AI.",
    });
  }

  if (euReach && euClassification !== "Minimal risk") {
    rationale.push({
      rule: "EU extraterritorial reach",
      trigger: "The system, provider, deployer or output reaches the EU",
      framework: "EU AI Act (territorial scope)",
      explanation:
        "Because the system reaches the EU market or EU users, EU AI Act duties can apply even though you are based outside the EU.",
      confidence: "High",
      recommendation: "Check EU implementation deadlines and assign an EU responsible person if required.",
    });
  }

  // ---------- SA Draft AI Policy tier ----------
  let saTier: SaTier = "Low";
  if (prohibitedTrigger) {
    saTier = "Unacceptable";
    rationale.push({
      rule: "Unacceptable-risk practice",
      trigger: "Biometric identification in policing",
      framework: "SA Draft AI Policy — risk tiers",
      explanation:
        "Mass biometric surveillance raises the most serious rights concerns and would sit at the top of the risk scale.",
      confidence: "Medium",
      recommendation: "Do not proceed without a strong legal basis, oversight and public justification.",
    });
  } else {
    const highFactors: string[] = [];
    if (HIGH_RISK_DOMAINS[domain]) highFactors.push(`high-impact domain (${domain})`);
    if (publicAuthority) highFactors.push("used by a public authority");
    if (sensitive) highFactors.push("uses sensitive personal information");
    if (children) highFactors.push("affects children or vulnerable people");
    if (humanReview === "none") highFactors.push("no human review");

    if (highFactors.length >= 1) {
      saTier = highFactors.length >= 2 ? "High" : "Medium";
      rationale.push({
        rule: "Rights-impact risk factors",
        trigger: highFactors.join("; "),
        framework: "SA Draft AI Policy — risk tiers",
        explanation:
          "These factors increase the chance of harm to people's rights and access to services, raising the risk tier.",
        confidence: "Medium",
        recommendation:
          saTier === "High"
            ? "Apply strong safeguards: human oversight, bias testing, documentation and an impact assessment."
            : "Apply reasonable safeguards and monitor outcomes for affected groups.",
      });
    } else {
      rationale.push({
        rule: "Low-risk default",
        trigger: "No major rights-impact factors identified",
        framework: "SA Draft AI Policy — risk tiers",
        explanation: "The system shows few high-risk factors based on your answers.",
        confidence: "Medium",
        recommendation: "Keep light-touch oversight and review if the use changes.",
      });
    }
  }

  // SA-specific obligations
  if (humanReview === "none" || humanReview === "on_request") {
    addObligation({
      ref: "POPIA s.71",
      title: "Automated decision-making (POPIA s.71)",
      why: "People can object to decisions based solely on automated processing.",
    });
  }
  if (publicAuthority) {
    addObligation({
      ref: "PAIA",
      title: "Access to information (PAIA)",
      why: "The public can request records about how the system works.",
    });
  }
  if (sensitive || populations.length > 0) {
    addObligation({
      ref: "PEPUDA",
      title: "Equality (PEPUDA / Constitution s.9)",
      why: "Unfair discrimination against protected groups is prohibited.",
    });
  }
  addObligation({
    ref: "AIA",
    title: "Conduct an Algorithmic Impact Assessment",
    why: "Document risks, mitigations and oversight (built in the AIA/FRIA module).",
  });

  // ---------- IBM eight bias types ----------
  const lowOversight = humanReview === "none" || humanReview === "on_request";
  const histDomain = ["employment", "policing", "financial services", "welfare", "justice"].includes(domain);
  const ibm: BiasScore[] = [
    {
      type: "Algorithm bias",
      level: lowOversight ? "High" : "Medium",
      note: lowOversight
        ? "Limited human oversight increases the chance that model errors go unchecked."
        : "Human oversight is present; keep monitoring model behaviour.",
    },
    {
      type: "Cognitive bias",
      level: humanReview === "always" ? "Medium" : "Low",
      note: "Where people review outputs, their own assumptions can influence decisions; provide guidance and training.",
    },
    {
      type: "Confirmation bias",
      level: complaints || concerns ? "High" : "Low",
      note: complaints || concerns
        ? "Existing concerns or complaints suggest patterns may be reinforced; investigate them."
        : "No known concerns reported yet; revisit as evidence is gathered.",
    },
    {
      type: "Exclusion bias",
      level: populations.length >= 3 ? "High" : populations.length > 0 ? "Medium" : "Low",
      note: populations.length
        ? "Several groups may be affected; check they are properly represented in the data."
        : "Identify which groups could be under-represented.",
    },
    {
      type: "Measurement bias",
      level: sensitive ? "High" : "Medium",
      note: sensitive
        ? "Sensitive attributes or their proxies can be measured unfairly across groups."
        : "Check that features measure the same thing fairly for everyone.",
    },
    {
      type: "Out-group homogeneity bias",
      level: populations.length >= 2 ? "Medium" : "Low",
      note: "Minority groups can be treated as 'all the same'; test performance per group.",
    },
    {
      type: "Prejudice bias",
      level: sensitive && histDomain ? "High" : histDomain ? "Medium" : "Low",
      note: histDomain
        ? "Historical inequality in this domain can be learned from past data."
        : "Lower historical-bias exposure, but still review training data.",
    },
    {
      type: "Deployment bias",
      level: lowOversight ? "High" : "Medium",
      note: "The system may be used differently from how it was designed; monitor real-world use.",
    },
  ];

  // ---------- SA six pillars ----------
  const pillars: PillarAlignment[] = [
    {
      pillar: "Capacity and talent",
      status: "Needs attention",
      note: "Ensure staff understand the system and how to challenge it.",
    },
    {
      pillar: "Inclusive growth and jobs",
      status: domain === "employment" ? "Needs attention" : "Addressed",
      note: domain === "employment"
        ? "Employment screening must not unfairly exclude groups."
        : "No direct employment-access concern identified.",
    },
    {
      pillar: "Responsible governance",
      status: lowOversight ? "Gap" : "Needs attention",
      note: lowOversight
        ? "Strengthen oversight, accountability and record-keeping."
        : "Oversight exists; document it clearly.",
    },
    {
      pillar: "Ethical and inclusive AI",
      status: sensitive || populations.length ? "Gap" : "Needs attention",
      note: "Test for fairness across the affected groups you identified.",
    },
    {
      pillar: "Cultural preservation",
      status: "Needs attention",
      note: "Check the system works fairly across South African languages and contexts.",
    },
    {
      pillar: "Human-centred deployment",
      status: humanReview === "none" ? "Gap" : "Addressed",
      note: humanReview === "none"
        ? "Add a meaningful human-in-the-loop and a way to appeal."
        : "A human review path exists.",
    },
  ];

  // ---------- IBM three-stage remediation ----------
  const remediation: RemediationCard[] = [
    {
      stage: "Pre-processing",
      actions: [
        "Improve dataset quality and check for missing data.",
        "Check the data represents all affected groups fairly.",
        "Rebalance or resample where groups are under-represented.",
      ],
    },
    {
      stage: "In-processing",
      actions: [
        "Apply fairness constraints during model training.",
        "Review the model's objective so it does not optimise unfairly.",
        "Watch for proxies that stand in for protected attributes.",
      ],
    },
    {
      stage: "Post-processing",
      actions: [
        "Adjust decision thresholds to reduce group disparities.",
        "Add or strengthen human review for affected decisions.",
        "Monitor appeals and reversals, and document every change.",
      ],
    },
  ];

  // ---------- Executive summary ----------
  const executive_summary = buildSummary(saTier, euClassification, domain, populations);

  return {
    sa_tier: saTier,
    eu_classification: euClassification,
    eu_annex_category: euAnnex,
    ibm_bias_scores: ibm,
    sa_pillar_alignment: pillars,
    triggered_obligations: obligations,
    rationale,
    remediation,
    executive_summary,
  };
}

function euObligationTitle(a: string): string {
  const map: Record<string, string> = {
    "Art.9": "Risk management system (Art.9)",
    "Art.10": "Data and data governance (Art.10)",
    "Art.13": "Transparency to deployers (Art.13)",
    "Art.14": "Human oversight (Art.14)",
    "Art.15": "Accuracy, robustness and security (Art.15)",
    "Art.27": "Fundamental Rights Impact Assessment (Art.27)",
  };
  return map[a] ?? a;
}

function buildSummary(
  saTier: SaTier,
  eu: string,
  domain: string,
  populations: string[]
): string {
  const who = populations.length
    ? ` It may affect ${populations.slice(0, 3).join(", ")}${populations.length > 3 ? " and others" : ""}.`
    : "";
  return (
    `Based on the answers provided, this system is assessed as ${saTier} risk under the South African Draft AI Policy and "${eu}" under the EU AI Act` +
    (domain ? `, in the ${domain} domain.` : ".") +
    who +
    " The classifications below are generated from transparent rules and can be reviewed and edited before export."
  );
}
