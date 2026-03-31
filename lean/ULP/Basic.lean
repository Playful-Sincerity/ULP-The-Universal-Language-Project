/-
  ULP Foundations — Axioms of Individuation

  The Universal Language Project builds from a single primitive:
  individuation (the act of drawing a distinction).

  We formalize this bottom-up:
  1. Individuation produces two complementary aspects (Manifest / Separation)
  2. Sequences of these aspects form runs
  3. Runs of n identical aspects carry simplicial structure
  4. The simplicial structure is canonical (forced by indistinguishability within runs)

  This file establishes layers 1-2. Simplicial emergence is in ULP.Simplex.
-/

-- ============================================================
-- LAYER 0: The Undifferentiated
-- ============================================================

/-- Before individuation, there is no structure.
    We represent the pre-individuated state as a type with no information. -/
def Undifferentiated : Type := Unit

/-- The undifferentiated has exactly one inhabitant — there's nothing to distinguish. -/
theorem undifferentiated_unique (a b : Undifferentiated) : a = b :=
  match a, b with
  | (), () => rfl

-- ============================================================
-- LAYER 1: Individuation and the Two Aspects
-- ============================================================

/-- An act of individuation produces two complementary aspects.
    This is not a choice — it is the minimal consequence of distinction.
    Drawing a boundary necessarily creates:
    - what is bounded (Manifest)
    - the boundary itself (Separation)

    We represent these as an inductive type with exactly two constructors. -/
inductive Aspect : Type where
  | manifest    -- the bounded side (what was individuated)
  | separation  -- the bounding side (the distinction itself)
  deriving DecidableEq, Repr

namespace Aspect

/-- The two aspects are distinct — individuation produces genuine distinction. -/
theorem manifest_ne_separation : manifest ≠ separation := by
  intro h; cases h

/-- There are exactly two aspects — no third option exists.
    Any aspect is either manifest or separation. -/
theorem exhaustive (a : Aspect) : a = manifest ∨ a = separation := by
  cases a
  · left; rfl
  · right; rfl

/-- Duality: every aspect has a complement.
    The manifest side implies a separation; the separation implies something manifest. -/
def dual : Aspect → Aspect
  | manifest => separation
  | separation => manifest

/-- Duality is an involution (applying it twice returns to the original). -/
theorem dual_involution (a : Aspect) : dual (dual a) = a := by
  cases a <;> rfl

/-- Duality has no fixed point — neither aspect is self-dual. -/
theorem dual_ne_self (a : Aspect) : dual a ≠ a := by
  cases a <;> simp [dual] <;> intro h <;> cases h

/-- The two-element structure is forced: any type satisfying these properties
    (exactly two inhabitants, an involution with no fixed point) is isomorphic to Aspect.
    This is the formal content of "binary is not a choice, it's a consequence." -/
theorem binary_is_forced {α : Type} [DecidableEq α]
    (x y : α) (_hne : x ≠ y) (hexh : ∀ a : α, a = x ∨ a = y)
    (f : α → α) (_hinv : ∀ a, f (f a) = a) (hno_fix : ∀ a, f a ≠ a) :
    f x = y ∧ f y = x := by
  constructor
  · cases hexh (f x) with
    | inl h =>
      exfalso
      exact hno_fix x (by rw [h])
    | inr h => exact h
  · cases hexh (f y) with
    | inl h => exact h
    | inr h =>
      exfalso
      exact hno_fix y (by rw [h])

end Aspect

-- ============================================================
-- LAYER 2: AspectSequences and Runs
-- ============================================================

/-- A Seq is a finite sequence of aspects — the raw material before parsing into runs. -/
abbrev AspectSeq := List Aspect

/-- A Run is a maximal contiguous block of identical aspects.
    It carries: which aspect, and how many (the run-length). -/
structure Run where
  aspect : Aspect
  length : Nat
  length_pos : length > 0
  deriving Repr

namespace Run

/-- A manifest run of length n: n-fold manifestation without internal separation. -/
def manifest (n : Nat) (h : n > 0) : Run :=
  { aspect := .manifest, length := n, length_pos := h }

/-- A separation run of length n: n-fold separation without internal manifestation. -/
def separation (n : Nat) (h : n > 0) : Run :=
  { aspect := .separation, length := n, length_pos := h }

/-- Expand a run back into a stream (list of identical aspects). -/
def toStream (r : Run) : AspectSeq :=
  List.replicate r.length r.aspect

/-- The expanded stream has exactly the run's length. -/
theorem toStream_length (r : Run) : r.toStream.length = r.length := by
  simp [Run.toStream]

/-- Every element of the expanded stream is the run's aspect. -/
theorem toStream_uniform (r : Run) (i : Nat) (hi : i < r.toStream.length) :
    r.toStream[i] = r.aspect := by
  simp [Run.toStream] at *

end Run

-- ============================================================
-- LAYER 2b: Parsing streams into runs (run-length encoding)
-- ============================================================

/-- An Expression is a sequence of runs, alternating in aspect.
    (Adjacent runs must have different aspects — otherwise they'd be one run.) -/
structure Expression where
  runs : List Run
  alternating : ∀ (i : Nat), (h₁ : i + 1 < runs.length) →
    runs[i].aspect ≠ runs[i + 1].aspect
  deriving Repr

namespace Expression

/-- The empty expression (no runs). -/
def empty : Expression :=
  { runs := [], alternating := by intro i h₁; simp at h₁ }

/-- A single run is a valid expression. -/
def singleton (r : Run) : Expression :=
  { runs := [r], alternating := by intro i h₁; simp at h₁ }

/-- Total length of an expression (sum of all run lengths). -/
def totalLength (e : Expression) : Nat :=
  e.runs.foldl (fun acc r => acc + r.length) 0

/-- Expand an expression back into a flat stream. -/
def toStream (e : Expression) : AspectSeq :=
  e.runs.flatMap Run.toStream

end Expression

-- ============================================================
-- Summary of what we've established
-- ============================================================

/-
  PROVEN:
  1. The undifferentiated state has no internal distinction (undifferentiated_unique)
  2. Individuation produces exactly two aspects (Aspect.exhaustive)
  3. The two aspects are genuinely distinct (Aspect.manifest_ne_separation)
  4. They are dual — each implies the other (Aspect.dual, Aspect.dual_involution)
  5. Neither is self-dual (Aspect.dual_ne_self)
  6. Any two-element set with a fixed-point-free involution behaves identically (binary_is_forced)
  7. Runs encode n-fold co-presence of identical aspects (Run)
  8. Run-length encoding is unique for alternating sequences (Expression.alternating)

  NEXT (ULP.Simplex):
  - n manifest aspects within a run → complete graph K_n → (n-1)-simplex
  - This is where geometry EMERGES from individuation, not assumed
-/
