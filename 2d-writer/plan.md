# 2D Writer — Deep Plan

## Assumptions (Art-First Mode)

- This is an **art project**, not a formal ULP encoding. Beautiful first, rigorous second.
- Can be retrofitted to connect to ULP's binary run-length system later.
- ULP's philosophical spirit (void/presence duality, dimensional progression, center-outward growth) informs the aesthetic, not the data model.
- **Transparent background** — designed for projection onto walls. No borders, no visible container.
- **Color is a primary semantic channel** — ~12 intuitive color categories.
- **Time constraint**: ~3 hours. Ship a working, beautiful thing.

---

## Cross-Cutting Concerns

### Core Data Model

```
English Text
    ↓ tokenize (compromise.js — lightweight NLP)
Words + Grammar Roles (subject, verb, object, modifier, connector)
    ↓ decompose (hand-crafted dictionary + ConceptNet fallback)
Semantic Primitives (tagged with 1-3 of 12 semantic categories)
    ↓ layout engine
2D Glyph Tree (nodes with: shape, color, position, size, connections)
    ↓ renderer
Animated p5.js canvas (growth from center outward)
```

**Entities:**
- `Token` — a word with its grammatical role and raw text
- `SemanticNode` — a decomposed concept with category tags, color, shape type
- `GlyphNode` — a positioned visual element (x, y, shape, color, size, connections[], growthOrder)
- `GlyphTree` — the full 2D structure ready for rendering
- `Demo` — a pre-written paragraph + optional metadata

### Technology Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Rendering | **p5.js** (CDN) | Fastest to beautiful growth animation |
| NLP tokenizer | **compromise.js** (CDN) | Lightweight, browser-native, good POS tagging |
| Semantic data | **Hand-crafted JSON** (~200 words) + **ConceptNet API** fallback | Controlled core + extensible |
| UI framework | **Vanilla HTML/CSS/JS** | No build step. Open index.html and go. |
| Hosting | **Local file / simple HTTP server** | Zero deployment friction |

### 12 Semantic Color Categories

| # | Category | Color | Hex | Intuitive Meaning |
|---|----------|-------|-----|-------------------|
| 1 | Existence / Being | Bright white | `#FFFFFF` | Pure presence, "this is" |
| 2 | Emotion / Feeling | Warm coral | `#FF6B6B` | Heart, warmth, passion |
| 3 | Thought / Mind | Soft violet | `#B388FF` | Intellect, awareness, knowing |
| 4 | Action / Motion | Amber orange | `#FFB347` | Doing, movement, energy |
| 5 | Nature / Life | Emerald green | `#4ECDC4` | Growth, living systems, organic |
| 6 | Structure / Order | Cyan blue | `#45B7D1` | Logic, form, architecture |
| 7 | Relation / Connection | Warm gold | `#FFD93D` | Bonds, links, togetherness |
| 8 | Time / Change | Teal | `#26A69A` | Flow, process, becoming |
| 9 | Space / Place | Deep indigo | `#5C6BC0` | Location, container, world |
| 10 | Quantity / Measure | Silver | `#B0BEC5` | Numbers, degree, amount |
| 11 | Quality / Attribute | Rose pink | `#F48FB1` | Properties, beauty, character |
| 12 | Expression / Language | Lime green | `#AED581` | Words, symbols, communication |

### 7 Visual Primitives (Shapes — Dot through Hexagon)

Principle: **more sides = more complexity/integration**. A dot is atomic; a hexagon is a rich, integrated concept.

| Shape | Sides | Meaning | When Used |
|-------|-------|---------|-----------|
| **Dot** | 0 | Atomic existence, a point of being | Particles, articles, the simplest units |
| **Line** | 1 | Direction, flow, connection | Verbs, actions, relationships between things |
| **Curve/Arc** | ~1.5 | Continuity, softness, gradual change | Modifiers, adverbs, qualities |
| **Triangle** | 3 | Structure, tension, hierarchy | Structural concepts, contrasts, foundations |
| **Square** | 4 | Stability, order, container | Concrete nouns, places, physical things |
| **Pentagon** | 5 | Complexity, living systems, growth | Living things, processes, dynamic concepts |
| **Hexagon** | 6 | Integration, wholeness, highest order | Abstract ideas, philosophies, unified concepts |

Circle (∞ sides) reserved as a **connector/boundary** element, not a concept shape — used to enclose related clusters or mark completeness.

### 2D Grammar Rules

**Spatial position encodes grammatical role:**
- **Center** = core concept (subject or main idea)
- **Right** = action/verb (what the subject does)
- **Above** = modifiers/qualities (how/what kind)
- **Below** = ground/context (where, when, why)
- **Left** = origin/source (from what, caused by)

**Distance from center = semantic distance:**
- Close = directly related, essential
- Far = contextual, peripheral

**Connection types:**
- Solid line = direct relationship
- Dotted/dashed = indirect/implied
- Curved connector = flowing/causal
- No line (proximity only) = associative

**Multiple words in a sentence:**
- Words form a constellation growing from center
- Grammatically parallel ideas share the same radial angle
- Sequential actions spiral outward clockwise

### Naming Conventions

- Files: `kebab-case.js`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case`

### Error Handling

- ConceptNet API fails → fall back to "unknown" category (rendered as dim white)
- Unknown word not in dictionary → show as generic dot with white color
- Empty input → show subtle pulsing center dot as invitation

---

## Meta-Plan

### Goal

Build a browser-based art installation that translates English text into beautiful, animated 2D glyphs that grow outward from center. The app takes text input, decomposes words into semantic primitives, maps them to colored shapes with spatial grammar, and animates the construction in real-time. Pre-made demos showcase PS writings as clickable bubbles. Designed for projection (transparent background, luminous aesthetic).

### Sections

1. **Semantic Engine** — Tokenize English, decompose to primitives, tag with categories + colors
   - Complexity: M
   - Risk: Medium — ConceptNet API reliability; hand-crafted dictionary coverage
   - Success criteria: Given "love grows through connection", outputs an array of SemanticNodes with correct categories and colors

2. **Visual Grammar & Layout** — Convert SemanticNodes into positioned GlyphNodes using 2D spatial rules
   - Complexity: M
   - Risk: Medium — spatial layout is the most novel/uncertain part
   - Success criteria: Given SemanticNodes, produces a GlyphTree where shapes don't overlap and spatial positions reflect grammar

3. **Renderer (p5.js)** — Animate glyph growth from center, handle glow/color/transparency
   - Complexity: L
   - Risk: Low — p5.js is well-suited; growth animation is a known pattern
   - Success criteria: Beautiful, smooth animation of glyph growing from center. Transparent background. Glowing colored lines.

4. **UI Shell** — Input bar, demo bubbles, semantic breakdown display, responsive layout
   - Complexity: S
   - Risk: Low — standard HTML/CSS
   - Success criteria: Clean input at bottom, clickable demo pills above it, glyph canvas fills the space, description shows below glyph

5. **Demo Content** — Curated paragraphs from PS writings, pre-tagged for instant display
   - Complexity: S
   - Risk: Low — just content curation + data entry
   - Success criteria: 5-8 clickable demos that produce impressive, varied glyphs

### Dependency Graph

```
Section 1 (Semantic Engine) → Section 2 (Layout needs semantic output format)
Section 2 (Layout) → Section 3 (Renderer needs positioned glyph tree)
Section 4 (UI Shell) — independent, can build in parallel
Section 5 (Demo Content) — depends on Section 1 (needs to validate against engine)

Parallel batch 1: Section 1 + Section 4
Parallel batch 2: Section 2 + Section 5
Sequential: Section 3 (needs 1+2 done)
Integration: wire everything together
```

### Overall Success Criteria

1. Open `index.html` → see a clean interface with demo bubbles and input bar
2. Click a demo bubble → watch a beautiful glyph grow from center with colored, glowing shapes
3. Type custom text → glyph generates in real-time
4. The glyph visually communicates the semantic structure (someone could learn to "read" it)
5. Works on transparent/dark background for projection
6. Runs entirely in browser, no build step, no backend (except optional ConceptNet calls)

### Estimated File Structure

```
~/ULP/2d-writer/
├── index.html              ← single entry point
├── css/
│   └── style.css           ← layout, input bar, demo pills, glow effects
├── js/
│   ├── main.js             ← app initialization, event wiring
│   ├── semantic-engine.js  ← tokenizer + decomposer + category tagger
│   ├── dictionary.js       ← hand-crafted word → primitives mapping (~200 words)
│   ├── conceptnet.js       ← ConceptNet API fallback client
│   ├── layout-engine.js    ← 2D spatial grammar, GlyphTree builder
│   ├── renderer.js         ← p5.js sketch, growth animation, glow
│   └── demos.js            ← pre-written demo paragraphs
├── plan.md                 ← this file
└── plan-section-*.md       ← detailed section plans
```

---

## Reconciliation Report

### Resolved Conflicts

All 6 interface mismatches resolved. Unified contract below.

### Unified Interface Contract

#### SemanticNode (Section 1 → Section 2)

```js
{
  word: string,           // original word text
  pos: string,            // "Noun"|"Verb"|"Adjective"|"Adverb"|"Preposition"|"Conjunction"|"Determiner"|"Pronoun"|"Unknown"
  role: string,           // "subject"|"verb"|"object"|"modifier"|"connector"|"context"|"unknown"
  categories: string[],   // 1-3 keys from CATEGORIES (e.g. ["emotion", "relation"])
  color: string,          // hex of primary category (e.g. "#FF6B6B")
  colors: string[],       // hex array of all categories
  shape: string,          // "dot"|"line"|"curve"|"triangle"|"square"|"pentagon"|"hexagon"
  weight: number,         // 0.5-2.0, relative importance
  parentIndex: number,    // index of parent node in array (-1 for root)
  sentenceIndex: number,  // which sentence this word belongs to (0-based)
  source: string,         // "dictionary"|"conceptnet"|"pos-inferred"
  confidence: number,     // 0.0-1.0
}
```

#### GlyphTree (Section 2 → Section 3)

```js
{
  nodes: GlyphNode[],
  connections: Connection[],  // flat array, top-level
  centerX: number,
  centerY: number,
  scaleFactor: number,
}
```

#### GlyphNode

```js
{
  id: string,
  word: string,
  shape: string,         // "dot"|"line"|"curve"|"triangle"|"square"|"pentagon"|"hexagon"
  color: string,         // primary hex
  secondaryColor: string|null,
  size: number,          // radius in px
  x: number,             // absolute canvas position
  y: number,
  growthOrder: number,   // 0 = first (center), ascending outward
  role: string,
  sentenceIndex: number,
}
```

#### Connection

```js
{
  fromId: string,
  toId: string,
  type: string,          // "solid"|"dashed"|"dotted"|"curved"
  color: string,         // hex
  weight: number,        // line width multiplier (default 1.0)
}
```

#### Public APIs (called by main.js)

```js
// Semantic Engine
window.SemanticEngine = {
  analyze(text) → Promise<SemanticNode[]>,
  analyzeSync(text) → SemanticNode[],
  CATEGORIES: { [key]: { color, label } },
};

// Layout Engine
window.LayoutEngine = {
  buildGlyphTree(semanticNodes, canvasW, canvasH) → GlyphTree,
};

// Renderer
window.Renderer = {
  create(containerId) → renderer,
};
// renderer instance:
//   .setGlyphTree(glyphTree) — triggers fade→grow
//   .resize() — handles window resize
```

### Build Order (Execution Plan)

```
Phase 1 (parallel):  dictionary.js + conceptnet.js + style.css
Phase 2 (parallel):  semantic-engine.js + demos.js
Phase 3 (sequential): layout-engine.js (depends on SemanticNode contract)
Phase 4 (sequential): renderer.js (depends on GlyphTree contract)
Phase 5:             main.js (wires everything together)
Phase 6:             test + polish
```

Max nodes per sentence: **15** (raised from 8 to accommodate demos).
Shape name standard: **"curve"** (not "arc").
ConceptNet: will use HTTP server (not file://) to avoid CORS issues.
