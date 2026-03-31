# ULP Deep Plan — From Concepts to Validated System

**Created**: 2026-03-28
**Last updated**: 2026-03-28
**Status**: Active — Phase 1 (Evaluation) in progress

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
     - b) Test binary run-length against the alien convergence test for 1D — why is it the only convention-free binary encoding? (Strong argument established: the encoding IS the structure)
     - c) Derive tier meanings past tier 4 with simplex-level rigor — this is the hardest open question
     - d) Evaluate the grammar of composition — how do runs combine? Is the trigram rule necessary or a vestige?
     - e) Evaluate the projection framework — does Schlegel-type projection canonically connect 1D ↔ 2D ↔ 3D?
     - f) Consider alternatives — is there any system that satisfies the 14 criteria better?
     - g) Resolve the 8 decision points from prior sessions (see below)
   - Acceptance criteria:
     - Clear verdict: binary run-length IS the right base, or here's what needs to change
     - Tier derivation extended past tier 4 with explicit rigor level for each tier
     - Grammar of composition: a leading candidate, tested against examples
     - Projection framework: formalized or demonstrated as a dead end
     - All 8 decision points resolved
   - **Estimated effort**: 3-6 sessions (philosophical + mathematical work)

#### 2. **Consolidation** — Organize 12 years of thinking
   - Complexity: M
   - Risk: Low — content exists, this is extraction not creation
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
     - The tier derivation is laid out as a chain of logical necessities
     - The boundary between kernel (proven/provable) and extension (hypothesized) is explicit
     - The projection framework is formalized
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

#### 5. **Formal Proof (Lean 4)** — P1 unique parse, then P2 and P3
   - Complexity: L
   - Risk: High — Lean 4 learning curve + the proof may fail (valuable information)
   - Acceptance criteria:
     - P1: Every valid binary string has exactly one parse tree
     - P2: Every concept in the target ontology is encodable
     - P3: Every expression has a canonical normal form
   - **Estimated effort**: Months
   - Depends on: Phase 3. Can run parallel to Phase 4.

#### 6. **Validation** — Stress-test against real meaning
   - Complexity: L
   - Risk: Medium
   - Acceptance criteria:
     - Encode 100+ concepts across diverse categories
     - Cross-linguistic validation (10 poorly-translating concepts)
     - NSM benchmark (encode all 65 primes)
     - Adversarial test (find concepts that break the system)
   - Depends on: Phase 4

#### 7. **Publication** — First paper
   - Target venues: Journal of Logic, Language and Information; Linguistics and Philosophy; *SEM; FoDS
   - Depends on: Phase 5 (at least P1) + Phase 6

#### 8. **Community & Collaboration**
   - Find collaborators: logician, linguist, philosopher
   - Can begin informally at Phase 3
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
       ↓
[3: Kernel Spec]
    ↙       ↘
[4: Prototype] [5: Lean 4]     [8: Community ← starts informally at Phase 3]
     ↓              ↓
[6: Validation]     ↓
     ↓    ↘         ↓
     ↓   [9: AI App] ← acceleration gate
     ↓
[7: Publication] ← needs P1 + validation
     ↓
[8: Community] ← formal recruitment
     ↓
[10: Treatise] ← GDGM reconnects here
```

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
| 1. Evaluation | Now | 3-6 sessions | Verdict on binary run-length; tier derivation extended |
| 2. Consolidation | Now (parallel) | 1-2 sessions | Files organized |
| 3. Kernel Spec | After evaluation | 2-4 sessions | Spec is unambiguous and complete |
| 4. Prototype | After spec | 3-5 sessions | Round-trip encode/decode works |
| 5. Lean 4 | After spec | 3-6 months | P1 proved or characterized |
| 6. Validation | After prototype | 2-4 sessions | 100+ concepts encoded |
| 7. Publication | After P1 + validation | 2-3 months | Paper submitted |
| 8. Community | Informal from Phase 3 | Ongoing | First collaborator engaged |
| 9. AI Application | After validation | TBD | Assessment complete |
| 10. Treatise | After publication | 6-12 months | Book draft complete |

---

## Current Status

### Phase 1 Progress
- [x] Design criteria established (14 properties) — `spec/design-criteria.md`
- [x] Convention-free argument for run-length (strong)
- [x] Projection framework identified (simplicial complex → Schlegel → manifold)
- [x] 2D relationship clarified (supersedes 1D, not a rendering)
- [x] Trigrams flagged as uncertain (grammar is open)
- [ ] Tier derivation past tier 4
- [ ] Grammar of composition
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
