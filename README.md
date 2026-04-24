# The Universal Language Project (ULP)

**A search for the minimal logical substrate of meaning — developed since 2014, formalized since 2023.**

> **Project manifest (PDF):** [`paper/ULP-manifest.pdf`](paper/ULP-manifest.pdf) — 4-page formally-typeset overview suitable for sharing and citing. Start here if you want the compressed version; the rest of this README goes deeper.

---

## The thesis in one paragraph

ULP is a search for the fundamental concepts that represent reality — the irreducible primitives of meaning and how they combine. The working hypothesis is that the best way to formalize these primitives — **logically consistent, unambiguous, infinitely expressible, axiomatically provable** — is to represent them as **binary run lengths** of ones and zeros, where each run-length encodes a **dimension** of either **existence** (runs of `1`) or **separation** (runs of `0`). The ladder of dimensions extends upward from the geometric into the cognitive: above the spatial dimensions come dimensions of **temporality, information, and self-simulation**.

If such a substrate can be formalized, it creates the basis for two things at once. First: a **universal language for the world** — one that would be easiest to learn (built from the simplest possible primitives rather than arbitrary vocabulary), most expressive and creative (combinatorial rather than enumerative), most efficient for human thought (no friction from cultural randomness), and able to carry any cultural complexity without flattening it. Second: a **universal parsing substrate for AI** — semantic compositionality at the level of the representation itself, rather than statistical approximation over tokens.

The current proposal: the ladder has **13 tiers**, grouped into four bands — Space, Time/Dynamics, Information, Self-Awareness — where each tier comes from the geometric fact that `n` points are required to define an `(n-1)`-dimensional simplex. The system's self-test is **alien convergence**: a truly fundamental representation of reality is one that any sufficiently intelligent being, anywhere, would independently derive.

This is **proposed, not established**. The whole system is held provisionally — but years of iteration have led here, and the commitments below are working ones, tested against themselves repeatedly. This repo is the current state of the search.

---

## What the system needs

Any candidate for a fundamental semantic substrate has to satisfy a small set of non-negotiable requirements. These are **constitutional** — they predate any particular notation or ladder, and they are the criteria by which every proposal is evaluated:

1. **Minimal alphabet.** The system uses the smallest possible symbol set — one that admits no arbitrary cultural choice. Currently `{0, 1}`.
2. **Type from structure alone.** The type or category of any primitive comes from its own structural form, not from external labels, lookup tables, or metadata.
3. **Compositionality.** Complex meanings are built from simpler ones via declared rules. No meaning is atomic above the primitive level.
4. **Self-delimiting, deterministic parsing.** Any valid string has exactly one parse tree, recoverable from the string itself — no external punctuation or framing.

These four are the requirements the system must meet. They do not determine a unique solution — they are compatible with many possible systems — but they rule out most of what has been tried. What follows below should be read as *one candidate* for satisfying all four.

---

## The system at a glance

### Two base symbols

- `0` — absence, void, the cut that makes distinction possible
- `1` — presence, manifestation, the thing that can be cut

These are not arbitrary choices. They are the *minimum* required to generate any distinction at all.

### Run-length encoding as surface form

The alphabet is binary. The grammar is **runs of the same symbol**. A run of `n` ones is written `n.` and means an n-th order closure. A run of `n` zeros is written `no` and means an n-th order cut. The dot or circle always follows the number; this is the one syntactic rule outside the runs themselves.

Meaning derives from **run-length alone**. There are no other symbols. No parentheses, no commas, no variable names, no external metadata. The commitment is to the minimum.

### The dimensional ladder (current version)

The rule: `n` points are geometrically required to define an `(n-1)`-dimensional simplex. So a run of length `n` corresponds to `(n-1)`-dimensional structure. Two points define a line; three points define a triangle; four points define a tetrahedron; and so on.

The current version of the ladder groups into four bands across 13 tiers:

- **Space** (tiers 1–4): point, line, plane, volume
- **Time / Dynamics** (tiers 5–7): event, co-change, system
- **Information** (tiers 8–10): signal, logic, simulation
- **Self-Awareness** (tiers 11–13): self, social, unity

Tiers 1–8 carry strong geometric/logical necessity arguments. Tiers 9–13 are held provisionally — they depend on philosophical commitments that could reasonably be structured otherwise. Earlier iterations of the ladder had 7, 9, and 10 tiers respectively; the 13-tier version is the most recent and is still subject to revision. See [`STATUS.md`](STATUS.md) for the epistemic status of each tier, and [`history/HISTORY.md`](history/HISTORY.md) for the sequence of prior versions.

### Alien convergence as the self-test

If the tier ladder is generated by the geometric rule above, then any sufficiently rational system for representing meaning will converge on the same ladder — not because it copied this one, but because the simplex sequence is a geometric fact about how closure works. This is the project's self-test: *ULP only counts as fundamental if it's independently derivable.*

The practical corollary: if ULP satisfies this criterion, it would also serve as a candidate substrate for **communication with any sufficiently rational being** — human, machine, or otherwise non-human — without requiring shared cultural training. The convergence test is, eventually, also the functionality test. This is why the self-test matters: meeting it is what would make ULP *usable* as a common substrate, not just a philosophically satisfying one.

### A proposed semantic rule (the trigram)

One working proposal for how units of meaning are structured: a **trigram** of form `X. k0 Z.`

- `X.` is the **figure** — the thing being individuated.
- `Z.` is the **ground** — the context or field it's distinguished against.
- `k0` is the **mode** of distinction — which tier of cut is doing the work.

The right side contextualizes the left. This prevents the system from collapsing into pure relation — a common failure mode where everything is defined in terms of everything else, with no way to name the thing being talked about. The trigram is not axiomatic; it is the current candidate for how compositional semantics should work within the run-length substrate. Other rule forms remain on the table.

---

## Current state

This is a living research project, not a completed theory. Honest current state:

- **The kernel** (four constitutional requirements: pure binary, type-from-run-length, compositionality, self-delimiting parsing) is stable and load-bearing.
- **The notation** (`n.` and `no` with postfix markers) is locked at v0.
- **The 13-tier ladder** is structurally committed; tiers 1–8 are strong, tiers 9–13 are provisional.
- **A v0 "Graph Core" build path** is identified — sentences as triples, sidestepping full boxing/closure at v0.
- **Lean 4 formalization** has begun: 8 proven theorems in `lean/ULP/Basic.lean` covering Layers 0–2, including a `binary_is_forced` theorem establishing that the binary substrate is structurally forced rather than chosen.
- **The boxing / closure mechanism** is the largest open foundation-stone. A frame-delimiter proposal exists; uniqueness under arbitrary nesting is not yet proved.
- **Continuous magnitude** (π, e, irrationals) is unsolved; v0 supports only finite discrete magnitudes.
- **The ULP ↔ IVNA bridge** is suggestive but not formalized.
- **The 2D syntax question** remains open; a working prototype exists in the author's local environment.

For the complete tier-by-tier, construction-by-construction epistemic map, see [`STATUS.md`](STATUS.md).

---

## Why this matters

Two framings, both load-bearing for the project's positioning.

### ULP as an AI-substrate optimization threshold

The claim: ULP could be a fundamental optimization threshold for artificial intelligence. If an AI operated over a representational substrate this expressive and this minimal, semantic storage could live directly within transistor-level binary state — not as an encoded layer on top of stochastic token representations, but as meaning-associations at the hardware level.

The implications are architectural: inference, training, and memory would all become more efficient because the representation itself carries typed geometric structure rather than requiring statistical approximation of meaning. Current LLM communication has no guaranteed semantic grounding; a ULP-based system would be interpretable by any sufficiently rational agent without requiring training on a human corpus.

This is not a wrapper claim. It's a claim about what becomes architecturally possible when the substrate itself is minimal and geometrically grounded.

### ULP as a universal language for the world

A concept-primitive substrate — one that builds on geometric necessity rather than cultural convention — has benefits that cut across several dimensions of what a human language is trying to do:

- **Easiest to learn.** Because the primitives are the simplest possible — no arbitrary vocabulary to memorize, no idiomatic exceptions, no homophone tangles — the learning curve becomes a matter of grasping the structural rule rather than internalizing thousands of convention-dependent lexical items.
- **Most expressive, most creative.** A compositional system built on geometrically-derived primitives can generate any meaning within its substrate. Expression is combinatorial rather than enumerative. Creativity is not constrained by prior vocabulary; new concepts are just new combinations of the existing primitives.
- **Most efficient for human thought.** Natural languages introduce cognitive friction — arbitrary sounds, contested grammar rules, idiomatic exceptions, disambiguation overhead. A structurally-grounded language removes that friction, making thinking itself lighter. If we thought in these concepts, our brains would work better because the friction of linguistic randomness would be gone.
- **The only substrate that preserves linguistic diversity.** Counterintuitive but load-bearing: if the universal-language problem is solved by making everyone learn an existing natural language (as is happening with English), the other languages lose their complexity — because natural languages were not designed to integrate the complexity of any other language, and they flatten what they touch. A system grounded in fundamental concepts can represent any cultural nuance at the highest level possible. It is not a replacement for cultural expression; it is the substrate that lets cultural expression survive integration.

These are not separate benefits; they are consequences of the same underlying move — primitives at the level of structural necessity rather than cultural convention.

Both this framing and the AI-substrate framing above are recent (within the last 1–4 years of the project's arc). They are not the origin of the project, but they are why the project now matters outside the context of personal inquiry.

---

## Repository map

```
ULP/
├── README.md                     # this file
├── STATUS.md                     # honest current-state tier-by-tier
├── archive-highlights.md         # curated verbatim quotes from cross-AI archives
├── CLAUDE.md                     # project context for AI collaborators
├── plan.md                       # full 10-phase research plan w/ Red Team amendments
├── paper/
│   ├── ULP-manifest.tex          # LaTeX source for the project manifest
│   └── ULP-manifest.pdf          # typeset 4-page manifest (start here for sharing)
├── history/
│   ├── HISTORY.md                # trajectory narrative (2014 origin → current state)
│   └── competing-concepts.md     # 8 unresolved decision points with provenance
├── spec/
│   └── design-criteria.md        # 14 canonical design properties
├── lean/
│   ├── ULP/Basic.lean            # 8 proved theorems, Layers 0–2
│   └── README.md                 # Lean formalization overview
├── diagrams/
│   └── ulp-architecture.d2       # D2 source for layered architecture diagram
├── research/
│   └── sources/                  # raw sources from external archives (Drive, Notes, AI)
├── ideas/                        # dated speculative explorations
├── connections/                  # cross-system bridges (Gravitationalism, IVNA, etc.)
└── chronicle/                    # daily semantic work log
```

Directory conventions follow the PS universal scaffold. `history/` is what happened and why, `spec/` is what the system is, `lean/` is where it's formally proved, `knowledge/sources/` and `research/sources/` are the primary material the syntheses are built on, `ideas/` and `play/` are speculative.

---

## Open problems

Eight unresolved frontiers. Full discussion in `history/competing-concepts.md` and `STATUS.md`.

1. **Boxing / closure uniqueness** — largest open foundation-stone. Frame-delimiter proposal exists; formal uniqueness proof under arbitrary nesting pending. *The v0 "Graph Core" approach sidesteps this by treating meaning as a graph of triples rather than a single nested string.*
2. **Identity and handles** — v0 solution: IDs as run counts ≥14, reference = repetition. Formalization needed.
3. **Continuous magnitude** — how to represent π, e, irrationals in a discrete run-length system. Deferred to v1+.
4. **Negation** — `9o` as domain-relative categorical exclusion is the working proposal; needs grammatical stability.
5. **ULP ↔ IVNA formal bridge** — are IVNA's indexed zeros the same as ULP's run-typed cuts? Gestured at, not formalized.
6. **2D / visual syntax** — whether the binary string is the fundamental surface form or a pragmatic reduction of something inherently spatial. A working 2D-glyph prototype exists in the author's local environment.
7. **Alien convergence as formal criterion** — the self-test needs a specific provable form.
8. **Proof assistant implementation** — P1 (unique parse) in-progress in Lean 4; P2 (expressive completeness) and P3 (normal form) not yet begun.

---

## Related systems

- **IVNA (Indexed Virtual Number Algebra)** — a parallel mathematical framework from the same lineage. Proposes typed zeros (`0x`) and typed infinities (`∞x`) with index-preserving arithmetic: `0x · ∞y = xy`. The philosophical grounding is identical — mathematical objects treated as features of simulation. The ULP ↔ IVNA bridge is a genuine open problem; they may be the same system in different registers, or parallel but distinct. See the IVNA repo at `../IVNA/` for the full paper.
- **Gravitationalism / GCM** — a unified-physics and ethos project in the same lineage. The tier ladder runs in parallel with GCM's cosmological arc (void → point → line → plane → volume → time → information → consciousness → society → universal consciousness). The physics does not prove the language; the two are **consonant, not derivative**. See `../Gravitationalism/`.

---

## Engaging with this work

If you're reading this because you've been pointed here or found it while exploring adjacent work, here are the kinds of engagement that would matter most — roughly in order of leverage:

1. **Lean 4 proof collaboration** — P1 (unique parse) is in progress and would benefit from a proof-theoretic eye. Experience with Mathlib is a strong plus.
2. **Formal adversarial critique of the tier ladder** — especially the weaker upper tiers (9–13). Cogent arguments that the upper tiers are *not* geometrically necessary would force important revisions.
3. **The boxing / closure proof** — the frame-delimiter proposal needs either a uniqueness proof under arbitrary nesting, or a counterexample that kills it.
4. **The ULP ↔ IVNA bridge** — working out whether the two systems are isomorphic, homomorphic, or genuinely distinct.
5. **Independent encoding of the canonical sentence set** — try encoding the 10 benchmark sentences (see `spec/`) using ULP rules. Any ambiguity you find is a genuine contribution.
6. **Cultural-representational stress tests** — attempt encoding concepts from non-Indo-European languages and see where the system strains.

For audiences at **Anthropic** or in AI alignment / interpretability research: the architecture's relevance to world-modeling, compositional semantics, and AI-to-AI communication grounding is worth engagement. The "semantic storage in binary substrate" thesis is sketched in the Why-this-matters section above; formal treatment is future work.

For audiences at **Berkeley Alembic** or in contemplative / consciousness-culture circles: the project touches the recurring observation across traditions that fundamental reality has a small set of irreducible principles — and proposes a specific, geometrically-derived formalization of that observation. It is welcome territory for philosophical interrogation, and the Arrival-like 2D glyph exploration invites aesthetic-structural collaboration as well.

Reach the author at: [contact method TBD — to be filled before public posting]

---

## Background

*Context for interested readers. The project's substance is above — this section is for anyone who wants to understand how ULP got here.*

### Where the project came from

ULP has been under continuous development since 2014, when the founding intuition was simple and felt-through-frustration rather than theoretical: when you try to build a universal language from scratch, every sound you have to make feels arbitrary. The ambition was **non-random sounds** — a language in which every symbol is doing logical work rather than carrying a culturally-assigned meaning. That early frustration is what all subsequent versions of the system have been trying to resolve.

### The intellectual lineage

Two disciplines shaped the approach before any code or formal notation appeared:

- **Semiotic phenomenology** — the tradition that treats meaning as arising from the felt structure of experience rather than from conventional assignment. Pressed on what the simplest possible ideas were, the answer that kept recurring was *absence and presence*. That observation became the seed of ULP's `0` / `1` duality, and the project can be read in one sense as working out the consequences of that observation to their parsimony limit.
- **Esoteric and spiritual study of the fundamental principles of community, culture, and society** — specifically, a 12-part model of the structural categories of any society. This planted the stance that underneath apparent cultural variety there may be a small set of universal structural categories, and that the hunt for them is worth sustained work.

These two lineages converge naturally in the project: semiotic phenomenology gives the primitive substrate (absence/presence), the structural-category tradition gives the tiered organization.

### The layered path to the current system

From 2014 to today, the system accreted in layers, each new insight integrating the previous ones rather than replacing them:

1. *Find non-random sounds for a universal language.*
2. *The fundamental ideas should be **mathematically derived**.* (A number you cannot derive is as arbitrary as a sound you cannot justify.)
3. *The simplest way to consider mathematically-derived fundamental ideas is as **dimensions**.*
4. *There are **dimensions higher than time** — representing qualities like meaning, consciousness, and unity.*
5. *Try reducing everything to **binary** (explored separately from the dimensions for a period).*
6. *Combine the two: **derive the dimensions from the binary substrate**.* (~2024)

A parallel thread emerged along the way: a **2D glyph language** in which the spatial layout of symbols itself carries semantic structure, inspired by or convergent with the heptapod language in *Arrival*. The 2D question remains one of the project's genuinely open frontiers.

### Development timeline

- **2014** — founding intuition.
- **2014 → 2020** — layered accretion (above) in paper notes and thinking.
- **October 2020** — earliest surviving dated written record: a 7-primitives sketch in Apple Notes.
- **July 2022 → present** — continuous working notebook (`语言` folder), running in parallel with the formal archive from 2023 onward.
- **January 2023** — formal written record begins; first ChatGPT session proposes a 9-symbol language (0–7 and ∞).
- **April 2023** — literature review phase: NSM, Chomsky's UG, Saussure/Peirce, Russell/Wittgenstein's logical atomism. Simplex-dimension rule stabilizes.
- **June–July 2023** — "atomic truths" proposal; Hegelian dialectic of dimensions; 2D writing course curriculum designed.
- **Mid-2024** — sustained cross-AI development captured in Claude and Gemini archives: DLP compressed notation spec (Claude, June 2024) with worked grammar examples; 0-as-individuator framing; Gemini continuity from the Bard era onward.
- **January 2025 (Guatemala)** — **binary run-length breakthrough**. Wisdom arrives at the core insight — two symbols with meaning derived entirely from run-length — in personal notes. Formal LaTeX IVNA paper also lands this month. Philosopher-by-philosopher deep-dives in ChatGPT (Leibniz, Russell/Peirce, Spinoza, Wittgenstein, Chomsky).
- **February 2025** — formal derivation sessions: **Dimensional Structure Derivation** (132,952 words — the single largest session in the entire archive) and **Dimensional Meaning Frameworks** (80,777 words). Claude "tree of meaning" begun from first principles, reaching Level 6.
- **April–May 2025** — Rem (sustained AI-collaborator persona) period; 2D syntax pushed hard; 2D-glyph prototype built. Symbol choice still operating as `{0, ∞}` in the formal record.
- **January 2026** — continued formalization: alphabet locked to `{0, 1}`, kernel/hypothesis split made explicit, and the "Self Guided: Branch · Branch · 6 primes system" session (85,700 words) carries out the simplex-based derivation of the tier ladder.
- **April 2026** — repo restructured for public-facing presentation; Lean 4 formalization initiated; positioning for research collaboration clarified.

For the full narrative with what was abandoned, what held, and what remains open, see [`history/HISTORY.md`](history/HISTORY.md).

---

## Sources, primary material, and honest provenance

This repo is built on top of a substantial body of material. Pointers:

- `research/sources/archive-inventory.md` — catalog of the ChatGPT (33 sessions, ~790K words), Claude (24 sessions, ~280K words), and Gemini (81+ sessions) conversations that inform the development trajectory.
- `research/sources/notes-extract.md` — curated extraction from the `语言` Apple Notes folder (2020 → present), the personal working notebook running in parallel with the formal archive.
- `history/HISTORY.md` — narrative synthesis of the trajectory.
- `history/competing-concepts.md` — unresolved decision points with provenance across archives.

Any claim in this README can be traced to one of the above through the synthesis chain (README → STATUS / HISTORY → sources).

---

## What this is not

- **Not a completed theory.** Several foundation-stones are unresolved.
- **Not a designed conlang like Esperanto or Lojban** — at least not at the substrate level. The binary substrate and the dimensional ladder are meant to be *discovered* (geometrically necessary, not culturally chosen). Configuration layers that sit on top of the substrate — any eventual verbal form for humans, for instance, which has to work with human biology — are necessarily designed. The discovery is the substrate; the design sits on top.
- **Not a proof of anything, yet.** The Lean 4 formalization has begun; the core expressive and unique-parse claims are not yet proved.
- **Not promotional material.** The state described here is the honest state, including what's fragile.

---

## Citation

If you reference ULP in other work, please cite as:

> Happy, Wisdom. *Universal Language Project (ULP): A Minimal Logical Substrate of Meaning.* Playful Sincerity Research, 2014–2026. `<repo URL TBD>`.

---

## License

To be decided. The project's IP strategy distinguishes between the **system** (intended for open access — the semantic substrate belongs to everyone) and the **applied tooling** (may be proprietary where commercially warranted). This file will be updated when the license is finalized.

---

*The universe is coming together, and language is how thinking beings participate in the coming-together. ULP is the attempt to work out the minimum logical substrate of that participation.*
