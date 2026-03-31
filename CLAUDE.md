# Universal Language Project (ULP)

## Overview

ULP is an attempt to construct a mathematically provable, logically consistent set of irreducible semantic primitives whose combinations can unambiguously represent any conceivable idea — across cultures, species, and civilizations.

The project's core claim is ontological: meaning derives not from arbitrary symbol assignments but from the inherent properties of geometric dimensions.
The number of points required to define each dimension becomes the logical basis for a semantic tier.
This is ULP's most original contribution and its most fragile hypothesis.

The "alien convergence" criterion is the project's self-test: a truly fundamental system should be one that any sufficiently intelligent being, anywhere in the universe, would independently converge on.

## Current State (as of January 2026)

The **binary run-length encoding system** is the leading candidate for ULP's surface form.

Kernel requirements (treated as constitutional):
- Pure binary alphabet: `{0, 1}` only
- Type derived from run-length alone (no external metadata)
- Compositionality: complex meanings built from simple parts
- Self-delimiting, deterministic parsing

The distinction between **kernel requirements** (constitutional) and **hypotheses** (provisional) is explicit.
If a requirement proves incompatible with the others, it gets revised — not held by dogma.

The project was formally proposed in January 2025 and reached its most rigorous state in January 2026.
The full development history spans 33 ChatGPT conversations, ~300K+ words, from 2023 to 2026.

## Two Base Symbols

All versions of ULP share the same fundamental duality:

- **0 (void/cut)** — absence, potential, pre-dimensional; the cut that makes distinction possible
- **1 (presence/closure)** — existence, manifestation; the thing that can be cut

These are not arbitrary choices. They are the *minimum* required to generate all distinction.
In binary run-length encoding: `n.` = run of n ones (n-th order closure); `no` = run of n zeros (n-th order cut).

## Dimensional Tier Ladder

Derived from closure logic. The rule: n points are geometrically required to define an (n-1)-dimensional simplex, so the number represents (n-1) dimensions.

| Tier | 1-run (closure) | 0-run (cut) |
|------|-----------------|-------------|
| 1 | Unit mark / distinguishable "this" | Distinction (this vs not-this) |
| 2 | Link / directed adjacency | Orderable separation (A-before-B) |
| 3 | Loop / region (2D closure) | Inside/outside partition |
| 4 | Containment volume (nesting) | Container boundary |
| 5 | Persistence across change / event | State-slice / transition boundary |
| 6 | Invariant / rule-closure | Constraint / evidence cut |
| 7 | Perspective / controller (feedback loop) | Choice boundary / self vs non-self |
| 8 | Coupling / coalition of perspectives | Interface cut (alignment vs mismatch) |
| 9 | Logic / structural category | Categorical exclusion / disjointness |
| 10 | Simulation / model / ontology | Model-space distance |
| 11 | Self / indexical center | Subjective distance (me/not-me) |
| 12 | Social / intersubjective web | Social distance |
| 13 | Unity / integrated whole | Global aspect distinction |

Tiers 1–8 have the strongest geometric/logical necessity justification.
Tiers 9–13 are provisional — they depend on philosophical commitments that could reasonably be constructed otherwise.

## Core Semantic Rule (Trigram / Left-Individuation)

The fundamental semantic unit is a trigram: `X.(ko)Z.`

Three-layer meaning:
1. **Unitization (always):** X becomes a unit by being distinguished from Z
2. **Mode semantics:** k selects the *kind* of distinction (adjacency, temporal, spatial, categorical, etc.)
3. **Type interaction:** depends on the specific tiers of X and Z

Direction rule: in `A. k0 B.`, A is the *figure* (thing being characterized), B is the *ground* (context/field).
The right side wraps or contextualizes the left.

## Boxing / Closure Mechanism

The largest unresolved frontier.
Current proposal: a frame delimiter using runs of ceiling length m:
- Open: `1^m 0^m`
- Close: `0^m 1^m`
- Constraint: no run of length ≥ m appears inside the box

This gives self-delimiting, purely binary grouping without external parentheses.
The proposal is promising but needs proof of uniqueness and non-ambiguity under arbitrary nesting.

## Related Systems

### IVNA (Indexed Virtual Number Algebra)
A parallel mathematical framework that emerged alongside ULP.
Proposes typed zeros (`0x`) and typed infinities (`∞x`) with index-preserving arithmetic:
- `0x · ∞y = xy`
- Division: `y/0x = ∞(y/x)`
- Enables limit-free calculus via indexed zeros

Philosophical grounding: zeros and infinities are "virtual" (simulation-resident, not physically real).
Connection to ULP: indexed zeros/infinities could map to dimensional types in a mathematical layer.
The formal relationship between IVNA and ULP is gestured at but not yet fully developed.

### Cāman
An early applied test case — a social connection platform (2023) whose interest-matching architecture implicitly encoded ULP's dimensional categorization. Not formalized as a ULP deployment.

## Connection to Gravitationalism

The dimensional tier ladder maps directly onto the Gravitationalist cosmological arc:

```
void → point → line → plane → volume → time → information → consciousness → society → universal consciousness
```

This is not incidental. ULP's dimensional progression may *be* a cosmological progression — the universe coming together through increasing orders of closure and coupling.
Formally relating the two would be deeply significant work. See `~/Playful Sincerity/PS Research/Gravitationalism/` for the GDGM framework.

## Key Open Problems

1. **Boxing** — Self-delimiting binary grouping; uniqueness proof under nesting not yet established
2. **Identity and handles** — How to refer to "the same entity" across clauses; current proposal: runs of length ≥14 as IDs
3. **Continuous magnitude** — How to represent π, e, irrationals in a discrete run-length system (approximation vs. procedural expression)
4. **Negation** — Currently proposed as domain-relative categorical exclusion using a 9o separation; not yet stable grammar
5. **ULP ↔ IVNA formal bridge** — Are IVNA's indexed zeros the same as ULP's run-typed cuts?
6. **2D / visual syntax** — Linear strings may never fully capture containment, overlay, and simultaneous co-reference; Rem sessions opened this; formalization path unresolved
7. **Alien convergence as a formal criterion** — The claim needs a specific, provable form
8. **Proof assistant implementation** — Lean 4 formalization recommended; P1 (unique parse), P2 (encode/decode completeness), P3 (normal form) not yet begun

## Proof Targets

- **P1** — Unique parse: every valid binary string has exactly one parse tree
- **P2** — Expressive completeness: every concept in the target ontology is encodable
- **P3** — Normal form: every expression has a canonical form

## Development Phases (Historical)

| Phase | Date | Key Move |
|-------|------|----------|
| 1 | 2023-01 | Number dimensions as primes (0–7 and ∞) |
| 2 | 2023-04 | Cāman as applied test; NSM and Chomsky study |
| 3 | 2023-06 | "Atomic truths" formal proposal; Hegelian dialectic of dimensions |
| 4 | 2025-01 | IVNA paper; Hegelian ladder extended to 0–10 |
| 5 | 2025-04 | Rem collaboration; 0/∞ as base nodes; 2D syntax question |
| 6 | 2026-01 | Binary run-length breakthrough; kernel requirements; constitution split |

## File Structure

```
~/Playful Sincerity/PS Research/ULP/
  CLAUDE.md              # This file
  (content TBD)

~/Wisdom Personal/ChatGPT Archive/summaries/
  ulp-language.md        # Primary reference — full synthesis of 33 conversations

~/Playful Sincerity/PS Research/Gravitationalism/      # GDGM framework — cosmological context for the tier ladder
```

The ChatGPT archive is the main development record.
The 33 ULP conversations (~300K+ words) contain the full intellectual history, including the most rigorous January 2026 sessions.
The most important single session is "Self Guided: Branch · Branch · 6 primes system" (2026-01-22, ~85K words).

## Cross-References

- Primary archive summary: `~/Wisdom Personal/ChatGPT Archive/summaries/ulp-language.md`
- Gravitationalist philosophy: `~/Playful Sincerity/PS Research/Gravitationalism/`
- Memory file: `~/.claude/projects/-Users-wisdomhappy/memory/project_ulp.md`
- Related math system: IVNA (documented in ChatGPT archive)
