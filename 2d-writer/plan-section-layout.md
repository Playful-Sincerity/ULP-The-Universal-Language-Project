# Section 2: Visual Grammar & Layout Engine — Detailed Plan

## Overview

`js/layout-engine.js` takes an array of `SemanticNode` objects from the Semantic Engine and produces a `GlyphTree` — a fully positioned, connection-routed structure the renderer can animate directly.
This is the most intellectually novel piece of the project.
It must be both algorithmically sound (no overlaps) and aesthetically coherent (grammar encodes position).

---

## The Hard Problems — Worked Through

### Problem 1: Positioning without overlap

Shapes have variable sizes (dot ≈ 8px radius, hexagon ≈ 28px radius at medium scale).
Naive angular placement clusters nodes near center.

**Solution: Orbit-based radial placement with minimum clearance**

Place nodes on concentric orbit rings, not at arbitrary radii.
Each ring has a fixed radius step (`ORBIT_STEP = 90px`).
Nodes on the same ring are spaced angularly so their bounding circles don't intersect.
Given ring radius `r` and maximum node radius `nodeR`, the minimum arc between two nodes is `2 * nodeR + PADDING`.
Minimum angular spacing: `Δθ = arcsin((nodeR + PADDING) / r)` × 2.
If a ring fills up, the next node bumps to the next ring.

This is O(n) placement — no iteration, no physics.
It always terminates.
It always produces non-overlapping results.

### Problem 2: Grammar-directed sectors

The plan defines 5 directional meanings:
- Center = core subject
- Right = action/verb
- Above = modifiers/qualities
- Below = context/ground
- Left = origin/source

**Solution: Angular sector assignment by grammatical role**

Each POS/grammar role maps to an angular sector (degrees, 0 = right, going counter-clockwise):

| Role | Sector Center | Sector Width | Rationale |
|------|---------------|--------------|-----------|
| subject / root | 0° (center, orbit 0) | N/A | Single anchor |
| verb / action | 0° | ±35° | Right = doing |
| object / complement | 330° (slightly below-right) | ±30° | Receives the action |
| modifier / adjective / adverb | 90° | ±45° | Above = quality |
| context / adverbial / time | 270° | ±45° | Below = ground |
| origin / cause / conjunction | 180° | ±35° | Left = source |
| connector / preposition | 45° | ±20° | Upper-right bridge zone |
| unknown / other | evenly distributed | remaining arc | Fills gaps cleanly |

Multiple verbs → distribute within the verb sector, angled outward.
Multiple modifiers → stack upward in the modifier sector, increasing orbit radius.

### Problem 3: Variable node counts

**Single word (n=1):**
Root node placed at center.
No connections.
Large size (scale × 1.5).
Pulses gently.

**Short phrase, 3–5 words:**
Root at center, orbit 1.
All other nodes on orbit 1, placed in their sectors.
Connections drawn from root to each.
Dense, intimate cluster. Very readable.

**Full sentence, 10–15 words:**
Root at center.
Syntactically close nodes (direct children of root in dependency tree) on orbit 1.
Their modifiers on orbit 2.
Context nodes on orbit 2–3.
The result is a genuine radial tree — parent closer to center, children further out.

**Paragraph, 50+ words:**
Each sentence becomes a **sentence cluster** — an independent radial mini-tree.
The first sentence anchors at canvas center.
Subsequent sentences anchor at orbit positions around the first (treating each sentence root as a node on a "meta-orbit").
Inter-sentence connectors (pronouns, conjunctions referring back) are drawn as faint curved lines between clusters.
Scale shrinks proportionally to fit all clusters in view (`scaleFactor = canvasShortSide / (clusterCount * BASE_CLUSTER_RADIUS * 2.2)`).
This keeps it readable and beautiful — a galaxy of idea-constellations.

### Problem 4: Connection routing

Connections between nodes are straight lines by default.
For nodes that share the same orbit (siblings), route connections as quadratic Bezier curves that arc inward (toward center), so they don't cross other nodes.
Control point = midpoint of the two nodes, pulled 30% toward center.

**Connection types** (from the plan's grammar rules):
- Direct syntactic relationship → solid line, full opacity
- Modifier/adjectival → dashed line
- Contextual/adverbial → dotted line
- Associative (no direct link in parse) → no line, proximity only
- Cross-sentence reference → faint curved arc, low opacity (0.3)

The renderer gets pre-computed connection data; it doesn't need to make routing decisions.

### Problem 5: Growth order

Growth order determines animation sequence — the most emotionally important decision.

**Rule:**
1. Root (subject) always grows first, `growthOrder = 0`.
2. Direct children of root grow next, ordered by their sector angle counter-clockwise from 0° (`growthOrder = 1, 2, 3...`).
3. Second-level nodes grow next, same rule within their parent group.
4. For paragraphs: sentence clusters grow in reading order (sentence 1 fully, then sentence 2, etc.), but within each sentence the radial rule applies.

This produces a growth that feels like a thought forming: the subject appears, then the action, then the qualities — mimicking how meaning crystallizes.

### Problem 6: Exact GlyphNode structure

```js
{
  id: "node_0",                  // unique string ID
  word: "love",                  // original word
  shape: "pentagon",             // dot|line|arc|triangle|square|pentagon|hexagon
  color: "#FF6B6B",              // hex from color category
  secondaryColor: "#B388FF",     // optional, if multi-category
  size: 24,                      // radius in px (before any global scale)
  x: 0,                          // canvas x, center = 0
  y: 0,                          // canvas y, center = 0
  orbitIndex: 0,                 // 0=center, 1=first ring, 2=second ring...
  angleRad: 0,                   // angular position in radians
  growthOrder: 0,                // integer, lower = appears earlier
  role: "subject",               // grammatical role string
  categories: ["emotion","life"],// semantic category array
  connections: [                 // array of connection descriptors
    {
      targetId: "node_1",
      type: "solid",             // solid|dashed|dotted|arc
      weight: 1.0                // line width multiplier
    }
  ],
  label: true,                   // whether to render word text label
  sentenceIndex: 0               // which sentence cluster (paragraph mode)
}
```

`GlyphTree`:
```js
{
  nodes: GlyphNode[],
  scaleFactor: 1.0,              // global scale to fit canvas
  centerX: canvasW / 2,         // absolute canvas center
  centerY: canvasH / 2,
  mode: "word"|"phrase"|"sentence"|"paragraph",
  sentenceCount: 1
}
```

### Problem 7: Sentences vs paragraphs

Detection logic:
- 0 tokens → empty state
- 1 token → word mode
- 2–5 tokens, no sentence boundary → phrase mode
- 1 sentence (6–20 tokens) → sentence mode
- Multiple sentences or >20 tokens → paragraph mode

Paragraph mode uses the **galaxy approach**: each sentence is a mini-constellation.
Sentence roots are placed on a large outer orbit around the true canvas center, spaced evenly.
Each sentence's internal nodes are laid out relative to their sentence root using the same radial grammar rules but at reduced scale.
The canvas center itself gets a subtle pulsing dot — the "void" anchor point, consistent with ULP's philosophy.

### Problem 8: Keeping it beautiful

Beauty rules that the layout engine must enforce:
1. **No two nodes within 12px of each other** at any scale — hard constraint.
2. **Dominant node (highest semantic weight) is always largest** — size = `BASE_SIZE + (semanticWeight * 8)`.
3. **Connection lines never cross each other at acute angles** — when conflicts are detected, promote one to arc routing.
4. **Paragraph mode never places more than 8 nodes on one sentence** — overflow words get merged into compound nodes or dropped (with a console warning).
5. **Consistent visual hierarchy**: center > orbit 1 > orbit 2 > orbit 3. Nodes on higher orbits are slightly smaller (`size *= 0.85^orbitIndex`).
6. **Minimum canvas margin**: no node center is within 40px of canvas edge.

---

## Layout Algorithm — Algorithm Choice

**Recommendation: Grammar-directed radial with clearance-based orbit packing.**

Rationale for an art project built in hours:

| Approach | Beauty | Predictability | Implementation time | Verdict |
|----------|--------|----------------|---------------------|---------|
| Spiral | Medium | High | 30 min | Ignores grammar, feels random |
| Force-directed | High | Low | 2+ hours + tuning | Unpredictable, jitters |
| Grammar radial (strict) | High | High | 45 min | Can cluster in one sector |
| **Grammar radial + orbit packing** | **High** | **High** | **60 min** | **Winner** |

Force-directed is beautiful but requires dozens of physics parameters and can produce different results every run.
For a live art installation, reproducibility matters — the same text should produce the same glyph.
Grammar-directed radial is deterministic, meaningful, and aligns with ULP's center-outward growth philosophy.
The orbit packing step handles the one weakness (sector clustering) with minimal code.

The hybrid force-directed option is explicitly cut unless the basic radial version looks bad after testing.

---

## Ordered Implementation Plan

**Phase 1 — Data structures and constants (15 min)**
1. Define `GRAMMAR_SECTORS` map: role → `{ centerDeg, widthDeg }`.
2. Define `ORBIT_STEP`, `BASE_NODE_SIZE`, `PADDING`, `SIZE_DECAY_PER_ORBIT`.
3. Define `CONNECTION_TYPES` map: relationship type → `{ dash, weight }`.
4. Write `sizeForNode(semanticNode)` — computes px radius from shape type and semantic weight.
5. Write `colorForNode(semanticNode)` — extracts primary and secondary color hex strings.

**Phase 2 — Single-sentence layout (30 min)**
6. Write `buildDependencyTree(semanticNodes)` — uses the `pos` and `role` fields from SemanticNode to build a parent-child tree structure. The subject (or first noun, or first token) is root. Verbs attach to root. Objects attach to verbs. Modifiers attach to the word they modify.
7. Write `assignOrbits(tree)` — BFS from root, assigns `orbitIndex` to each node. Root = orbit 0.
8. Write `assignSectorAngle(node, parentAngle, siblings)` — places a node within its grammatical sector, distributing siblings evenly across the sector width. Returns `angleRad`.
9. Write `checkClearance(nodes)` — after initial placement, detect any node pairs within minimum clearance. For conflicts, bump the later node to next orbit.
10. Write `buildConnections(tree)` — for each parent-child pair, create a connection descriptor. Siblings get no direct line unless semantically linked.
11. Write `assignGrowthOrder(nodes)` — BFS from root, assigns `growthOrder` integers.
12. Write `computeXY(node, scaleFactor, centerX, centerY)` — converts `(orbitIndex, angleRad)` to absolute canvas `(x, y)`.

**Phase 3 — Multi-sentence / paragraph mode (20 min)**
13. Write `splitIntoSentences(semanticNodes)` — splits on sentence boundary markers from SemanticNode metadata.
14. Write `layoutParagraph(sentences, canvasW, canvasH)` — places sentence cluster centers on a meta-orbit, calls single-sentence layout for each with reduced scale.
15. Write `buildCrossLinks(sentences)` — lightweight pass to detect shared roots (pronoun references), adds faint arc connections between clusters.

**Phase 4 — Scale fitting and export (10 min)**
16. Write `fitToCanvas(nodes, canvasW, canvasH)` — computes `scaleFactor` so all nodes fit within canvas bounds with margin.
17. Write `buildGlyphTree(semanticNodes, canvasW, canvasH)` — top-level entry point. Detects mode, routes to word/phrase/sentence/paragraph path, returns `GlyphTree`.
18. Export: `export { buildGlyphTree }`.

**Phase 5 — Edge cases and beauty polish (10 min)**
19. Handle empty input → return GlyphTree with single pulsing center dot.
20. Handle single word → return GlyphTree with centered large node, no connections.
21. Handle unknown roles → distribute evenly in the "other" arc sector.
22. Handle very long sentences (>20 words) → force paragraph mode, split at conjunctions.

---

## Structured Contract

**External dependencies assumed:**
- SemanticNode array from `semantic-engine.js` with fields: `{ word, categories[], pos, role, shape, colors[], semanticWeight, sentenceBoundary }`
- Canvas dimensions `(canvasW, canvasH)` passed in at call time from UI Shell
- No external libraries — pure vanilla JS, no physics engine

**Interfaces exposed:**
```js
// Primary entry point — called by main.js
buildGlyphTree(semanticNodes: SemanticNode[], canvasW: number, canvasH: number): GlyphTree

// GlyphTree shape — consumed by renderer.js
{
  nodes: GlyphNode[],
  scaleFactor: number,
  centerX: number,
  centerY: number,
  mode: "word"|"phrase"|"sentence"|"paragraph",
  sentenceCount: number
}
```

**Technology commitments:**
- Pure ES6 module (`export { buildGlyphTree }`)
- No external dependencies (no d3, no physics library)
- Deterministic: same input → identical output every run
- Coordinate system: (0,0) = canvas top-left, with center computed from canvasW/canvasH
- All positions in absolute pixels (no relative units)
- Connection routing pre-computed (renderer just draws, no routing logic)

---

## Key Decisions

**1. Grammar-directed radial with orbit packing over force-directed.**
Force-directed requires tuning time the project doesn't have and produces non-reproducible layouts.
Radial with orbit packing is deterministic, meaningful, and implementable in ~60 minutes.

**2. Orbit rings as placement primitive, not arbitrary radius.**
Choosing orbit rings over free-radius placement ensures predictable spacing regardless of node count.
It also creates a natural visual hierarchy (inner = important, outer = contextual) that matches ULP's center-outward philosophy.

**3. Paragraph mode as galaxy of mini-constellations.**
Rather than trying to layout all 50+ words in one space, each sentence becomes its own visual object.
This mirrors how human cognition processes paragraphs — as a sequence of ideas, not one simultaneous field.
It also happens to look more beautiful at 50+ words than any single-layout approach.

**4. Growth order by BFS from root, sector-angle within level.**
This creates the most cognitively natural animation: the core idea appears first, then the action, then its qualities.
It also ensures the verb always appears before the object (natural reading order).

**5. Connection routing pre-computed in layout engine, not renderer.**
The renderer's job is animation, not geometry.
Pre-computing connection paths (including Bezier control points) keeps renderer.js simple and fast.

**6. Hard cap: 8 nodes per sentence cluster.**
50-word paragraphs at full resolution become unreadable.
The 8-node cap forces the layout engine to be selective — keeping the most syntactically important nodes and merging or dropping periphery words.
Peripheral words that get dropped are logged to console but don't cause errors.

**7. `semanticWeight` field drives node size.**
The Semantic Engine should provide a weight (0.0–1.0) reflecting how central/common the word is.
Layout uses this to size nodes, creating natural visual weight hierarchy without manual input.

---

## Surprises / Open Questions

**Surprise 1: The hardest part isn't overlap prevention.**
Orbit packing solves overlap in ~20 lines of code.
The hardest part is `buildDependencyTree` — inferring parent-child relationships from SemanticNode data.
The Semantic Engine (Section 1) needs to provide either dependency tree data directly, or enough POS/role information for the layout engine to reconstruct one.
If Section 1 only provides a flat array with POS tags and no dependency relationships, `buildDependencyTree` has to guess — and guessing wrong makes the whole spatial grammar break.

**Open question 1: Does the Semantic Engine provide dependency data?**
If compromise.js (Section 1's NLP library) exposes parent-child dependency relationships (which it does — `nlp.match().out('json')` includes `chunk` info), the layout engine can use that.
If not, fallback heuristic: nouns → root candidates, verbs → attach to nearest noun, adjectives → attach to next noun.

**Open question 2: What's the visual weight of connectors vs nodes?**
Should connections be as visually prominent as nodes, or recede?
The plan says "colored shapes with spatial grammar" suggesting shapes are primary.
Recommendation: connections at 40% opacity, nodes at 100%. But the renderer should be able to override this.

**Open question 3: Should node labels (word text) render in layout engine or renderer?**
Layout engine currently sets `label: true/false` and provides `word` string.
Renderer controls font, size, fade timing.
This split is clean.
But what if the renderer needs to know bounding box of the label text to prevent overlap?
Canvas text width is not knowable without a rendering context.
Resolution: layout engine reserves a fixed text clearance zone of `nodeRadius + 20px` below each node.
Renderer renders text there without needing layout feedback.

**What to cut if time is tight:**
Cut in this order:
1. Cross-sentence arc links in paragraph mode (hard to make beautiful, low visual impact)
2. Bezier arc routing for same-orbit connections (straight lines still look good)
3. `semanticWeight`-driven node sizing (uniform sizes still work)
4. Paragraph mode entirely — cap at 20-word single sentence, display a warning for longer input

**Minimum viable layout engine:**
`buildGlyphTree` → places root at center, all other nodes on orbit 1 in sector by role, straight connections to root.
That's ~80 lines of code and produces a working, beautiful result for sentences up to 8 words.
Everything else is progressive enhancement.

---

## Appendix: SemanticNode → GlyphNode Transformation Reference

```
SemanticNode.word          → GlyphNode.word
SemanticNode.shape         → GlyphNode.shape
SemanticNode.colors[0]     → GlyphNode.color
SemanticNode.colors[1]     → GlyphNode.secondaryColor (optional)
SemanticNode.pos           → used to determine role if SemanticNode.role absent
SemanticNode.semanticWeight → used to compute GlyphNode.size
SemanticNode.categories    → GlyphNode.categories
SemanticNode.sentenceBoundary → used to split into sentence clusters

Computed by layout engine:
GlyphNode.x, .y            ← from orbit + angle + scaleFactor
GlyphNode.orbitIndex       ← from BFS depth in dependency tree
GlyphNode.angleRad         ← from GRAMMAR_SECTORS + sibling distribution
GlyphNode.growthOrder      ← from BFS traversal order
GlyphNode.connections      ← from dependency tree edges
GlyphNode.sentenceIndex    ← from sentence split pass
```
