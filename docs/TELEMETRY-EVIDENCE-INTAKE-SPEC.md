# BiasLens Telemetry & Operational Evidence Intake Specification

**Version:** 0.1  
**Date:** 21 August 2026  
**Status:** Design specification — implementation boundary established, ingestion endpoint not yet enabled  
**Owner:** BeAccessible / BiasLens

## 1. Purpose

BiasLens needs to assess not only documentation about an AI system, but also evidence produced while that system operates. This specification defines how operational evidence may enter BiasLens without turning BiasLens into a telemetry platform, employee-monitoring system, or runtime execution engine.

BiasLens is the **evidence and bias-intelligence consumer**. Source systems remain responsible for generating their own logs, metrics, monitoring signals, incident records and runtime events.

## 2. Design boundary

BiasLens may ingest or reference:

- model/version metadata;
- aggregated performance metrics;
- subgroup outcome metrics;
- validation and test results;
- incident records;
- drift or monitoring summaries;
- human-review and override summaries;
- complaint and appeal aggregates;
- policy or model-change events;
- vendor assurance evidence;
- execution receipts or equivalent outcome records from external governance layers.

BiasLens must not become:

- an employee productivity-monitoring tool;
- a covert surveillance system;
- an individual worker or applicant scoring system;
- a raw event lake containing unnecessary person-level data;
- the authoritative runtime ALLOW/BLOCK engine;
- a substitute for the source system's operational monitoring.

## 3. Intake modes

BiasLens should support three intake modes, in this order:

1. **Manual evidence intake** — assessor uploads a file or records a source reference.
2. **Structured batch intake** — CSV or JSON containing aggregated operational evidence.
3. **API intake** — authenticated machine-to-machine submission of validated evidence envelopes.

The first implementation should prioritise structured batch intake because it is easier to inspect, validate and govern before real-time integrations are introduced.

## 4. Normalised evidence envelope

Every structured operational evidence item should be normalised to an envelope with the following fields.

### 4.1 Required fields

| Field | Meaning |
|---|---|
| `evidence_id` | Unique identifier for the evidence item. |
| `assessment_id` | BiasLens assessment this evidence belongs to. |
| `source_system` | System or service that produced the evidence. |
| `source_type` | Category such as telemetry, validation, incident, audit, complaint, human_review or execution_receipt. |
| `system_version` | Model/system version relevant to the evidence. |
| `observed_at` | Time the source event or measurement occurred. |
| `captured_at` | Time the evidence was captured for BiasLens. |
| `metric_or_event` | Plain-language name of the metric, event or evidence object. |
| `value` | Numeric, categorical or structured result. |
| `unit` | Unit where applicable. |
| `evidence_state` | Established, Derived, Inferred, Unknown or Conflicted. |
| `provenance` | Source and lineage information sufficient to trace the evidence. |

### 4.2 Strongly recommended fields

| Field | Meaning |
|---|---|
| `source_uri` | Link or stable reference to the source evidence. |
| `method` | How the metric or result was produced. |
| `population_definition` | Population covered by the measurement. |
| `aggregation_level` | Overall, subgroup, cohort, period or other aggregation. |
| `sample_size` | Number of observations where applicable. |
| `validation_status` | Whether the evidence has been checked and by whom. |
| `valid_from` / `valid_to` | Period for which the evidence is applicable. |
| `limitations` | Known exclusions, quality issues or uncertainty. |
| `related_policy_version` | Governance or policy version relevant to the evidence. |

## 5. Provenance requirements

Operational evidence must preserve provenance separately from interpretation.

At minimum, provenance should record:

- source system;
- source owner/provider;
- original identifier;
- creation or observation time;
- capture time;
- transformation history;
- aggregation method;
- validation status;
- validator where applicable;
- source reference or URI;
- checksum or integrity reference where feasible;
- system/model version;
- relevant policy or configuration version.

BiasLens findings may interpret this evidence, but interpretation must not overwrite the provenance record.

## 6. Evidence State application

The BiasLens Evidence State model applies to operational evidence:

- **Established** — directly supported by checked, sufficiently reliable evidence for the specific claim.
- **Derived** — calculated or logically derived from established evidence with a recorded derivation.
- **Inferred** — a reasonable conclusion but not directly demonstrated by the available evidence.
- **Unknown** — required evidence is missing, insufficient, unavailable or not yet assessed.
- **Conflicted** — material sources disagree or cannot yet be reconciled.

A high model confidence score must never be treated as equivalent to an Established evidence state.

## 7. Privacy and data-minimisation thresholds

BiasLens should default to aggregated evidence.

### 7.1 Default rule

Do not ingest directly identifying person-level telemetry unless it is strictly necessary for a lawful, documented assessment purpose and no lower-risk alternative can meet that purpose.

### 7.2 Preferred evidence form

Use:

- cohort-level metrics;
- subgroup-level metrics;
- rates, counts and distributions;
- de-identified incident categories;
- aggregated human-review outcomes;
- aggregated complaint and appeal patterns.

### 7.3 Small-group protection

Where subgroup data could expose or make individuals reasonably identifiable, the source system should suppress, combine or otherwise protect that subgroup before submission to BiasLens.

The exact suppression threshold must be configurable by jurisdiction, organisational policy and use case; BiasLens should not hard-code one universal number and imply that it is legally sufficient everywhere.

### 7.4 Special-category and sensitive data

Protected-characteristic data may sometimes be necessary to test differential outcomes. When used, the assessment must record:

- why the data is necessary;
- lawful basis or governance authority;
- source and provenance;
- aggregation and access controls;
- retention period;
- who can see the data;
- whether a less intrusive alternative was considered.

## 8. Validation rules

BiasLens should reject or quarantine structured evidence when:

- required fields are missing;
- the assessment identifier is invalid;
- timestamps are malformed;
- the system version is absent where versioning is material;
- the source type is unsupported;
- an Evidence State value is invalid;
- provenance is too incomplete to trace the evidence;
- a source sends prohibited person-level monitoring data outside an approved assessment purpose;
- the evidence format does not match the declared schema version.

Rejected evidence must produce a clear, accessible error explaining what needs correction.

## 9. Source types

Initial source types:

- `telemetry`
- `validation`
- `performance_metric`
- `subgroup_metric`
- `incident`
- `human_review`
- `override`
- `complaint`
- `appeal`
- `audit`
- `vendor_assurance`
- `model_change`
- `policy_change`
- `execution_receipt`
- `other`

## 10. BiasLens processing flow

```text
Operational AI system or governance system
                |
                v
      Structured evidence source
                |
                v
      BiasLens intake validation
                |
     +----------+-----------+
     |                      |
     v                      v
 Accepted               Quarantined
     |                 clear error /
     |                 correction path
     v
 Provenance record
     |
     v
 Evidence State assignment
     |
     v
 Bias / subgroup / governance analysis
     |
     v
 Algorithm Defence File + findings
```

## 11. No automatic execution authority

BiasLens evidence and findings may be consumed by an external execution-control or policy-enforcement system. BiasLens itself does not automatically grant execution authority.

A downstream system may decide to ALLOW, TRANSFORM, DEFER, ESCALATE or BLOCK an action, but that decision belongs to the downstream execution/governance layer and must retain its own provenance and receipt.

## 12. Accessibility and Universal Design requirements

Any intake interface must:

- be fully keyboard operable;
- provide visible focus states;
- use explicit labels and instructions;
- explain validation errors in plain language;
- never communicate validity through colour alone;
- permit correction without forcing users to restart the entire intake process;
- support zoom and responsive reflow;
- minimise repetitive data entry;
- provide downloadable error reports for large batch imports;
- expose machine-readable error locations for assistive and automated workflows.

## 13. Implementation sequence

1. Finalise this schema and provenance vocabulary.
2. Add a downloadable CSV/JSON template.
3. Add server-side parser and validation with no persistence.
4. Test with fictional aggregated data.
5. Add quarantine/review workflow.
6. Add persistence only after the correct BiasLens database and RLS policies are confirmed.
7. Add authenticated API intake only after batch intake is stable.

## 14. Relationship to external architectures

This specification was developed after the 21 August 2026 review recorded in `BIASLENS-PROVENANCE-RECORD.md`. It incorporates general interoperability lessons about provenance, operational telemetry and separation between evidence and execution authority, while retaining BiasLens-specific product boundaries and methodology.
