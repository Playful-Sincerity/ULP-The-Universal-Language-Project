# ULP — Lean 4 Formalization

Formal verification of the ULP foundations in Lean 4.

## Current state

**Layers 0–2 are formalized** in [`ULP/Basic.lean`](ULP/Basic.lean). Eight theorems are proved, with no `sorry`, `admit`, or `axiom`:

1. **`undifferentiated_unique`** — the pre-individuated state has exactly one inhabitant (there is nothing to distinguish).
2. **`Aspect.manifest_ne_separation`** — the two aspects produced by individuation are genuinely distinct.
3. **`Aspect.exhaustive`** — there are exactly two aspects; no third option exists.
4. **`Aspect.dual_involution`** — duality is an involution: applying it twice returns to the original.
5. **`Aspect.dual_ne_self`** — neither aspect is self-dual; duality has no fixed point.
6. **`Aspect.binary_is_forced`** — a meta-theorem. Any type with exactly two inhabitants and a fixed-point-free involution is isomorphic to the Aspect structure. This is the formal content of the claim *"binary is not a choice, it is a consequence."*
7. **`Run.toStream_length`** — expanding a run produces a stream of the declared length.
8. **`Run.toStream_uniform`** — every position in the expanded stream carries the run's aspect.

Plus supporting definitions: `Undifferentiated`, `Aspect`, `Aspect.dual`, `Run`, `AspectSeq`, `Expression` (with the structural `alternating` invariant that enforces run-length-encoding uniqueness at the type level).

The file compiles cleanly against Lean 4.29.0-rc8 with mathlib and batteries as pinned in `lake-manifest.json`.

## What is not yet done

- **Layer 3 — simplicial emergence.** The `ULP.Simplex` module referenced in `Basic.lean` has not been written. The sketch at the bottom of that file names the target: `n` manifest aspects within a run → complete graph *K_n* → (n-1)-simplex. This is the step where the geometric content of the tier ladder would be shown to emerge from individuation rather than be assumed.
- **P1 — unique parse.** An explicit theorem stating "every valid binary string has exactly one parse tree" is not yet written. The `Expression.alternating` structural invariant enforces uniqueness of run-length encoding, which is a foundation for P1, but the P1 theorem itself remains to be stated and proved.
- **P2 — expressive completeness** and **P3 — normal form.** Named as proof obligations in the project spec; not yet attempted.

## Building

Requires [Lean 4 via elan](https://leanprover-community.github.io/get_started.html).

```
cd lean
lake build
```

First build pulls mathlib and batteries (several minutes). Subsequent builds are cached and fast.

## Toolchain

Pinned in `lean-toolchain` to Lean 4.29.0-rc8. Mathlib declared as dependency in `lakefile.toml`; exact hashes pinned in `lake-manifest.json`.

## Design intent

The formalization is bottom-up. Rather than assuming the binary alphabet and the tier ladder as design choices, the proofs proceed by:

1. Starting from `Undifferentiated` — a type with no structure.
2. Deriving the two-aspect structure from minimal distinction (drawing a boundary necessarily creates a bounded side and a bounding side).
3. Proving that the two-aspect structure is the unique solution to the constraints — specifically, that any type with two elements and a fixed-point-free involution is isomorphic to `Aspect`.
4. Building runs (maximal contiguous blocks of identical aspects) and expressions (alternating sequences of runs) on top of the aspect layer.
5. *(Future)* Deriving simplicial geometry from manifest-run structure — showing that the tier ladder's geometric content is forced by the aspect layer, not stipulated.

This is what the project means by "the substrate is discovered, not designed." The Lean work is an attempt to formalize that claim; it is currently partial.
