/**
 * BiasLens risk classification engine.
 *
 * Transparent, rule-based. Every classification decision is recorded as a
 * RationaleItem (rule, trigger, framework reference, plain-language explanation,
 * confidence and recommendation) so nothing is unexplained.
 *
 * Two distinct ideas are kept separate on purpose:
 *   - `level`    — how serious the risk would be if it is present.
 *   - `evidence` — how much we actually know. Reporting a concern must never
 *                  make a client look worse than staying silent, or the
 *                  assessment measures candour instead of risk.
 *
 * The findings field is named `fairness_findings`. The taxonomy is grounded in
 * Friedman & Nissenbaum, Bias in Computer Systems, ACM TOIS 14(3), 1996 —
 * preexisting, technical and emergent bias — not in any vendor's material, and
 * the field name now says so. The database keeps a deprecated `ibm_bias_scores`
 * column populated in parallel during the rename; it can be dropped once
 * nothing reads it.
 */

export type Answers = Record<string, string | string[] | boolean | undefined>;
export type Level = "Low" | "Medium" | "High";
export type SaTier = "Unacceptable" | "High" | "Medium" | "Low";

/** How much is actually known about a finding, as distinct from its severity. */
export type Evidence =
  | "Demonstrated"
  | "Credible risk"
  | "Emerging evidence"
  | "Not established";

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
  /** Added: strength of what is known. Optional so older records still render. */
  evidence?: Evidence;
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
  fairness_findings: BiasScore[];
  /**
   * @deprecated Use `fairness_findings`. Carried in parallel during the rename
   * so that files updated in a different order still compile, and so that any
   * caller not yet migrated keeps working. Remove once nothing reads it.
   */
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

/** Annex III education purposes. Delivering content alone is NOT caught. */
const EDUCATION_ANNEX_PURPOSES = [
  "admission",
  "assignment",
  "learning_outcomes",
  "appropriate_level",
  "exam_monitoring",
];

function asBool(v: unknown): boolean {
  return v === true || v === "true";
}
function asArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}
function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}
/** True only when the question was actually answered. Absence is not a "no". */
function answered(v: unknown): boolean {
  return v !== undefined && v !== null && v !== "";
}

export function classify(answers: Answers): RiskResult {
  const domain = asStr(answers.decision_domain).toLowerCase();
  const publicAuthority = asBool(answers.public_authority);
  const biometric = asBool(answers.biometric);
  const sensitive = asBool(answers.sensitive_data);
  const children = asBool(answers.children_vulnerable);
  const euReach = asBool(answers.eu_reach);
  const humanReview = asStr(answers.human_review); // always|flagged|on_request|none
  const populations = asArray(answers.affected_populations);
  const complaints = asBool(answers.complaints);
  const concerns = asStr(answers.known_concerns).trim();

  // Newer questions. Absent until the questionnaire step is added — treated as
  // unknown rather than as a negative answer.
  const emotionInference = asBool(answers.emotion_inference);
  const socialScoring = asBool(answers.social_scoring);
  const profiling = asBool(answers.profiling);
  const educationPurpose = asStr(answers.education_purpose);
  const carriesState = asBool(answers.carries_state);
  const outputsBecomeInputs = asBool(answers.outputs_become_inputs);
  const retraining = asStr(answers.retraining);
  const outcomeMonitoring = asStr(answers.outcome_monitoring);
  const disabilityDataHeld = asStr(answers.disability_data_held);

  const lifecycleAsked =
    answered(answers.carries_state) ||
    answered(answers.outputs_become_inputs) ||
    answered(answers.retraining) ||
    answered(answers.outcome_monitoring);

  const rationale: RationaleItem[] = [];
  const obligations: Obligation[] = [];
  const seenObligations = new Set<string>();
  const addObligation = (o: Obligation) => {
    if (!seenObligations.has(o.ref)) {
      seenObligations.add(o.ref);
      obligations.push(o);
    }
  };

  // ---------- Article 5: prohibited practices ----------
  // Checked FIRST. A prohibited practice must never be reported as merely
  // high-risk, because the correct advice is "this may not be permitted at all",
  // not "complete an impact assessment".
  let prohibited = false;

  const inWorkOrEducation = domain === "employment" || domain === "education";

  if (biometric && domain === "policing") {
    prohibited = true;
    rationale.push({
      rule: "Biometric identification in law enforcement",
      trigger: "Uses facial recognition or other biometrics in a policing context",
      framework: "EU AI Act Article 5(1)(h)",
      explanation:
        "Real-time remote biometric identification in publicly accessible spaces for law enforcement is banned in the EU, apart from narrow exceptions requiring judicial authorisation.",
      confidence: "High",
      recommendation:
        "Establish whether the use is real-time and in a publicly accessible space. If it is, it is likely prohibited. Seek legal advice before any EU deployment.",
    });
    addObligation({
      ref: "EU Art.5",
      title: "Prohibited practice — seek legal advice",
      why: "Biometric identification in policing may be banned outright in the EU.",
    });
  }

  if (emotionInference && inWorkOrEducation && biometric) {
    prohibited = true;
    rationale.push({
      rule: "Emotion inference in the workplace or education",
      trigger: `Infers emotional states from biometric data in a ${domain} context`,
      framework: "EU AI Act Article 5(1)(f)",
      explanation:
        "Using AI to infer the emotions of a person in the workplace or in education institutions is prohibited in the EU, unless it is for medical or safety reasons. Commission guidance states that use during recruitment or a probationary period falls within the prohibition. This has applied since February 2025 and carries the highest penalty tier.",
      confidence: "High",
      recommendation:
        "Do not treat this as a system to be documented. Establish first whether the use is permitted at all. The medical and safety exception is narrow. Seek legal advice before any EU deployment or continuation.",
    });
    addObligation({
      ref: "EU Art.5(1)(f)",
      title: "Prohibited practice — emotion inference at work or in education",
      why: "Prohibited in the EU since February 2025, subject only to a narrow medical or safety exception.",
    });
  } else if (emotionInference && inWorkOrEducation) {
    rationale.push({
      rule: "Emotion inference in the workplace or education, non-biometric",
      trigger: `Infers emotional states in a ${domain} context`,
      framework: "EU AI Act Article 5(1)(f)",
      explanation:
        "Inferring emotions in the workplace or education is prohibited where the system processes biometric data. Commission guidance indicates the prohibition is limited to biometric processing, so a system inferring emotion from text alone may fall outside it. That boundary is contested and fact-specific.",
      confidence: "Indicative",
      recommendation:
        "Establish precisely what data the system processes. If any biometric signal is involved — face, voice, physiological measurement — treat as potentially prohibited and seek legal advice.",
    });
  }

  if (socialScoring && publicAuthority) {
    rationale.push({
      rule: "Social scoring by a public authority",
      trigger: "Scores or classifies people based on behaviour or personal characteristics",
      framework: "EU AI Act Article 5(1)(c)",
      explanation:
        "Social scoring leading to detrimental treatment that is unjustified or disproportionate to the behaviour observed is prohibited in the EU.",
      confidence: "Medium",
      recommendation:
        "Establish what the score is used for and whether any resulting treatment is proportionate and connected to the context in which the data was gathered. Seek legal advice.",
    });
    addObligation({
      ref: "EU Art.5(1)(c)",
      title: "Possible social scoring prohibition",
      why: "Social scoring by public authorities is prohibited in the EU.",
    });
  }

  // ---------- EU AI Act classification ----------
  let euClassification = "Minimal risk";
  let euAnnex: string | null = null;

  if (prohibited) {
    euClassification = "Potentially prohibited (Article 5) — verify before any other step";
  } else if (HIGH_RISK_DOMAINS[domain]) {
    // Education is only Annex III for specific purposes. Delivering training
    // content, without assessing or gating learners, is not caught.
    const educationOutOfScope =
      domain === "education" &&
      answered(answers.education_purpose) &&
      !EDUCATION_ANNEX_PURPOSES.includes(educationPurpose);

    if (educationOutOfScope) {
      euClassification = "Limited risk — transparency obligations (Article 50)";
      rationale.push({
        rule: "Education use outside Annex III purposes",
        trigger: `Education system whose purpose is "${educationPurpose}"`,
        framework: "EU AI Act Annex III(3)",
        explanation:
          "Education is high-risk only for specific purposes: admission or access, assigning people to institutions or programmes, evaluating learning outcomes, assessing the appropriate level of education, and monitoring prohibited behaviour during tests. A system that delivers content without doing any of those is not automatically high-risk.",
        confidence: "Medium",
        recommendation:
          "Confirm the purpose has been described accurately. If the system later begins assessing or gating learners, it must be reassessed.",
      });
    } else {
      euClassification = profiling
        ? "High-risk (Article 6 and Annex III) — profiling, no derogation available"
        : "High-risk (Article 6 and Annex III) — unless the Article 6(3) derogation applies";
      euAnnex = HIGH_RISK_DOMAINS[domain];

      rationale.push({
        rule: "High-risk domain",
        trigger: `Decision domain is "${domain}"`,
        framework: "EU AI Act Article 6 and Annex III",
        explanation:
          "Systems used in this area are listed in Annex III because they can significantly affect people's rights and access to services.",
        confidence: "High",
        recommendation:
          "Treat as high-risk unless a derogation is established and documented. See the Article 6(3) note below.",
      });

      if (profiling) {
        rationale.push({
          rule: "Profiling blocks the Article 6(3) derogation",
          trigger: "The system profiles natural persons",
          framework: "EU AI Act Article 6(3)",
          explanation:
            "An Annex III system that performs profiling of natural persons is always high-risk. The narrow exceptions in Article 6(3) do not apply, however limited or preparatory the task appears.",
          confidence: "High",
          recommendation:
            "Proceed on the basis that this is high-risk. Complete risk management (Art.9), data governance (Art.10), human oversight (Art.14) and a Fundamental Rights Impact Assessment (Art.27).",
        });
      } else {
        rationale.push({
          rule: "Article 6(3) derogation must be considered",
          trigger: "Annex III system, profiling not reported",
          framework: "EU AI Act Article 6(3)",
          explanation:
            "An Annex III system is not high-risk where it poses no significant risk of harm — including by not materially influencing the outcome of decision-making — and it performs only a narrow procedural task, improves the result of completed human work, detects patterns without replacing human assessment, or performs a preparatory task. Whether that applies here has not been established.",
          confidence: "Medium",
          recommendation:
            "Assess each Article 6(3) condition against this system and record the reasoning. If the derogation is relied on, it must be documented before the system is placed on the market, and the system must still be registered in the EU database. Relying on the derogation without documenting it is worse than not relying on it. This is a legal judgement and should be confirmed by a qualified adviser.",
        });
      }

      ["Art.9", "Art.10", "Art.13", "Art.14", "Art.15", "Art.27"].forEach((a) =>
        addObligation({
          ref: `EU ${a}`,
          title: euObligationTitle(a),
          why: "Required for high-risk AI systems, unless a documented Article 6(3) derogation applies.",
        })
      );
    }
  } else if (domain) {
    euClassification = "Limited risk — transparency obligations (Article 50)";
    rationale.push({
      rule: "Limited-risk default",
      trigger: "Interacts with people but not in a listed high-risk area",
      framework: "EU AI Act Article 50",
      explanation:
        "Article 50 sets separate transparency duties for systems that interact with people, generate synthetic content, or infer emotions. Each has its own exceptions, so they should be assessed individually rather than as a single test.",
      confidence: "Medium",
      recommendation:
        "Assess each Article 50 limb separately, including the exceptions for context being obvious and for assistive editing.",
    });
    addObligation({
      ref: "EU Art.50",
      title: "Transparency to users",
      why: "Tell people they are dealing with AI, subject to the Article 50 exceptions.",
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
      recommendation:
        "Check current EU implementation dates and assign an EU responsible person if required. Deadlines have moved and should be verified rather than assumed.",
    });
  }

  // ---------- SA Draft AI Policy tier ----------
  let saTier: SaTier = "Low";
  if (prohibited) {
    saTier = "Unacceptable";
    rationale.push({
      rule: "Unacceptable-risk practice",
      trigger: "A practice prohibited under EU AI Act Article 5 is present",
      framework: "SA Draft AI Policy — risk tiers",
      explanation:
        "Practices banned in the EU raise the most serious rights concerns and sit at the top of the risk scale under any framework.",
      confidence: "Medium",
      recommendation:
        "Do not proceed without a strong legal basis, oversight and public justification. Establish lawfulness before designing controls.",
    });
  } else {
    const highFactors: string[] = [];
    if (HIGH_RISK_DOMAINS[domain]) highFactors.push(`high-impact domain (${domain})`);
    if (publicAuthority) highFactors.push("used by a public authority");
    if (sensitive) highFactors.push("uses sensitive personal information");
    if (children) highFactors.push("affects children or vulnerable people");
    if (humanReview === "none") highFactors.push("no human review");
    if (carriesState && humanReview !== "always")
      highFactors.push("earlier decisions influence later ones without full human review");

    if (highFactors.length >= 1) {
      saTier = highFactors.length >= 2 ? "High" : "Medium";
      rationale.push({
        rule: "Rights-impact risk factors",
        trigger: highFactors.join("; "),
        framework: "SA Draft AI Policy — risk tiers",
        explanation:
          "These factors increase the chance of harm to people's rights and access to services, raising the risk tier. Factors are counted rather than weighted, which is deliberate: weighting them would imply a precision the evidence does not yet support.",
        confidence: "Medium",
        recommendation:
          saTier === "High"
            ? "Apply strong safeguards: human oversight, bias testing, documentation and an impact assessment."
            : "Apply reasonable safeguards and monitor outcomes for affected groups.",
      });
    } else {
      rationale.push({
        rule: "Low-risk default",
        trigger: "No major rights-impact factors identified in the answers given",
        framework: "SA Draft AI Policy — risk tiers",
        explanation:
          "Few high-risk factors were identified from the answers provided. This reflects what was reported, not an independent verification of the system.",
        confidence: "Medium",
        recommendation: "Keep light-touch oversight and reassess if the use changes.",
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

  // ---------- Bias findings ----------
  // Grounded in Friedman & Nissenbaum (1996): preexisting, technical, emergent.
  //
  // `level` is severity if present. `evidence` is what is actually known.
  // Identifying affected groups or reporting complaints must NEVER raise the
  // risk level — that would penalise honesty and make the assessment measure
  // candour rather than risk. Those answers set scope and evidence instead.
  const lowOversight = humanReview === "none" || humanReview === "on_request";
  const histDomain = ["employment", "policing", "financial services", "welfare", "justice"].includes(domain);
  const scopeKnown = populations.length > 0;

  const findings: BiasScore[] = [
    {
      type: "Algorithm bias (technical)",
      level: lowOversight ? "High" : "Medium",
      evidence: "Credible risk",
      note: lowOversight
        ? "Limited human oversight increases the chance that model errors go unchecked."
        : "Human oversight is present; keep monitoring model behaviour. Medium is the floor for this finding — residual risk does not reach zero while a model is making or supporting decisions.",
    },
    {
      type: "Cognitive bias (human-AI interaction)",
      level: humanReview === "always" ? "Medium" : "Low",
      evidence: "Credible risk",
      note: "Where people review outputs, their own assumptions can influence decisions. Provide guidance, training, and a way to record why an override was made.",
    },
    {
      type: "Confirmation bias (technical)",
      level: "Medium",
      evidence: complaints || concerns ? "Demonstrated" : "Not established",
      note:
        complaints || concerns
          ? "Concerns or complaints have been reported. That is evidence to investigate, not a mark against you — reporting it is what allows it to be examined."
          : "No concerns have been reported. That is not the same as no concerns existing, and it does not indicate low risk. It means nothing has yet been established either way.",
    },
    {
      type: "Exclusion bias (preexisting)",
      level: histDomain ? "High" : "Medium",
      evidence: scopeKnown ? "Credible risk" : "Not established",
      note: scopeKnown
        ? `Assessment scope covers ${populations.length} identified group${populations.length === 1 ? "" : "s"}. Naming them does not make the system riskier — it makes the assessment able to check them.`
        : "No affected groups have been identified, so no group can be checked. Until they are named, exclusion cannot be assessed.",
    },
    {
      type: "Measurement bias (technical)",
      level: sensitive ? "High" : "Medium",
      evidence: "Credible risk",
      note: sensitive
        ? "Sensitive attributes, or features that stand in for them, can be measured unfairly across groups."
        : "Check that each feature measures the same thing fairly for everyone. Medium is the floor for this finding.",
    },
    {
      type: "Out-group homogeneity (preexisting)",
      level: "Medium",
      evidence: scopeKnown ? "Credible risk" : "Not established",
      note: "Smaller groups can be treated as though everyone in them is the same. Test performance separately for each group rather than in aggregate.",
    },
    {
      type: "Prejudice bias (preexisting)",
      level: sensitive && histDomain ? "High" : histDomain ? "Medium" : "Low",
      evidence: histDomain ? "Credible risk" : "Not established",
      note: histDomain
        ? "Historical inequality in this domain can be learned from past data."
        : "Lower historical-bias exposure, but training data should still be reviewed.",
    },
    {
      type: "Deployment bias (emergent)",
      level: lowOversight ? "High" : "Medium",
      evidence: "Credible risk",
      note: "The system may be used differently from how it was designed. Monitor real-world use, and reassess if it starts being used for a decision it was not assessed for. Medium is the floor for this finding.",
    },
    {
      type: "Emergent bias (emergent)",
      level: emergentLevel(carriesState, outputsBecomeInputs, retraining, outcomeMonitoring, lowOversight),
      evidence: lifecycleAsked ? "Emerging evidence" : "Not established",
      note: emergentNote(
        lifecycleAsked,
        carriesState,
        outputsBecomeInputs,
        retraining,
        outcomeMonitoring,
        disabilityDataHeld
      ),
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
      status: sensitive || scopeKnown ? "Gap" : "Needs attention",
      note: "Test for fairness across the affected groups identified, and record what could not be tested and why.",
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

  // ---------- Remediation ----------
  const remediation: RemediationCard[] = [
    {
      stage: "Pre-processing",
      actions: [
        "Improve dataset quality and check for missing data.",
        "Check the data represents all affected groups fairly.",
        "Rebalance or resample where groups are under-represented.",
        "Record which groups cannot be checked because the data does not exist.",
      ],
    },
    {
      stage: "In-processing",
      actions: [
        "Apply fairness constraints during model training.",
        "Review the model's objective so it does not optimise unfairly.",
        "Watch for proxies that stand in for protected attributes.",
        "Establish whether earlier decisions influence later ones, and whether that is intended.",
      ],
    },
    {
      stage: "Post-processing",
      actions: [
        "Adjust decision thresholds to reduce group disparities.",
        "Add or strengthen human review for affected decisions.",
        "Monitor appeals, reversals and override patterns, and document every change.",
        "Agree in advance the point at which the system would be paused.",
      ],
    },
  ];

  const executive_summary = buildSummary(saTier, euClassification, domain, populations, prohibited);

  return {
    sa_tier: saTier,
    eu_classification: euClassification,
    eu_annex_category: euAnnex,
    fairness_findings: findings,
    ibm_bias_scores: findings, // deprecated alias — see RiskResult
    sa_pillar_alignment: pillars,
    triggered_obligations: obligations,
    rationale,
    remediation,
    executive_summary,
  };
}

/**
 * Emergent bias: bias that develops through use rather than being inherited
 * from training data. The strongest single signal is whether the system carries
 * state between decisions — a system that updates its impressions as it works
 * through a batch can form associations from very few examples, with no
 * retraining and no feedback loop at all.
 */
function emergentLevel(
  carriesState: boolean,
  outputsBecomeInputs: boolean,
  retraining: string,
  outcomeMonitoring: string,
  lowOversight: boolean
): Level {
  let signals = 0;
  if (carriesState) signals += 2;
  if (outputsBecomeInputs) signals += 2;
  if (retraining === "supplier_without_notice") signals += 1;
  if (outcomeMonitoring === "no") signals += 1;
  if (lowOversight) signals += 1;

  if (signals >= 4) return "High";
  if (signals >= 2) return "Medium";
  return "Low";
}

function emergentNote(
  asked: boolean,
  carriesState: boolean,
  outputsBecomeInputs: boolean,
  retraining: string,
  outcomeMonitoring: string,
  disabilityDataHeld: string
): string {
  if (!asked) {
    return "Not yet assessed. Emergent bias develops through use rather than being inherited from training data, and it is not detectable from a description of the system alone.";
  }
  const parts: string[] = [];
  if (carriesState) {
    parts.push(
      "Earlier decisions influence later ones. Research published in 2026 found that models can form exclusions from a single unfavourable example, almost immediately, with no retraining involved. This is the strongest signal on this finding."
    );
  }
  if (outputsBecomeInputs) {
    parts.push("The system's own outputs are reused as data, which can make an early pattern self-reinforcing.");
  }
  if (retraining === "supplier_without_notice") {
    parts.push("The supplier can change the system without notice, so an assessment may cease to describe the system in use.");
  }
  if (outcomeMonitoring === "no") {
    parts.push("Outcomes are not monitored by group, so a pattern developing after deployment would not be seen.");
  }
  if (disabilityDataHeld === "no" || disabilityDataHeld === "not_lawful") {
    parts.push(
      "No disability data is held, so outcome monitoring cannot detect disparity affecting disabled people in this system. Absence of evidence is not evidence of absence. Disability impact must be assessed by examining what the system filters on rather than by measuring outcomes."
    );
  }
  if (!parts.length) {
    parts.push("No strong emergent-bias signals were reported. Reassess if the system begins to learn from use, or is used for a decision it was not assessed for.");
  }
  return parts.join(" ");
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
  populations: string[],
  prohibited: boolean
): string {
  if (prohibited) {
    return (
      "This assessment has identified a practice that may be prohibited outright under Article 5 of the EU AI Act. " +
      "Before any further work on documentation or safeguards, establish whether the use is permitted at all. " +
      "Prohibited practices carry the highest penalty tier and have applied since February 2025. " +
      "This is a legal question and should be put to a qualified adviser."
    );
  }
  const who = populations.length
    ? ` The assessment covers ${populations.slice(0, 3).join(", ")}${populations.length > 3 ? " and others" : ""}.`
    : "";
  return (
    `Based on the answers provided, this system is assessed as ${saTier} risk under the South African Draft AI Policy and "${eu}" under the EU AI Act` +
    (domain ? `, in the ${domain} domain.` : ".") +
    who +
    " These classifications are generated from transparent rules and can be reviewed and edited before export." +
    " They describe identified risks at a point in time, based on the information given. They do not certify that the system is unbiased, and they do not remain valid indefinitely."
  );
}
