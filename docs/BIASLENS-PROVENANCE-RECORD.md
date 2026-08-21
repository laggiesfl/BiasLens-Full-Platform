# BiasLens Architectural & Methodology Provenance Record

**Owner:** BeAccessible  
**Product:** BiasLens  
**Record established:** 21 August 2026  
**Purpose:** Maintain a dated, auditable record of BiasLens methodology, architecture, product boundaries, and later external influences.

## 1. Why this record exists

BiasLens is an evidence-led algorithmic accountability and bias-risk platform. This record separates:

1. capabilities and concepts demonstrably present in BiasLens before the external materials listed in section 5 were reviewed;
2. later BiasLens-original developments;
3. externally influenced concepts or terminology;
4. interoperability work that connects BiasLens to external systems without treating those systems as BiasLens IP.

This record is an engineering and methodology provenance record. It is not a legal opinion on patentability, copyright, trade-secret status, priority of invention, or freedom to operate.

## 2. Pre-external-review baseline

The baseline reference for this record is the `main` branch commit:

- **Commit:** `4b74124c12d8293613dd7f700b59101eadae7d91`
- **Commit date:** 18 August 2026
- **Commit message:** `docs: update accessibility statement for BiasLens Guide fixes`

That commit predates the 21 August 2026 review of the external Samirac materials recorded in section 5.

At that baseline, the BiasLens repository already described the product as:

> Evidence-led algorithmic accountability and bias-risk platform by BeAccessible.

The documented product purpose already included:

- distinguishing evidence from assumption;
- documenting uncertainty;
- identifying bias-risk signals;
- maintaining a traceable evidence record;
- avoiding claims that exceed what the evidence proves;
- assessing AI systems, processes, and aggregated outcomes rather than monitoring or scoring individuals;
- producing and explaining an Algorithm Defence File;
- maintaining an authenticated evidence log for each assessment;
- recording AI-system context, affected populations, data sources, oversight, and human review;
- classifying risk and recording rationale, triggered obligations, and remediation;
- keeping assessment evidence separate from the public marketing enquiry pipeline.

The database model already included `evidence_log_entries` with document name, source, request/receipt dates, collection status, legal basis, notes, follow-up date, file path, creator, and timestamps.

The user interface already allowed an assessor to add evidence items, attach files, record sources and dates, track collection status, and maintain a traceable evidence log.

## 3. BiasLens methodology concepts established before 21 August 2026

The following concepts are recorded as pre-existing BiasLens methodology/product characteristics at the baseline above:

### 3.1 Evidence before conclusion
BiasLens is designed to separate what is evidenced from what is asserted, inferred, assumed, missing, or uncertain.

### 3.2 Uncertainty is a legitimate result
BiasLens does not require a false binary conclusion. Missing information and unresolved questions are governance findings in their own right.

### 3.3 One AI system at a time
The core assessment unit is a specific AI system and the decisions it influences, not a generic organisational AI strategy.

### 3.4 Bias pathways and affected groups
BiasLens examines how data, system design, deployment context, governance, and operational practice could create different outcomes for different groups.

### 3.5 Traceable evidence record
BiasLens maintains evidence against an assessment so that claims and findings can be traced to supporting material rather than relying on unsupported narrative.

### 3.6 Human oversight and governance context
The assessment model records oversight arrangements and human review as part of the system profile.

### 3.7 Algorithm Defence File
BiasLens includes the concept of a structured governance evidence file intended to support accountability, scrutiny, and defensible documentation.

### 3.8 Privacy boundary
BiasLens is not designed as employee surveillance, productivity monitoring, or individual scoring. Its documented boundary is system-, process-, and aggregated-outcome assessment.

## 4. Provenance rule for future BiasLens development

Every material methodology or architecture change should be recorded with:

- date introduced;
- BiasLens version or release;
- repository commit or pull request where applicable;
- reason for the change;
- whether the change is BiasLens-original, externally influenced, interoperable, or licensed;
- external source or partner, if any;
- terminology adopted or adapted;
- implementation boundary;
- evidence of testing or validation;
- accessibility impact, if any.

External influence must be attributed without implying that attribution grants implementation, licensing, commercialisation, or other IP rights.

## 5. External influence register

### 21 August 2026 — Samirac / Daisy architecture review

**Materials first reviewed for BiasLens relevance:**

1. `https://synth.samirac.com/article/chronology-matters-the-architecture-before-the-conversation`
2. `https://samirac.com/provenance`
3. `https://www.samirac.com/execution-contract`
4. `https://www.samirac.com/architecture-reference`
5. `https://samirac.com/daisy-demos` — Demo 4 identified as the closest conceptual integration example.

**Conceptual alignment identified:**

- evidence provenance;
- explicit epistemic/evidence state;
- separation of provenance from interpretation;
- operational telemetry as evidence input;
- runtime admissibility and execution control as a distinct layer;
- execution receipts and correction loops.

**BiasLens boundary decision:**

BiasLens will remain the evidence, bias-intelligence, uncertainty, provenance, and governance-record layer. Runtime execution control is treated as a separate specialised layer. BiasLens may provide evidence/risk signals to such a layer through an interoperability contract, but will not reproduce or claim ownership of an external execution-control architecture.

**Implementation decision:**

The following BiasLens enhancements are being developed after this review and must therefore remain explicitly dated as post-review work:

1. formal Evidence State model;
2. structured telemetry/evidence intake specification;
3. BiasLens interoperability contract for machine-readable evidence/risk signals;
4. a controlled runtime-governance integration demonstration.

No source code from the external materials is being copied into BiasLens as part of this work.

## 6. Change register

| Date | Change | Classification | Source / influence | Notes |
|---|---|---|---|---|
| 18 Aug 2026 | Baseline repository state captured at commit `4b74124c...` | Pre-existing BiasLens | BiasLens | Evidence-led assessment, uncertainty, evidence log, affected groups, oversight, risk classification and Algorithm Defence File already present. |
| 21 Aug 2026 | Provenance record established | BiasLens-original governance control | BiasLens + external chronology/provenance review | Creates a durable method for distinguishing pre-existing capabilities from later influences. |
| 21 Aug 2026 | Evidence State enhancement initiated | Externally influenced, BiasLens-specific implementation | Samirac epistemic-state concepts; adapted to BiasLens evidence methodology | Kept distinct from evidence collection status. |
| 21 Aug 2026 | Telemetry/evidence intake specification initiated | Interoperability enhancement | BiasLens pilot requirements + external telemetry architecture review | BiasLens consumes operational evidence; it does not become a telemetry platform. |

## 7. Accessibility and Universal Design provenance

Accessibility and Universal Design are foundational BiasLens product requirements, not later optional enhancements. The repository baseline already documents semantic structure, visible keyboard focus, reflow, explicit form labels and errors, reduced-motion support, and a WCAG 2.2 AAA target where feasible.

Future provenance records must note whether a change affects:

- keyboard operation;
- focus order and visibility;
- screen-reader semantics;
- cognitive load and plain-language comprehension;
- colour-independent communication;
- zoom/reflow and responsive use;
- motion and sensory alternatives;
- error prevention and recovery;
- one-handed and low-effort interaction.

## 8. Maintenance rule

This document should be updated in the same pull request as any material methodology or architecture change. The change register is append-only except for corrections that clearly record what was corrected and why.
