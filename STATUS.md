# ULP — Current State (2026-04-23)

An honest map of what is built, what is argued, and what remains conjecture. Epistemic status is named per component. Following the research-repo pattern that specificity in limitations is more authoritative than their omission.

## Snapshot

As of April 2026, ULP sits at a working frontier. The **kernel** (four constitutional requirements) is stable. The **v0 working axioms** are proposed and internally consistent. The **notation** (`n.` and `no` suffixes with position rule) is locked. The **13-tier dimensional ladder** is structurally committed, with tiers 1–8 carrying strong geometric-logical necessity arguments and tiers 9–13 held provisionally on philosophical commitments that could reasonably be constructed otherwise. A **v0 "Graph Core"** implementation path has been identified (sentences as triples, sidestepping internal boxing/closure) — this is the most productive build target.

The **boxing/closure mechanism** is the single largest unresolved foundation-stone. Without a uniqueness proof under arbitrary nesting, ULP strings above trivial complexity cannot be guaranteed unambiguous. The proposed frame-delimiter mechanism (`1^m 0^m` open / `0^m 1^m` close) is promising but needs formal treatment.

Lean 4 formalization has begun: 8 proven theorems covering Layers 0–2 live in `lean/ULP/Basic.lean`. Proof targets P1 (unique parse), P2 (expressive completeness), and P3 (normal form) are named but mostly not yet attempted.

---

## Kernel — Constitutional Requirements

**Status: accepted as the project's constitution; any change requires revising the constitution, not bypassing it.**

- Pure binary alphabet `{0, 1}` only
- Type derived from run-length alone (no external metadata)
- Compositionality: complex meanings built from simple parts
- Self-delimiting, deterministic parsing

If a kernel requirement proves incompatible with the others, it gets revised. The commitment is to the set, not to any one element as dogma.

*Sources: `CLAUDE.md`, `spec/design-criteria.md`*

---

## Axioms (v0 working set)

**Status: proposed. These form the "constitution" that the rest of the system is built to satisfy.**

- **Mark/Cut duality** — you cannot have "two" without a cut. The seed of 0/1.
- **Type = run-length** — typing comes from counts, not external labels.
- **No extra primitives** — no parentheses, commas, variable names, or external metadata; the goal is no symbols beyond `{0, 1}` and their typed interpretations.
- **Alternation rule** — candidate constraint for well-formedness (strings alternate between 1-runs and 0-runs).

*Source: January 2026 whitepaper synthesis.*

---

## Notation

**Status: locked at v0.**

- `n.` = run of `n` ones (n-th order closure / existence / presence)
- `no` = run of `n` zeros (n-th order cut / separation / absence)
- Dot `.` always follows the number (presence substrate marker)
- Circle `o` always follows the number (absence/relation substrate marker)

Strict postfix notation: the number precedes the substrate marker. This is a simple rule that prevents drift across contributors and time.

---

## The 13-Tier Dimensional Ladder

**Status: Tiers 1–8 carry strong geometric/logical necessity arguments. Tiers 9–13 are provisional — they depend on philosophical commitments that could be constructed otherwise.**

The rule: `n` points are geometrically required to define an `(n-1)`-dimensional simplex, so the run-count represents `(n-1)` dimensions of closure or cut.

| Tier | 1-run (closure) | 0-run (cut) | Epistemic Status |
|------|-----------------|-------------|------------------|
| 1 | Unit mark / distinguishable "this" | Distinction (this vs not-this) | Strong |
| 2 | Link / directed adjacency | Orderable separation (A-before-B) | Strong |
| 3 | Loop / region (2D closure) | Inside/outside partition | Strong |
| 4 | Containment volume (nesting) | Container boundary | Strong; `4.` = physical object |
| 5 | Persistence / event | State-slice / transition boundary | Strong; `5o` locked as before-relation |
| 6 | Invariant / rule-closure | Constraint / evidence cut | Strong |
| 7 | Perspective / controller | Self vs non-self boundary | Moderate |
| 8 | Coupling / coalition | Interface cut | Moderate; `8.` = signal/property |
| 9 | Logic / structural category | Categorical exclusion | Provisional — used for negation (domain-relative) |
| 10 | Simulation / model / ontology | Model-space distance | Provisional |
| 11 | Self / indexical center | Subjective distance (me/not-me) | Provisional |
| 12 | Social / intersubjective web | Social distance | Provisional |
| 13 | Unity / integrated whole | Global aspect distinction | Provisional |

The **four-substrate grouping** (Space 1–4, Time/Dynamics 5–7, Information 8–10, Self-Awareness 11–13) is a recent consolidation and should be treated as an interpretive lens rather than a formal claim. The 13-tier structure itself is the current version — earlier iterations had 7, 9, and 10 tiers — and should be read as the latest proposal rather than as settled ontology.

---

## Core Semantic Rules

**Status: working hypotheses. Not yet formally proved unique; being tested via the canonical sentence set.**

- **R1 Individuation**: in `X. k0 Z.`, X is the figure (being individuated); Z is the ground (context/field). The right side contextualizes the left.
- **R2**: `1o` = minimal distinction / default wrapping; `2o+` = metric separation.
- **R3**: `1o` default reading is embedding/inclusion. An abstraction/handle interpretation is kept in reserve for cases requiring it.

---

## Core Constructions (v0 working set)

Each construction below is testable against a canonical sentence set. Status indicates whether the pattern is locked (v0-ready), provisional (works but not fully proved), or deferred (acknowledged gap).

| Construction | Pattern | Status |
|--------------|---------|--------|
| Containment | `4. 1o 1.` — Volume contains Point | Locked |
| Property assignment | `4. 1o 8.` — Object with signal (red apple) | Locked |
| Identity / reference | IDs as run counts ≥ 14; reuse = reference | Locked at v0 |
| Typing assertion | `ID 1o 5.` — ID is an event | Locked |
| Temporal order (before) | `E1 5o E2` — constraint `t(E1) < t(E2)` | Locked (left-to-right = earlier-to-later) |
| Temporal order (after) | swap operands of `5o` | Locked (macro, no new primitive) |
| Negation | `D. 1o X. ; D. 1o P. ; X. 9o P.` — X excluded from P within domain D | Provisional — usable at v0 |
| Discrete number | `1. 2o 1. 2o 1.` ≈ 3 | v0 only |
| Continuous magnitude (π, e, irrationals) | — | Deferred to v1+ (procedural/limit constructions) |
| Boxing / internal closure | Frame delimiter proposal | Uniqueness proof pending |

---

## The v0 "Graph Core" Build Path

**Status: identified as the most productive next target.**

Rather than solving full internal closure first, treat a "sentence" as a single edge: `Node Relation Node`. Complex meaning becomes a **set of sentences** — a graph, not one giant parenthesis-free string. This sidesteps the boxing problem entirely at v0 and defers internal closure to a later compression/expression layer (v1+).

This is the recommended path because it makes ULP **executable** — tokenize by runs, parse sentences as triples, build a graph — without requiring boxing to be solved first.

*Source: January 2026 whitepaper synthesis.*

---

## Proof Targets (Lean 4)

**Status: infrastructure in place; most targets not yet proved.**

| Target | Claim | Status |
|--------|-------|--------|
| P1 | Unique parse: every valid binary string has exactly one parse tree | Foundations in place (Layers 0–2 theorems landed; `Expression.alternating` enforces run-length uniqueness structurally). The P1 theorem itself is not yet stated. |
| P2 | Expressive completeness: every concept in the target ontology is encodable | Not started |
| P3 | Normal form: every expression has a canonical form | Not started |

Current Lean 4 progress: `lean/ULP/Basic.lean` contains 8 proved theorems covering Layer 0 (Undifferentiated), Layer 1 (Aspect/individuation), and Layer 2 (Run, Expression), including a **`binary_is_forced`** theorem that establishes the 0/1 substrate is structurally forced rather than chosen. Toolchain pinned to Lean 4.29.0-rc8 with Mathlib dependency.

---

## Open Problems (compressed)

| # | Problem | Current Approach | Blocking v0? |
|---|---------|------------------|--------------|
| 1 | Boxing / closure uniqueness | Frame-delimiter proposal (`1^m 0^m` open / `0^m 1^m` close with no internal runs ≥ m); uniqueness proof pending | Not blocking v0 (graph core sidesteps); blocks v1 |
| 2 | Identity & handles | v0: IDs as run counts ≥ 14, reference = repetition | Solved at v0 |
| 3 | Continuous magnitude (π, e, irrationals) | Procedural/limit constructions deferred to v1+; v0 supports only finite discrete magnitudes | Not blocking v0 |
| 4 | Negation stability | `9o` domain-relative categorical exclusion | Usable at v0 |
| 5 | ULP ↔ IVNA formal bridge | Gestured at; indexed zeros/infinities may map to dimensional types | Not blocking |
| 6 | 2D visual syntax | Linear strings may never fully capture containment, overlay, simultaneous co-reference | Future work; 2D Writer prototype exists |
| 7 | Alien convergence as formal criterion | Guiding intuition; needs specific provable form | Research program |
| 8 | Proof assistant implementation | Foundation theorems (Layers 0–2) proved in Lean 4; P1 foundations in place but theorem not yet stated; P2/P3 not started | Partially blocking full validation |

For the full treatment of each, see `history/competing-concepts.md` (8 unresolved decision points with taxonomy) and `plan.md` (full 10-phase research plan with Red Team amendment section).

---

## Fragility Markers (explicit)

When reading ULP material, hold these in mind:

- **Tiers 9–13 are less rigorously grounded** than 1–8. The geometric/logical necessity argument thins as we go up the ladder. Treat upper-tier semantics as interpretive scaffolding, not formal necessity.
- **The boxing mechanism is the biggest open frontier.** Without a uniqueness proof under arbitrary nesting, ULP strings above trivial complexity have not been shown unambiguous. The graph-core approach sidesteps this at v0 but does not solve it.
- **Continuous magnitude is not yet solved.** v0 handles finite discrete magnitudes. Representing π, e, and irrationals will require procedural or limit constructions that have not been specified.
- **"Alien convergence" is a guiding intuition, not a formal criterion.** The claim that any sufficiently intelligent being would independently converge on this substrate is motivating, but it does not yet have a specific provable form.
- **The connection to IVNA is suggestive, not proven.** Indexed zeros/infinities feel isomorphic to dimensional types, but no formal mapping has been constructed.
- **The four-substrate grouping (Space / Time / Information / Sentience)** is a recent interpretive consolidation. It organizes the ladder legibly but should not be mistaken for a structural result.

---

## Verification

This file is current as of **2026-04-23**. Significant state changes (new proofs landed, kernel revisions, notation updates, tier-status upgrades) should update both this file and the Lean formalization together.

The state described here is derived from:

- `CLAUDE.md` (project context hub)
- `spec/design-criteria.md` (14 canonical design properties)
- `history/competing-concepts.md` (unresolved decision points)
- `plan.md` (full 10-phase research plan with Red Team amendments)
- `lean/ULP/Basic.lean` (Lean 4 formal layer)
- January 2026 whitepaper synthesis document (Google Drive, `1jfdR-fbOGrJVQ1jU8loXotCKQq-l4PHJRrVrmn8Nz3s`)

For what is *not* yet captured anywhere and still lives in Wisdom's working memory and notes, see `knowledge/sources/wisdom-speech/` and `research/sources/notes-extract.md`.
