import { createClient } from "@/lib/supabase/server";
import type {
  BiasScore,
  Obligation,
  PillarAlignment,
  RationaleItem,
  RemediationCard,
} from "@/lib/risk/engine";

export interface ReportData {
  assessmentId: string;
  title: string;
  generatedAt: string;
  reviewed: boolean;
  saTier: string;
  euClassification: string;
  euAnnex: string | null;
  executiveSummary: string;
  biasScores: BiasScore[];
  pillars: PillarAlignment[];
  obligations: Obligation[];
  rationale: RationaleItem[];
  remediation: RemediationCard[];
  profile: {
    system_name?: string | null;
    provider?: string | null;
    deployer?: string | null;
    purpose?: string | null;
    decision_domain?: string | null;
    affected_populations?: string[] | null;
  };
}

/**
 * Loads the classification and merges any reviewer overrides into the effective
 * report values. Returns null if no classification has been generated yet.
 */
export async function getReportData(
  assessmentId: string
): Promise<ReportData | null> {
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, title")
    .eq("id", assessmentId)
    .single();
  if (!assessment) return null;

  const { data: rc } = await supabase
    .from("risk_classifications")
    .select("*")
    .eq("assessment_id", assessmentId)
    .single();
  if (!rc) return null;

  const { data: profile } = await supabase
    .from("ai_system_profiles")
    .select("system_name, provider, deployer, purpose, decision_domain, affected_populations")
    .eq("assessment_id", assessmentId)
    .single();

  const ov = (rc.overrides ?? {}) as Record<string, string | null>;

  return {
    assessmentId,
    title: assessment.title,
    generatedAt: rc.generated_at,
    reviewed: rc.reviewed ?? false,
    saTier: ov.sa_tier || rc.sa_tier || "—",
    euClassification: ov.eu_classification || rc.eu_classification || "—",
    euAnnex: rc.eu_annex_category ?? null,
    executiveSummary: ov.executive_summary || rc.executive_summary || "",
    biasScores: (rc.ibm_bias_scores ?? []) as BiasScore[],
    pillars: (rc.sa_pillar_alignment ?? []) as PillarAlignment[],
    obligations: (rc.triggered_obligations ?? []) as Obligation[],
    rationale: (rc.rationale ?? []) as RationaleItem[],
    remediation: (rc.remediation ?? []) as RemediationCard[],
    profile: profile ?? {},
  };
}
