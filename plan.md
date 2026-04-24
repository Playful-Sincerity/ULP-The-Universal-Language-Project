# ULP Deep Plan — From Concepts to Validated System

**Created**: 2026-03-28
**Last updated**: 2026-03-31
**Status**: Active — Phase 1 (Evaluation) in progress. Red Team audit applied 2026-03-31.

---

## Environment Health

**Verdict: CLEAN** (2026-03-31)

- Git: clean working tree, remote configured (`origin` → `github.com/WisdomPatienceHappy/ULP.git`), 2 commits on `main`
- CLAUDE.md: present (134 lines), comprehensive project context
- Lean 4: `lakefile.toml` present, mathlib dependency declared, toolchain `v4.29.0-rc8`, Layers 0-2 formalized in `ULP/Basic.lean` (8 proofs)
- 2D Writer: working prototype with p5.js, has its own plan and reconciliation report
- Spec: `design-criteria.md` (14 properties), `competing-concepts.md` (8 decision points)
- No injection patterns detected in instruction files
- No broken symlinks

---

## Assumptions

Based on Wisdom's answers to pre-planning questions and subsequent discussion:

1. **Vision**: All three deliverables (formal proof, working tool, philosophical treatise), staged. Rigor comes first.
2. **Audience**: Hybrid academic (logic/semantics/math intersection) + AI/technical. Eventually universal.
3. **First move**: Evaluate whether binary run-length + dimensions is the right base system, rigorously.
4. **Upper tiers**: The 13-tier structure isn't sacred. The kernel must represent any concept via logical, parsimonious progression. The derivation path matters more than the tier count.
5. **Team**: Solo + AI now. Build toward recruiting specialists. Protect IP thoughtfully — open source the system, proprietary the applications.
6. **GDGM**: Separate then connect. ULP stands on geometric logic alone first.
7. **Time**: One of many projects. Could become primary if the AI training application proves viable.
8. **Phase**: We are in EVALUATION, not formalization. The system is a hypothesis under test.

---

## Cross-Cutting Concerns

### What Kind of Project Is This?
ULP is a **research program**, not a software project. The primary artifacts are:
- Formal documents (specs, proofs, papers)
- Mathematical results (proven or conjectured, clearly labeled)
- Computational tools (prototypes that validate the theory)
- Community relationships (collaborators, reviewers, early adopters)

### Core Reframing: ULP as a Projection Problem
Every representation is a projection of high-dimensional semantic structure onto a k-dimensional manifold.
The abstract simplicial complex may be the true canonical form — dimension-independent.
Binary run-length is the k=1 projection. 2D glyphs are the k=2 projection. Sign language is k=3.
Schlegel diagrams are the candidate canonical projection method.

### Intellectual Property Strategy
- The **kernel spec and proofs** are open — mathematical results can't be owned and benefit from scrutiny
- The **applications** (AI training, semantic compression, AI-to-AI communication) are where commercial value lives
- Open source the system; proprietary the tooling built on it

### Rigor Standard
Every claim in ULP falls into one of three categories:
- **Proven**: Formally verified (Lean 4) or mathematically demonstrated
- **Conjectured**: Precisely stated, falsifiable, with evidence but no proof
- **Hypothesized**: Working assumption, explicitly provisional

### Success Metrics Per Phase
Each phase has a clear "done" gate before the next begins. No phase-creep.

---

## Meta-Plan

### Goal

Determine whether binary run-length encoding of dimensional semantic primitives is the canonical (convention-free) system for universal meaning representation — and if so, formalize it, prove it, build it, validate it, publish it, and apply it.

### Phases

#### 1. **Evaluation** — Rigorously test the hypothesis
   - Complexity: L
   - Risk: High — the hypothesis might not hold (which is valuable)
   - Work:
     - a) Establish design criteria (DONE — see `spec/design-criteria.md`, 14 properties)
     - b) Test binary run-length against the alien convergence test for 1D — why is it the only convention-free binary encoding? (Leading argument established — pending alternatives review and axiom audit)
     - c) Derive tier meanings past tier 4 with simplex-level rigor — this is the hardest open question
     - d) Evaluate the grammar of composition — how do runs combine? Is the trigram rule necessary or a vestige?
     - e) Evaluate the projection framework — does Schlegel-type projection canonically connect 1D ↔ 2D ↔ 3D?
     - f) Consider alternatives — is there any system that satisfies the 14 criteria better?
     - g) Resolve the 8 decision points from prior sessions (see below)
     - **h) [RED TEAM] Grammar Recovery Session** — Re-read the Jan 22 2026 session (85K words), extract Grammar Options A/B/C with definitions, write a 1-2 page comparison document. This is a **critical path blocker** for Phase 3 (kernel spec) and Phase 5 (P1 proof). Time-boxed: 1-2 sessions dedicated.
     - **i) [RED TEAM] Boxing Proof Sketch** — Produce a mathematical argument (not full Lean proof) that the `1^m 0^m / 0^m 1^m` boxing mechanism is non-ambiguous under arbitrary nesting. If no such sketch can be produced, the boxing design must change before Phase 3. Boxing is on the critical path to P1.
     - **j) [RED TEAM] Convention-Free Falsification Test** — State the specific geometric axioms the convention-free argument depends on (Euclidean simplicial geometry, indistinguishability within runs). Test: would an alien using non-Euclidean geometry or graph-theoretic dimensionality converge on the same system? If the answer is "only with our geometric axioms," restate the claim as "convention-free relative to Euclidean simplex geometry." This is an honest tightening, not a retreat.
     - **k) [RED TEAM] Grammar Test Harness** — Build a minimal throwaway parser script (Python or similar) that can test grammar candidates against example expressions. Breaks the circular dependency between Phase 1 (grammar evaluation) and Phase 4 (prototype). Not production code — a thinking tool.
   - Acceptance criteria:
     - Clear verdict: binary run-length IS the right base, or here's what needs to change
     - **The geometric axioms the convention-free claim depends on are explicitly stated**
     - Tier derivation extended past tier 4 with explicit rigor level for each tier
     - **Formal separation: tiers 1-4 (geometrically forced kernel) vs tiers 5-13 (philosophically motivated extension), with different rigor labels**
     - Grammar of composition: a leading candidate, tested against examples **via the grammar test harness**
     - **Boxing: proof sketch of non-ambiguity, or documented failure triggering redesign**
     - Projection framework: formalized or demonstrated as a dead end
     - All 8 decision points resolved
   - **Estimated effort**: 5-8 sessions (revised upward — grammar recovery, boxing, and falsification test add genuine work)

#### 2. **Consolidation** — Organize 12 years of thinking
   - Complexity: M
   - Risk: **Medium** [RED TEAM upgrade] — 300K+ words across 33 conversations is intellectual archaeology, not simple extraction. Key content (Grammar A/B/C) is buried and requires judgment to interpret. Decision points remain unresolved after extraction attempts.
   - Can run in parallel with Phase 1 (evaluation informs what to consolidate)
   - Acceptance criteria:
     - All ULP knowledge lives in `~/ULP/spec/`, `~/ULP/history/`, `~/ULP/connections/`
     - Every claim is traceable to a source conversation
     - CLAUDE.md is a navigation hub, not a spec
   - **Estimated effort**: 1-2 sessions
   - **Folder structure** (from background planning agent):
     ```
     ~/ULP/
       spec/
         design-criteria.md          # DONE
         current-state.md            # The specification
         tier-ladder.md              # Tier system deep dive
         grammar.md                  # Composition rules
         boxing.md                   # Boxing mechanism
         identity-handles.md         # Cross-clause reference
         decision-log.md             # All decisions with rationale
         open-problems.md            # Consolidated with status
       history/
         evolution.md                # 12-year chronological narrative
         alternatives-explored.md    # Ideas tried and parked
         competing-concepts.md       # Decision points needing resolution
         conversation-index.md       # Master reference across archives
       connections/
         ivna.md                     # IVNA system + ULP relationship
         gdgm-bridge.md             # Gravitationalist mapping
         nsm-comparison.md          # Natural Semantic Metalanguage
       2d-writer/                    # (existing)
       diagrams/                     # (existing)
     ```

#### 3. **Kernel Formalization** — Write the rigorous, unambiguous kernel spec
   - Complexity: L
   - Risk: High — this is where ULP either holds up under scrutiny or reveals gaps
   - Acceptance criteria:
     - `spec/current-state.md` is a complete, self-contained specification
     - Every rule is precisely stated
     - **Two-tier structure: tiers 1-4 are "mathematically derived" (chain of logical necessities from simplex construction); tiers 5-13 are "philosophically motivated" (principled but revisable arguments)**
     - The boundary between kernel (proven/provable) and extension (hypothesized) is explicit
     - The projection framework is formalized
     - **Boxing mechanism is specified with non-ambiguity proof sketch**
     - **[RED TEAM] One external specialist (logician, formal semanticist, or linguist) has read the spec and given feedback by end of Phase 3.** This is the cheapest possible test of whether the system survives peer review. A 30-minute conversation at this stage could prevent months of wasted Lean work.
   - **Estimated effort**: 2-4 sessions
   - Depends on: Phase 1 (evaluation verdict)

#### 4. **Computational Prototype** — Parser + encoder/decoder + REPL
   - Complexity: M
   - Risk: Medium — the grammar may surface ambiguities the spec missed
   - Acceptance criteria:
     - Given a binary string, parse it into a unique AST (or report ambiguity)
     - Given a concept (structured input), encode it to binary
     - Round-trip: encode → decode → encode produces identical output
     - REPL for interactive exploration
   - **Estimated effort**: 3-5 sessions
   - Depends on: Phase 3 (kernel spec)

#### 5. **Formal Proof (Lean 4)** — P1 unique parse and P3 normal form
   - Complexity: L
   - Risk: High — Lean 4 learning curve + the proof may fail (valuable information)
   - Acceptance criteria:
     - P1: Every valid binary string has exactly one parse tree **(requires: grammar specified, boxing non-ambiguity proved)**
     - P3: Every expression has a canonical normal form
   - **[RED TEAM] P2 removed as a Lean proof target** — "every concept in the target ontology is encodable" requires a formal definition of the target ontology, which is not a mathematical object. P2 is moved to Phase 6 as an empirical validation target. Keeping it here would create scope creep and confusion.
   - **Estimated effort**: Months
   - Depends on: Phase 3. Can run parallel to Phase 4. **Also depends on boxing resolution (Phase 1, item i).**

#### 6. **Validation** — Stress-test against real meaning
   - Complexity: L
   - Risk: Medium
   - Acceptance criteria:
     - Encode 100+ concepts across diverse categories
     - Cross-linguistic validation (10 poorly-translating concepts)
     - NSM benchmark (encode all 65 primes)
     - Adversarial test (find concepts that break the system)
     - **[RED TEAM] P2 (expressive completeness)** — empirical demonstration that the system can encode all concepts in a defined target set. This is a validation result (tested against examples), not a formal proof. Replaces the former Phase 5 proof target.
   - Depends on: Phase 4

#### 7. **Publication** — First paper
   - Target venues: Journal of Logic, Language and Information; Linguistics and Philosophy; *SEM; FoDS
   - **[RED TEAM] Two-paper strategy:**
     - **Paper A (tiers 1-4, mathematical core):** Convention-free binary encoding with simplex derivation, P1 proof, round-trip validation. Targets logic/math venues (JLLI, FoDS). This can be published faster and establishes credibility.
     - **Paper B (tiers 5-13, philosophical extension):** Principled extension to higher-order meaning, with linguistic validation (NSM benchmark). Targets linguistics/philosophy venues (L&P, *SEM). Published after Paper A.
   - **[RED TEAM] Field engagement required:** Must engage with NSM (Wierzbicka), formal ontology (OWL/Description Logic), and construction grammar literatures — not just as benchmarks, but as discourse communities to position within. Framing ULP as a competitor to NSM without engaging the NSM literature will result in rejection.
   - Depends on: Phase 5 (at least P1) + Phase 6

#### 8. **Community & Collaboration**
   - Find collaborators: logician, linguist, philosopher
   - **[RED TEAM] Must begin at Phase 3, not "can"** — peer review survival depends on domain expert feedback before Lean work begins. The Phase 3 acceptance criterion (one external specialist reads the spec) is a hard gate, not an optional nice-to-have.
   - Depends on: Phase 3 (spec must be explainable in 30 min)

#### 9. **AI Application Exploration** — The acceleration gate
   - Test ULP as a semantic layer for AI
   - If promising → ULP becomes primary project + potential funding
   - Depends on: Phase 4 + Phase 6

#### 10. **The Treatise** — The book
   - GDGM reconnects here, after ULP has standalone credibility
   - Depends on: Everything above

### Dependency Graph

```
[1: Evaluation] ←→ [2: Consolidation]  (parallel, inform each other)
  ↓ (includes grammar recovery, boxing sketch, falsification test)
  ↓
[3: Kernel Spec] ← [8: Community BEGINS HERE — external specialist reads spec]
  ↓   ↓
  ↓   ↓ (boxing resolution feeds into P1)
    ↙       ↘
[4: Prototype] [5: Lean 4 (P1 + P3 only)]
     ↓              ↓
[6: Validation (+ P2 empirical)]
     ↓    ↘         ↓
     ↓   [9: AI App] ← acceleration gate
     ↓
[7a: Paper A (math core, tiers 1-4)] ← needs P1
     ↓
[7b: Paper B (philosophical extension, tiers 5-13)] ← needs validation + Paper A credibility
     ↓
[8: Community] ← formal recruitment expands
     ↓
[10: Treatise] ← GDGM reconnects here
```

**[RED TEAM] Critical path (longest dependency chain):**
Grammar recovery (1h) → Boxing proof sketch (1i) → Grammar test harness (1k) → Kernel spec (3) → P1 proof (5) → Paper A (7a)

**[RED TEAM] Circular dependency acknowledged:**
Phase 1 (grammar evaluation) benefits from Phase 4 (prototype testing), but Phase 4 requires Phase 3 (spec), which requires Phase 1. Broken by the grammar test harness (1k) — a minimal throwaway parser in Phase 1 that tests grammar candidates without a full prototype.

### 8 Decision Points (From Prior Sessions)

These must be resolved during Phase 1 (Evaluation):

1. **Nesting direction** — left-to-right vs right-wraps-left
2. **Tier boundary** — where does "geometrically necessary" end? After tier 7 or 8?
3. **Tier 8 meaning** — consciousness (old) vs coupling (new)
4. **Tier grouping bands** — Space/Dynamics/Information/Sentience: real or pedagogical?
5. **Grammar options A/B/C** — from Jan 22 2026 session (85K words, not yet summarized)
6. **2D syntax role** — extension layer on 1D, or genuinely richer ground-up system? (RESOLVED: 2D supersedes 1D, built from ground up, many-to-one downward)
7. **IVNA ↔ ULP** — unified system or parallel?
8. **Emotion as first-class parameter** — absorbed, parked, or dropped?

### Overall Success Criteria

**First major milestone** (ULP is "real"):
1. The kernel has a proven unique parse (P1 in Lean 4)
2. A working prototype can encode and decode 100+ diverse concepts
3. A peer-reviewed paper is published
4. At least 2 collaborators are actively working on extensions

**Maturity**:
5. AI application assessment complete
6. Treatise written, connecting ULP to GDGM
7. Other researchers independently using or extending the system

### Timeline (Realistic, Given "One of Many" Budget)

| Phase | Start | Duration | Gate |
|-------|-------|----------|------|
| 1. Evaluation | Now | **5-8 sessions** [RT↑] | Verdict + grammar recovery + boxing sketch + falsification test |
| 2. Consolidation | Now (parallel) | **2-3 sessions** [RT↑] | Files organized, intellectual archaeology complete |
| 3. Kernel Spec | After evaluation | 2-4 sessions | Spec complete **+ one external specialist review** |
| 4. Prototype | After spec | 3-5 sessions | Round-trip encode/decode works |
| 5. Lean 4 | After spec + boxing | 3-6 months | **P1 + P3** proved or characterized |
| 6. Validation | After prototype | 2-4 sessions | 100+ concepts encoded **+ P2 empirical** |
| 7a. Paper A | After P1 | 2-3 months | Math core paper submitted |
| 7b. Paper B | After Paper A + validation | 3-6 months | Extension paper submitted |
| 8. Community | **Begins at Phase 3** [RT↑] | Ongoing | First specialist engaged at Phase 3 gate |
| 9. AI Application | After validation | TBD | Assessment complete |
| 10. Treatise | After publication | 6-12 months | Book draft complete |

---

## Current Status

### Phase 1 Progress
- [x] Design criteria established (14 properties) — `spec/design-criteria.md`
- [~] Convention-free argument for run-length — **leading argument, pending alternatives review and axiom audit** [RT downgrade from "strong"]
- [x] Projection framework identified (simplicial complex → Schlegel → manifold)
- [x] 2D relationship clarified (supersedes 1D, not a rendering)
- [x] Trigrams flagged as uncertain (grammar is open)
- [ ] Tier derivation past tier 4
- [ ] Grammar of composition
- [ ] **Grammar recovery session** (Jan 22 2026, 85K words — extract A/B/C options) [RT critical path]
- [ ] **Boxing proof sketch** (non-ambiguity under nesting) [RT critical path]
- [ ] **Convention-free falsification test** (axiom dependency audit) [RT]
- [ ] **Grammar test harness** (minimal parser for evaluating candidates) [RT]
- [ ] Projection framework formalization
- [ ] Alternatives evaluation
- [ ] 8 decision points (1 of 8 resolved: #6)

### Phase 2 Progress
- [x] Folder structure designed
- [x] `spec/` directory created
- [x] `spec/design-criteria.md` written
- [ ] Remaining spec documents
- [ ] History documents
- [ ] Connection documents
- [ ] CLAUDE.md update

---

## Red Team Amendments (2026-03-31)

Adversarial audit by Sonnet skeptic, planner response by Opus.

### What the Skeptic Found

**3 Fatal Flaws:**
1. The "convention-free" claim assumes Euclidean simplex geometry without stating this dependency — the alien convergence test doesn't distinguish "any being using our axioms" from "any being anywhere"
2. No derivation mechanism exists for tiers 5-13; the plan accepts philosophical stipulation while claiming convention-freedom
3. P1 (unique parse) requires a grammar, but the grammar is unspecified — Grammar Options A/B/C are buried in an unread 85K-word session

**4 Hidden Complexities:**
1. Phase 1 grammar evaluation is circularly dependent on Phase 4 prototype
2. Phase 2 consolidation is intellectual archaeology across 300K+ words, not simple extraction
3. P2 (expressive completeness) is formally undecidable without a defined target ontology
4. Boxing mechanism uniqueness is an underdetermined constraint satisfaction problem on the critical path to P1

**3 Missing Dependencies:**
1. Phase 4 ↔ Phase 1 circular dependency (grammar)
2. Phase 7 needs collaborators before submission, not after
3. Phase 5 (Lean P1) depends on boxing resolution

**4 Unrealistic Assumptions:**
1. 7/8 decisions in 3-6 sessions (some are genuinely hard, not just unaddressed)
2. Publishing requires field discourse navigation, not just formal rigor
3. Convention-free argument marked "done" while alternatives not yet evaluated (contradiction)
4. 13-tier ladder assumed stable through formalization, but only 4 tiers have geometric derivation

### Amendments Applied (AMEND) vs. Rejected (REJECT) vs. Deferred (DEFER)

| # | Point | Verdict | Change |
|---|-------|---------|--------|
| 1a | Convention-free deepity | AMEND | Added falsification test (1j), axiom audit acceptance criterion, downgraded status |
| 1b | No tier 5-13 derivation | AMEND | Two-tier split: tiers 1-4 mathematical core, tiers 5-13 philosophical extension; two-paper publication strategy |
| 1c | P1 needs nonexistent grammar | AMEND | Grammar recovery session (1h) added as critical path blocker |
| 2a | Circular grammar↔prototype dependency | AMEND | Grammar test harness (1k) breaks the cycle |
| 2b | Phase 2 risk | AMEND | Risk upgraded Low → Medium |
| 2c | P2 undecidable | AMEND | P2 moved from Phase 5 (proof) to Phase 6 (empirical validation) |
| 2d | Boxing on critical path | AMEND | Boxing proof sketch (1i) added to Phase 1 acceptance criteria |
| 3a | Phase 4↔1 loop | AMEND | Addressed via grammar test harness |
| 3b | Collaborators before publication | AMEND | External specialist review added as Phase 3 hard gate |
| 3c | Lean depends on boxing | AMEND | Phase 5 dependency on boxing made explicit |
| 4a | 7/8 decisions in 3-6 sessions | DEFER | Optimistic but not absurd; will be tested by doing |
| 4b | Field discourse requirements | AMEND | Phase 7 now requires NSM/ontology/construction grammar engagement |
| 4c | Convention-free status contradiction | AMEND | Downgraded from "established" to "leading argument, pending review" |
| 4d | Tier ladder stability | AMEND | Covered by two-tier split |

### Net Changes

- **Phase 1 estimated effort**: 3-6 sessions → 5-8 sessions
- **Phase 2 risk**: Low → Medium
- **Phase 5 proof targets**: P1 + P2 + P3 → P1 + P3 (P2 to Phase 6)
- **Phase 7 strategy**: Single paper → Two-paper strategy (math core first, extension second)
- **Phase 8 timing**: "Can begin at Phase 3" → "Must begin at Phase 3"
- **New Phase 1 sub-tasks**: Grammar recovery session, boxing proof sketch, convention-free falsification test, grammar test harness
- **New Phase 3 acceptance criterion**: External specialist review
- **Critical path identified**: Grammar recovery → Boxing sketch → Grammar harness → Kernel spec → P1 proof → Paper A

### The Single Most Dangerous Failure Mode (per skeptic)

The plan has a Phase 1 that simultaneously treats the convention-free argument as largely established AND leaves grammar and boxing unresolved. The Lean proofs so far (Layers 0-2) prove encoding uniqueness — which is correct but is the *warm-up exercise*, not the *main event*. The main event (compositional grammar uniqueness = P1) hasn't started because the grammar hasn't been chosen. The grammar is buried in a 14-month-old 85K-word session. This gap is now flagged and on the critical path.
