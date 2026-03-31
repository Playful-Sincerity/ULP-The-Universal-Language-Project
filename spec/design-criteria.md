# ULP Design Criteria

**Established**: 2026-03-28
**Status**: Active — these are the evaluation rubric for any candidate system

---

## Foundational Properties

### 1. Structural Canonicity (Convention-Free Encoding)
The encoding must be determined solely by the structure of what's being encoded.
No arbitrary assignments, no lookup tables, no conventions.
The "alien convergence test": any sufficiently rational being would arrive at the same system independently.
In mathematical terms: the encoding is a **natural transformation** — it commutes with the structure it represents.

### 2. First-Principles Derivation
Every structural claim must be derivable from first principles, not assigned.
If a tier means "X," there must be a logical argument for why it MUST mean X and couldn't mean Y.
The simplex argument (n points define an (n-1)-dimensional simplex) is the model for this: tiers 1-4 are geometrically forced.

### 3. Mathematical Provability
Every structural claim must be demonstrable, not asserted.
The rigor standard: proven > conjectured > hypothesized, and every claim must be labeled.

### 4. Logical Soundness
No contradictions, no ambiguities, unique interpretation.
A given encoding must have exactly one meaning (or the system must precisely characterize where ambiguity exists).

### 5. Maximal Parsimony
Minimum symbols, minimum rules, minimum arbitrary choices.
If it can be simpler and still work, it's not done.

---

## Expressiveness Properties

### 6. Universal Representability
Can represent any concept — no ceiling on what's expressible.
Spatial, temporal, emotional, social, abstract, metaphorical — all encodable.

### 7. Cultural Nuance Preservation
People can bring the specificity of their culture, language, and worldview into the system.
The system doesn't flatten nuance into universals — it provides more expressive capacity because it starts at the bottom.
Combinatorial power from primitives enables MORE creativity than natural languages, not less.

### 8. Greater Expressivity Than Natural Languages
Starting from the bottom (true primitives) means the combinatorial space is larger than any natural language.
Concepts that require circumlocution in natural language should have direct encodings.

---

## Learnability Properties

### 9. Easiest Language to Learn
Zero rote memorization.
Every element is structurally derived from reasoned meanings and logical ordering.
If you understand the logic, you know the system — nothing to memorize.

### 10. Cognitive Naturalness
The structure maps to how minds already organize experience.
The tiers should feel like a progression from simple to complex that matches intuition, not an arbitrary taxonomy.

---

## Architectural Properties

### 11. Meta-Language Architecture
ULP is the base semantic layer — a meta-language that charts into all other systems:
- Spoken language (binary compresses into sounds)
- Written language (1D linear systems)
- 2D visual language (glyphs, spatial composition)
- 3D language (sign language, spatial)
- AI communication (semantic encoding for models)

It is a language in itself, but its primary role is as the canonical base that other systems project from.

### 12. ULP Is a Projection Problem
Every representation (1D, 2D, 3D) is a projection of high-dimensional semantic structure onto a k-dimensional manifold.
- **1D manifold** (binary): project onto a line. Run-length is the canonical method.
- **2D manifold** (glyphs): project onto a plane. Can directly represent up to tier 3 (triangle). Higher tiers require canonical projection (Schlegel-type).
- **3D manifold** (sign/spatial): directly represent up to tier 4 (tetrahedron). Higher tiers projected.
- Each added manifold dimension allows direct representation of one more tier without projection.

The abstract simplicial complex may be the true canonical form — dimension-independent.
All manifold representations are projections of it, losing information in predictable ways.

### 13. 2D System: Recursive, Ground-Up, Supersedes 1D
The 2D system is NOT a rendering of binary — it's a genuinely richer encoding built from the ground up.
It exploits full two-dimensionality: parallelism, orientation, containment, spatial relationship.
One 2D glyph may correspond to many binary encodings (many-to-one downward).
Going from 2D to 1D is lossy compression.
The 2D system must pass the same canonicity test as the 1D system.

### 14. Extensible Tier Structure
The 13-tier system is not sacred — it's the current best hypothesis.
What IS required: any concept representable via logical, parsimonious progression.
The kernel (geometrically forced tiers) is proven; the extension path is principled but revisable.
The derivation method matters more than the tier count.

---

## Current Hypothesis Under Evaluation

These are the leading candidates, not settled decisions:

- **Fundamental concepts** = geometric dimensions (n points define n-1 dimensional closure)
- **1D encoding** = binary run-length ({0, 1}, type from run-length alone)
- **Two base symbols**: 0 = cut/individuation, 1 = closure/presence
- **Run-length is convention-free**: a run of n IS n instances of the same thing — no mapping needed
- **Simplex derivation**: tiers 1-4 geometrically forced; tier 5+ derivation is the key open question
- **Trigram rule** (`X.(ko)Z.`): uncertain, possibly a vestige — grammar of composition is open
- **Schlegel projection** as the canonical method connecting 1D, 2D, and 3D representations

---

## Evaluation Questions

For any candidate system (including binary run-length), test against:

1. Is every encoding convention-free? (Would an alien arrive at it independently?)
2. Is every tier derivable, not assigned? (Can you prove why tier N means what it means?)
3. Can it represent ANY concept? (Test with adversarial examples)
4. Is it maximally parsimonious? (Could it be simpler?)
5. Is it learnable without memorization? (Does the logic suffice?)
6. Does it preserve cultural nuance? (Or does it flatten?)
7. Does it project canonically onto 1D, 2D, 3D manifolds?
8. Are there unresolvable ambiguities in parsing?
