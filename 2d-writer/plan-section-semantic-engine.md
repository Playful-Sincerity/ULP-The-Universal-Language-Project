# Section 1: Semantic Engine — Detailed Implementation Plan

## Scope

Three files:
- `js/dictionary.js` — hand-crafted word → SemanticNode mapping (~200 words)
- `js/conceptnet.js` — ConceptNet API fallback (async, cached)
- `js/semantic-engine.js` — tokenizer + decomposer + category tagger; public API

---

## SemanticNode — Data Structure

```js
{
  // Input
  raw: "love",            // string — original word, case-preserved
  normalized: "love",     // string — lowercased, stemmed (from compromise.js .normalize())

  // Grammatical role (from compromise.js POS tagging)
  pos: "Verb",            // string — "Noun" | "Verb" | "Adjective" | "Adverb" |
                          //          "Preposition" | "Conjunction" | "Determiner" |
                          //          "Pronoun" | "Unknown"
  grammarRole: "subject", // string — "subject" | "verb" | "object" |
                          //          "modifier" | "connector" | "unknown"
                          //          (coarser slot for layout engine)

  // Semantic classification
  categories: ["emotion"],  // string[] — 1 to 3 category keys from CATEGORIES constant
                            // Always at least one entry; never empty
  primaryCategory: "emotion", // string — categories[0]; used for color lookup

  // Visual properties (derived; consumed directly by layout engine)
  color: "#FF6B6B",       // string — hex from CATEGORY_COLORS lookup
  shape: "pentagon",      // string — "dot" | "line" | "curve" | "triangle" |
                          //          "square" | "pentagon" | "hexagon"
  weight: 1.2,            // number — 0.5 to 2.0; relative size/importance
                          // 1.0 = neutral; verbs/nouns trend heavier

  // Source metadata (for debugging + display)
  source: "dictionary",   // string — "dictionary" | "conceptnet" | "pos-inferred" | "unknown"
  confidence: 0.9,        // number — 0.0 to 1.0; informs glyph opacity or line weight

  // Position hint for layout engine (optional, may be null)
  // Dictionary entries can pre-suggest layout direction
  layoutHint: "center",   // string | null — "center" | "right" | "above" | "below" | "left" | null
}
```

Design notes:
- `categories` is an array so multi-dimensional words (e.g., "water" = nature + existence) render as blended colors or layered shapes.
- `shape` is resolved by the engine, not the layout engine — section 2 only places and animates.
- `layoutHint` is optional decoration; section 2 uses its own grammar rules but can defer to hints.
- `confidence` drives rendering opacity so uncertain (ConceptNet-inferred) nodes feel appropriately ghostly.

---

## The 12 Categories — Keys and Colors

```js
const CATEGORIES = {
  existence:   { color: "#FFFFFF", label: "Existence / Being" },
  emotion:     { color: "#FF6B6B", label: "Emotion / Feeling" },
  thought:     { color: "#B388FF", label: "Thought / Mind" },
  action:      { color: "#FFB347", label: "Action / Motion" },
  nature:      { color: "#4ECDC4", label: "Nature / Life" },
  structure:   { color: "#45B7D1", label: "Structure / Order" },
  relation:    { color: "#FFD93D", label: "Relation / Connection" },
  time:        { color: "#26A69A", label: "Time / Change" },
  space:       { color: "#5C6BC0", label: "Space / Place" },
  quantity:    { color: "#B0BEC5", label: "Quantity / Measure" },
  quality:     { color: "#F48FB1", label: "Quality / Attribute" },
  expression:  { color: "#AED581", label: "Expression / Language" },
};
```

These keys are the canonical strings used in `categories[]` and `primaryCategory`.

---

## Shape Selection Logic

Shape encodes complexity.
The engine resolves shape from `pos` + `categories` + word-length-as-proxy-for-abstraction.

```
Rule 1 — POS-first defaults:
  Determiner / Article   → dot       (atomic, particle)
  Preposition            → line      (relational direction)
  Conjunction            → line      (connector)
  Adverb                 → curve     (modifier, softens)
  Adjective              → curve     (quality, gradual)
  Pronoun                → triangle  (hierarchical — self/other/it)
  Verb (concrete action) → square    (grounded action)
  Noun (concrete)        → square    (thing, stable)
  Verb (abstract/state)  → pentagon  (process, living)
  Noun (abstract)        → hexagon   (integrated concept)

Rule 2 — Category overrides (applied after POS default):
  existence category     → bumps shape DOWN one tier (more atomic)
  relation category      → forces line or curve (it IS a connector)
  nature category        → bumps shape to pentagon minimum
  thought / expression   → bumps abstract nouns to hexagon

Rule 3 — Multi-category escalation:
  If categories.length >= 3  → bump shape one tier UP
  If categories.length == 1 && category == "existence" → dot

Rule 4 — Dictionary overrides:
  Hand-crafted entries can set shape explicitly; overrides all rules.
```

The shape tier order: dot < line < curve < triangle < square < pentagon < hexagon.
"Bump up/down" means move one step along this sequence.

---

## `js/dictionary.js` — Design

### Architecture

A single exported constant `DICTIONARY` — a plain object mapping normalized word strings to partial SemanticNode descriptors (the engine fills in the rest at runtime).

```js
// Each entry is a partial SemanticNode (engine fills: raw, normalized, pos, grammarRole, color, weight, source, confidence)
const DICTIONARY = {
  "love": {
    categories: ["emotion", "relation"],
    shape: "pentagon",
    layoutHint: "center",
  },
  "grow": {
    categories: ["action", "nature"],
    shape: "pentagon",
  },
  // ...
};
```

Entries only need `categories` at minimum.
`shape` and `layoutHint` are optional overrides.
The engine computes everything else.

### Coverage Strategy

The ~200 words should cover:
1. The highest-frequency English words (top 200 by corpus frequency) — articles, prepositions, conjunctions, pronouns get simple entries, mostly dot/line.
2. All 12 categories need at least 10–15 "flagship" words each so no category ever feels missing.
3. The demo sentence pool (Section 5) — every word in pre-written demos should be in the dictionary to avoid ConceptNet dependency during demos.
4. ULP/PS vocabulary — words like "presence", "void", "gravity", "connection", "wisdom", "becoming", "together" that will appear in curated demos.

### Vocabulary Selection by Category (~30 illustrative examples)

| Word | Categories | Shape | Notes |
|------|-----------|-------|-------|
| **existence** | | | |
| "is" | existence | dot | Core copula |
| "be" | existence | dot | |
| "exist" | existence, action | line | Active existence |
| **emotion** | | | |
| "love" | emotion, relation | pentagon | |
| "fear" | emotion | square | Grounded, heavy |
| "joy" | emotion, nature | pentagon | |
| "grief" | emotion, time | square | |
| **thought** | | | |
| "know" | thought, action | pentagon | |
| "believe" | thought | hexagon | Abstract state |
| "imagine" | thought, expression | hexagon | |
| **action** | | | |
| "grow" | action, nature | pentagon | |
| "build" | action, structure | square | |
| "flow" | action, nature | curve | |
| "create" | action, expression | pentagon | |
| **nature** | | | |
| "tree" | nature | square | |
| "water" | nature, existence | pentagon | |
| "light" | nature, existence | curve | |
| "seed" | nature, time | triangle | |
| **structure** | | | |
| "form" | structure | square | |
| "pattern" | structure, thought | hexagon | |
| "order" | structure | triangle | |
| **relation** | | | |
| "through" | relation, space | line | |
| "with" | relation | line | |
| "between" | relation, space | line | |
| "connection" | relation, structure | hexagon | |
| **time** | | | |
| "become" | time, action | pentagon | |
| "change" | time, action | pentagon | |
| "moment" | time | square | |
| **space** | | | |
| "center" | space, existence | hexagon | ULP core concept |
| "within" | space, relation | line | |
| "world" | space, nature | hexagon | |
| **quantity** | | | |
| "all" | quantity, existence | triangle | |
| "more" | quantity | curve | |
| "one" | quantity, existence | dot | |
| **quality** | | | |
| "beautiful" | quality, emotion | curve | |
| "true" | quality, thought | triangle | |
| "deep" | quality, space | curve | |
| **expression** | | | |
| "speak" | expression, action | square | |
| "word" | expression | square | |
| "silence" | expression, existence | dot | |

The complete 200-word list will be built out during implementation,
prioritizing: (a) all words in Section 5 demo content, (b) top-50 English words by frequency,
(c) filling remaining category gaps evenly.

---

## `js/conceptnet.js` — Design

### Role

Async fallback when a word is not in `DICTIONARY`.
Returns a partial SemanticNode descriptor, same shape as a dictionary entry.

### API

```js
// Public interface
async function lookupConceptNet(word) → { categories, confidence } | null
```

Returns null on any failure (network, parse error, rate limit).
Caller (semantic-engine) handles null by using pos-inferred defaults.

### ConceptNet Query Strategy

ConceptNet's REST API: `https://api.conceptnet.io/c/en/{word}?limit=20`

Response parsing strategy:
1. Fetch edges where `start.@id` = `/c/en/{word}` OR `end.@id` = `/c/en/{word}`.
2. Map ConceptNet relation types to our 12 categories:

```
/r/IsA             → structure (hierarchical)
/r/HasProperty     → quality
/r/CapableOf       → action
/r/Causes          → action, time
/r/UsedFor         → action
/r/AtLocation      → space
/r/RelatedTo       → relation
/r/PartOf          → structure, relation
/r/HasContext      → thought (meta-knowledge)
/r/ReceivesAction  → action
/r/HasSubevent     → time
/r/Desires         → emotion
/r/CausesDesire    → emotion
/r/MotivatedByGoal → thought, action
/r/SymbolOf        → expression
/r/DerivedFrom     → existence
/r/FormOf          → existence
```

3. Tally category votes from the edges.
4. Return top 1–3 categories by vote count with `confidence = topVotes / totalEdges` (capped at 0.85 — ConceptNet is never as confident as the dictionary).

### Caching

In-memory cache (plain object) keyed by normalized word.
Cache survives for the session lifetime.
No localStorage — no need for persistence; reduces complexity.

```js
const _cache = {};

async function lookupConceptNet(word) {
  if (_cache[word] !== undefined) return _cache[word];
  // ... fetch ...
  _cache[word] = result;  // null if failed
  return result;
}
```

### Timeout and Failure Policy

- AbortController with 3-second timeout.
- On timeout or non-200 response: return null, log to console.warn (not console.error — non-fatal).
- Rate limiting: if 3 consecutive failures, set `_conceptNetAvailable = false` and skip all future calls for this session.
  This prevents the demo from hanging if the user is offline or ConceptNet is down.

---

## `js/semantic-engine.js` — Design

### Public API

```js
// Synchronous tokenization (compromise.js is sync)
function tokenize(text) → Token[]

// Async full decomposition — resolves ConceptNet in parallel
async function analyze(text) → SemanticNode[]

// Synchronous analysis using only dictionary + pos-inferred (no network)
function analyzeSync(text) → SemanticNode[]
```

`analyzeSync` is the primary path for real-time typing feedback.
`analyze` (async) is used for final render; upgrades nodes from pos-inferred → ConceptNet where available.

### Token Shape

```js
{
  raw: "growing",
  normalized: "grow",    // compromise.js .normalize()
  pos: "Verb",
  grammarRole: "verb",   // derived from compromise sentence analysis
  index: 2,              // position in token array (for ordering in layout)
}
```

### Processing Pipeline

```
tokenize(text)
  → compromise.js parses text
  → extracts terms with .json() for POS tags
  → maps compromise POS tags to our coarser set
  → maps sentence position to grammarRole
  → returns Token[]

analyzeSync(token[])
  → for each Token:
      1. Look up normalized word in DICTIONARY
      2. If found → use dictionary entry, source = "dictionary", confidence = 1.0
      3. If not found → run shape-selection rules from POS alone, source = "pos-inferred", confidence = 0.6
      4. Merge: token fields + resolved fields → SemanticNode
  → returns SemanticNode[]

analyze(text) [async upgrade]
  → call analyzeSync(text) for immediate result
  → for all nodes with source = "pos-inferred":
      await lookupConceptNet(node.normalized)
      if result: upgrade node's categories, shape (re-resolve), source = "conceptnet", confidence = result.confidence
  → returns upgraded SemanticNode[]
```

### Grammar Role Mapping

compromise.js provides rich POS. We need a coarser slot:

```
compromise .subjects()     → grammarRole = "subject"
compromise .verbs()        → grammarRole = "verb"
complement / object noun   → grammarRole = "object"
compromise .adjectives()   → grammarRole = "modifier"
compromise .adverbs()      → grammarRole = "modifier"
complement / preposition   → grammarRole = "connector"
anything else              → grammarRole = "unknown"
```

For multi-sentence paragraphs:
- Analyze each sentence independently.
- Concatenate all SemanticNode arrays.
- Assign `sentenceIndex` (integer, 0-based) to each node.
- Section 2 uses sentenceIndex to space sentence clusters.

### Handling Multi-Word Phrases

Heuristic approach (not full NLP coreference):

1. After tokenizing, scan for consecutive noun+noun and adjective+noun pairs.
2. If the bigram matches a dictionary entry (e.g., "dark matter", "free will", "human nature"), merge into one SemanticNode representing the phrase.
3. Otherwise, process each word independently.
4. Dictionary will contain ~20 known important bigrams (PS/ULP vocabulary).

This keeps the implementation simple while handling the most impactful multi-word cases.

### Full Paragraph Handling

```
text → split by sentence-ending punctuation (use compromise .sentences())
     → analyze each sentence → SemanticNode[] with sentenceIndex
     → return flat array, all nodes, sentenceIndex preserved
```

Section 2 receives this flat array and handles clustering by sentenceIndex.

---

## Output Contract: What Section 2 (Layout) Consumes

Section 2 receives `SemanticNode[]` with these guaranteed fields:

| Field | Guaranteed? | Notes |
|-------|-------------|-------|
| `raw` | yes | |
| `normalized` | yes | |
| `pos` | yes | one of the 9 POS strings |
| `grammarRole` | yes | one of 6 role strings |
| `categories` | yes | array, len 1–3, valid keys |
| `primaryCategory` | yes | string, valid key |
| `color` | yes | hex string |
| `shape` | yes | one of 7 shape strings |
| `weight` | yes | 0.5–2.0 |
| `source` | yes | source string |
| `confidence` | yes | 0.0–1.0 |
| `layoutHint` | optional | may be null |
| `sentenceIndex` | yes | integer, 0-based |

Section 2 must handle `layoutHint: null` gracefully (it usually will be null).

---

## Implementation Order

1. **Write `js/dictionary.js`** — the core vocabulary (~200 entries).
   Start with: all words in the demo sentences (Section 5 seed list), top-50 English words, then fill each category to ≥12 entries.
   No external dependencies. Fully testable synchronously.

2. **Write `js/semantic-engine.js` — `tokenize()` and `analyzeSync()`** — these are synchronous and testable without network. Use compromise.js (already loaded via CDN in index.html).

3. **Write shape-resolution logic** in semantic-engine.js — the POS → shape rule cascade.

4. **Write category → color lookup** — thin wrapper over the CATEGORIES constant.

5. **Write `js/conceptnet.js`** — async lookup with cache + timeout + failure circuit-breaker.

6. **Wire `analyze()` (async)** in semantic-engine.js — calls analyzeSync then upgrades via conceptnet.

7. **Test with the success-criteria sentence**: `"love grows through connection"` in browser console.
   Expected output:
   ```
   [
     { normalized: "love",       pos: "Noun",        grammarRole: "subject",   categories: ["emotion","relation"], shape: "pentagon", color: "#FF6B6B" },
     { normalized: "grow",       pos: "Verb",        grammarRole: "verb",      categories: ["action","nature"],    shape: "pentagon", color: "#FFB347" },
     { normalized: "through",    pos: "Preposition", grammarRole: "connector", categories: ["relation","space"],   shape: "line",     color: "#FFD93D" },
     { normalized: "connection", pos: "Noun",        grammarRole: "object",    categories: ["relation","structure"], shape: "hexagon", color: "#FFD93D" },
   ]
   ```

8. **Test edge cases**: empty string, single word, unknown word, all-caps, paragraph with 3 sentences.

---

## Reasoning Audit

### Where initial assumptions held

- compromise.js POS tagging is reliable enough for this art use case.
  We don't need perfect grammar parsing — we need good-enough role signals for spatial positioning.
  compromise.js handles English sentences well and returns structured JSON; the mapping to our 6 grammar roles is straightforward.

- The dictionary-first strategy is the right call.
  ConceptNet is powerful but slow (~200–500ms per request) and unreliable in offline/demo contexts.
  A 200-word dictionary covers the vast majority of high-value vocabulary.
  The art quality of demos should never depend on network.

- The SemanticNode as the section boundary works cleanly.
  Section 2 only needs categories, shape, color, and grammarRole — all of which Section 1 fully resolves.
  The interface is narrow and stable.

### Where assumptions broke or required revision

- **POS alone is insufficient for shape selection.**
  Initial assumption: POS → shape is a clean 1:1 mapping.
  Reality: "water" (Noun) should be pentagon (living, flowing), not square (concrete stable thing).
  The category-override rules (Rule 2 above) are necessary to get aesthetically correct shapes.
  This adds complexity to shape resolution but is manageable as a rule cascade.

- **Grammar role is underdetermined for single-word inputs.**
  A user typing "love" alone has no subject/verb/object structure.
  Resolution: single-token inputs default to grammarRole = "center" (a seventh role added for this case).
  Section 2 places grammarRole = "center" at the canvas center by default.

- **ConceptNet is not reliably useful for common abstract English words.**
  "Love", "grow", "through", "connection" are exactly the kind of words ConceptNet has *too much* data on —
  the edges are noisy and diffuse, spreading votes across many categories.
  Resolution: keep ConceptNet strictly as a fallback for *unknown* words (unusual vocabulary, proper nouns, coinages).
  High-frequency words should be in the dictionary and ConceptNet should never be consulted for them.

- **Multi-word phrase merging risks false positives.**
  "Dark matter" merges correctly; "dark night" should not merge into a single concept node.
  Resolution: only merge bigrams that appear as explicit entries in the dictionary.
  No automatic bigram inference.
  This limits phrase coverage to ~20 known bigrams but eliminates false-positive merges.

### Trickiest part

The shape-selection rule cascade is the most judgment-heavy code.
There's no ground truth — the rules produce what "feels right" aesthetically.
The risk is spending too long tuning rules instead of building.
**Mitigation**: write the simplest POS-only rules first, ship a working version, then tune shapes
during Section 5 (demo content creation) when aesthetic feedback is available.

### What to cut if time is tight

1. **Multi-word phrase merging** — cut entirely; process all words independently.
   Impact: "free will" becomes two nodes instead of one. Acceptable.

2. **ConceptNet fallback** — reduce to a stub that always returns null.
   Impact: unknown words render as generic dots. Acceptable for a 3-hour art project.
   The dictionary will cover all demo content.

3. **`analyze()` async upgrade** — use only `analyzeSync()`.
   Impact: ConceptNet never consulted. Same as item 2.

4. **`layoutHint` in dictionary entries** — omit entirely.
   Impact: layout engine uses its own grammar rules for everything. Fine.

5. **sentenceIndex on nodes** — simplify: treat full paragraphs as a flat list.
   Impact: multi-sentence paragraphs won't cluster by sentence. Acceptable degradation.

---

## Open Questions

1. **compromise.js POS tagging for short inputs** — does `"love grows through connection"` produce reliable POS tags?
   Need to verify in browser console before trusting the pipeline.
   Fallback: if compromise returns "Unknown" for >50% of tokens, treat whole input as a noun phrase and assign roles by word order (word 1 = subject, word 2 = verb, etc.).

2. **ConceptNet CORS policy** — does `api.conceptnet.io` allow browser-side fetch requests from `file://` origins?
   If not, ConceptNet becomes completely unusable without a local proxy.
   Resolution path: test in browser on day one; if blocked, promote ConceptNet to "cut" immediately.

3. **Color blending for multi-category nodes** — Section 1 exposes `color` as a single hex (the primary category's color).
   But Section 3 (Renderer) might want to blend colors for multi-category nodes.
   Should Section 1 expose a `colors: string[]` array (one per category) in addition to `color`?
   Recommendation: add `colors` now (cheap), let Section 3 decide whether to use it.

4. **Weight calculation** — the current spec sets weight to 1.2 for important words.
   What's the actual formula?
   Proposal: `weight = 1.0 + (categories.length - 1) * 0.15 + (grammarRole === "subject" ? 0.2 : 0)`.
   This gives subjects and multi-category words slightly more mass.
   Needs validation against visual output.

5. **"Unknown" fallback color** — plan.md says unknown words render as "dim white."
   Is dim white `#FFFFFF` at reduced opacity, or a separate gray hex like `#666666`?
   Recommend: use `#888888` as the unknown hex so it's visually distinct from existence white `#FFFFFF`.
   Section 3 can still reduce opacity via `confidence`, but the base color is clearly different.
