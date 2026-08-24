# BiasLens Interoperability Contract

**Version:** 0.1  
**Date:** 21 August 2026  
**Status:** Design contract — advisory evidence signal only  
**Owner:** BeAccessible / BiasLens

## 1. Purpose

This contract defines a stable boundary through which BiasLens may provide evidence and bias-intelligence signals to another governance, policy, workflow or execution-control system.

The contract is deliberately narrow. BiasLens reports what the evidence supports, what remains uncertain, where material conflicts exist and whether human review or further evidence is needed. A downstream system remains responsible for deciding whether an action may execute.

## 2. Core principle

**BiasLens does not issue runtime execution authority.**

A receiving system must not interpret a BiasLens signal as an automatic legal, technical or operational permission to execute an AI action.

## 3. Contract envelope

A BiasLens interoperability signal contains:

| Field | Purpose |
|---|---|
| `contract_version` | Version of this contract. |
| `signal_id` | Unique identifier for the exported signal. |
| `generated_at` | Time BiasLens generated the signal. |
| `assessment_id` | BiasLens assessment that produced the signal. |
| `system_name` | AI system being assessed. |
| `system_version` | Model/system version if known and material. |
| `decision_context` | Decision or process the AI system influences. |
| `evidence_summary` | Counts and material findings by Evidence State. |
| `bias_risk_signals` | Evidence-grounded bias-risk signals, each with rationale and provenance references. |
| `unresolved_unknowns` | Material evidence gaps. |
| `material_conflicts` | Evidence conflicts requiring resolution. |
| `human_review` | Whether human review is recommended or required by the assessment logic/policy context. |
| `freshness` | Whether material evidence remains within its applicable validity period. |
| `provenance_refs` | References to the evidence objects supporting the signal. |
| `limitations` | Important boundaries on interpretation. |
| `advisory_disposition` | BiasLens-specific evidence posture, not an execution command. |

## 4. Evidence summary

The summary reports the number of material evidence items classified as:

- `established`
- `derived`
- `inferred`
- `unknown`
- `conflicted`

Counts alone do not determine the outcome. One material Unknown or Conflicted item may be more important than many Established items.

## 5. Bias-risk signal object

Each risk signal should contain:

- `signal_code` — stable machine-readable identifier;
- `title` — concise plain-language name;
- `description` — what was observed;
- `affected_groups` — groups potentially affected, where supported;
- `evidence_state` — state of the evidence supporting the signal;
- `materiality` — low, medium, high or critical for the assessed context;
- `provenance_refs` — evidence identifiers supporting the signal;
- `limitations` — what prevents stronger conclusions;
- `recommended_next_action` — evidence, testing, review or remediation action.

A risk signal must not state that discrimination or unlawful conduct is proven unless the evidence and appropriate legal analysis support that conclusion.

## 6. Advisory disposition

BiasLens uses the following evidence postures:

- `sufficient_for_current_purpose` — evidence is sufficiently established for the specific assessed purpose, subject to recorded limitations;
- `conditions_required` — evidence supports proceeding only if specified evidence/governance conditions are satisfied;
- `human_review_required` — the assessed context requires meaningful human review before consequential use;
- `insufficient_evidence` — material Unknown or weak evidence prevents a defensible conclusion;
- `conflict_requires_resolution` — material evidence sources conflict and should be resolved before reliance;
- `escalation_recommended` — the evidence indicates a material governance, rights or bias concern requiring escalation.

These values are advisory BiasLens evidence postures. They are intentionally not named `ALLOW` or `BLOCK` because BiasLens is not the runtime authority layer.

## 7. Example signal

```json
{
  "contract_version": "0.1",
  "signal_id": "bls_example_001",
  "generated_at": "2026-08-21T09:00:00+02:00",
  "assessment_id": "fictional-assessment",
  "system_name": "Fictional Candidate Screening System",
  "system_version": "3.2",
  "decision_context": "Supports recruitment shortlisting",
  "evidence_summary": {
    "established": 4,
    "derived": 1,
    "inferred": 2,
    "unknown": 2,
    "conflicted": 1
  },
  "bias_risk_signals": [
    {
      "signal_code": "DISABILITY_OUTCOME_EVIDENCE_GAP",
      "title": "Disability outcome evidence is incomplete",
      "description": "The available validation material does not establish outcome performance for disabled applicants.",
      "affected_groups": ["disabled applicants"],
      "evidence_state": "unknown",
      "materiality": "high",
      "provenance_refs": ["ev_validation_report_01"],
      "limitations": "No sufficiently granular aggregated disability outcome analysis was supplied.",
      "recommended_next_action": "Obtain or generate accessible, privacy-protected subgroup validation evidence."
    }
  ],
  "unresolved_unknowns": [
    "Outcome performance for disabled applicants"
  ],
  "material_conflicts": [
    "Vendor fairness assurance conflicts with incomplete subgroup validation evidence"
  ],
  "human_review": {
    "required": true,
    "reason": "Consequential recruitment use with unresolved material evidence gaps"
  },
  "freshness": {
    "status": "current",
    "checked_at": "2026-08-21T09:00:00+02:00"
  },
  "provenance_refs": [
    "ev_vendor_assurance_01",
    "ev_validation_report_01"
  ],
  "limitations": [
    "Fictional demonstration data",
    "No conclusion of unlawful discrimination is made"
  ],
  "advisory_disposition": "human_review_required"
}
```

## 8. Receiving-system responsibilities

A receiving system must:

- preserve the `signal_id`, contract version and provenance references;
- preserve limitations and Unknown/Conflicted states;
- avoid converting advisory language into stronger claims than BiasLens made;
- apply its own authority, policy, legal and execution rules;
- record the downstream decision separately from the BiasLens signal;
- return or retain an execution/outcome receipt if the integration supports feedback into BiasLens;
- prevent stale signals from being treated as permanently valid.

## 9. Feedback loop

Where supported, downstream systems may return a structured receipt containing:

- BiasLens `signal_id`;
- downstream decision identifier;
- action taken or not taken;
- time of decision;
- policy/version used;
- human reviewer involvement where applicable;
- resulting outcome or later correction;
- provenance reference for the downstream record.

BiasLens may then store the receipt as operational evidence. The receipt does not retroactively alter the original provenance record.

## 10. Privacy boundary

The interoperability contract should carry the least information required for the downstream governance purpose. Prefer evidence identifiers, aggregated group findings and risk signals over person-level records.

## 11. Accessibility and Universal Design

Any human-facing rendering of this contract must:

- expose all state and risk meaning in text;
- avoid colour-only status communication;
- use descriptive labels for evidence posture and limitations;
- retain a logical reading order;
- support keyboard navigation and visible focus;
- provide plain-language explanations alongside machine-readable codes;
- make Unknown and Conflicted states as perceptible as Established states.

## 12. Provenance note

This contract is post-21-August-2026 BiasLens interoperability work and is recorded in `BIASLENS-PROVENANCE-RECORD.md`. It does not reproduce or claim ownership of an external runtime execution architecture.
