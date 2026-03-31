# Section 4 (UI Shell) + Section 5 (Demo Content) — Detailed Plan

## Context

Sections 4 and 5 are planned together because they are tightly coupled:
the demo pill layout and content both depend on the same `#demos` container,
and the demo data format directly shapes how `main.js` populates the UI.
`index.html` is already scaffolded — the DOM structure is fixed.
These sections produce `css/style.css`, the UI portions of `js/main.js`, and `js/demos.js`.

---

## Section 4: UI Shell

### Files Owned

- `css/style.css` — full visual language
- `js/main.js` (UI layer only) — event wiring, demo injection, breakdown rendering

---

### Layout Architecture

The page has four vertical layers, stacked from top to bottom:

```
┌─────────────────────────────────────────────┐
│                                             │
│          #canvas-container (flex-1)         │
│          p5.js canvas lives here            │
│          fills all remaining height         │
│                                             │
├─────────────────────────────────────────────┤
│  #breakdown  (auto height, centered below)  │
│  small fading text: semantic decomposition  │
├─────────────────────────────────────────────┤
│  #controls (fixed to bottom)                │
│    #demos  — demo pills row                 │
│    #input-row — text input + → button       │
└─────────────────────────────────────────────┘
```

**Key layout decisions:**

- `body` and `html`: `margin: 0; padding: 0; overflow: hidden; background: transparent`
- `#canvas-container`: `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0`
  — the canvas is a full-screen backdrop; everything else layers over it
- `#breakdown`: `position: fixed; bottom: 120px; left: 0; right: 0; z-index: 10`
  — floats just above the controls bar
- `#controls`: `position: fixed; bottom: 0; left: 0; right: 0; z-index: 20; padding: 12px 20px 16px`
- `#demos`: `display: flex; flex-wrap: nowrap; gap: 8px; overflow-x: auto; padding-bottom: 8px`
  — single horizontal scrollable row, no wrapping (keeps the design clean)
- `#input-row`: `display: flex; gap: 8px; align-items: center`

**Responsive strategy:**
Optimize for one target: 1920×1080 landscape projection.
No media queries needed for the art installation.
Input font size: 18px. Canvas: always full viewport.
On smaller screens (laptop preview), it still works because everything is viewport-relative.

---

### Visual Language: Sleek Art Installation Aesthetic

**Philosophy:** UI disappears; the glyph is the content.
Every UI element should feel like it barely exists — a breath of glass over a void.

**Background:**
`body { background: transparent }` — true transparent for projection (OBS/Resolume can key this).
For local preview fallback: `:root { --bg: #0a0a0f }` applied only when a `?preview` query param is present (or just leave it transparent — black page bg is fine for development).

**Frosted glass approach for controls:**

```css
#controls {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
```

This creates a barely-there separator from the canvas without blocking the glyph.

**Demo pills:**

```css
.demo-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  padding: 5px 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  letter-spacing: 0.03em;
}

.demo-pill:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.85);
}

.demo-pill.active {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 200, 150, 0.4);
  color: rgba(255, 220, 180, 0.9);
}
```

The active state uses a warm amber-rose tint — echoing the glyph palette without competing.

**Text input:**

```css
#text-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
  padding: 10px 16px;
  outline: none;
  font-family: inherit;
  letter-spacing: 0.02em;
  transition: border-color 0.2s ease, background 0.2s ease;
}

#text-input:focus {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.07);
}

#text-input::placeholder {
  color: rgba(255, 255, 255, 0.22);
  font-style: italic;
}
```

**Generate button:**

```css
#generate-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  width: 42px;
  height: 42px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
}

#generate-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 1);
}
```

**Breakdown display:**

```css
#breakdown {
  text-align: center;
  padding: 8px 20px;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

#breakdown.visible {
  opacity: 1;
}

.breakdown-word {
  display: inline-block;
  margin: 0 6px 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

.breakdown-word .label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.2);
  display: block;
}

/* Each word's color reflects its semantic category — injected as inline style */
.breakdown-word .category-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
```

**Global typography:**

```css
* { box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
  color: rgba(255, 255, 255, 0.8);
}
```

No Google Fonts — system fonts are faster and cleaner for this aesthetic.

---

### Input Behavior

**Submit modes** (both supported):
1. Press `Enter` → submit
2. Click `→` button → submit
3. Real-time preview: debounced 600ms after last keystroke → generates preview glyph
   — This is the "wow" moment: the glyph evolves as you type

**Debounce rationale:** 600ms is long enough not to spam the semantic engine on every character,
but short enough to feel responsive on a projection demo.

**On submit:**
1. Read `input.value.trim()`
2. If empty → return (leave the pulsing invite dot on screen)
3. Call `submitText(text)` — defined in `main.js`, calls semantic engine → layout engine → renderer
4. Clear active state from all pills; set active on none (custom input = no pill active)
5. Show breakdown below glyph

**Demo pill click:**
1. Set text input value to demo text (so user can see + edit it)
2. Mark that pill `.active`, remove from others
3. Call `submitText(text)` immediately (no debounce)

---

### Semantic Breakdown Display

**Where:** `#breakdown` div, positioned just above `#controls` (fixed, `bottom: 120px`)

**What it shows:**
For each word in the input, one small chip showing:
- A colored dot (category color from the 12-color system)
- The original word (small caps)
- Below it: the category name (even smaller, dimmer)

Example for "love grows through connection":
```
● love        ● grows       ● through     ● connection
  EMOTION       ACTION        RELATION      RELATION
```

**Transition:** fades in after the glyph starts growing (300ms delay after submit).
On new submit: fade out → update content → fade in.

**Implementation in `main.js`:**

```javascript
function renderBreakdown(semanticNodes) {
  const el = document.getElementById('breakdown');
  el.classList.remove('visible');

  setTimeout(() => {
    el.innerHTML = semanticNodes.map(node => `
      <span class="breakdown-word">
        <span class="category-dot" style="background: ${node.color}"></span>
        ${node.word}
        <span class="label">${node.categoryName}</span>
      </span>
    `).join('');
    el.classList.add('visible');
  }, 300);
}
```

---

### Transition Between Glyphs

**Fade approach:**
When a new text is submitted, the renderer receives a `clearAndGrow()` call.
The p5.js canvas handles the fade — it doesn't need to be a CSS transition.

In `main.js`, `submitText()` calls:
```javascript
async function submitText(text) {
  if (!text.trim()) return;

  const tokens = semanticEngine.process(text);
  const glyphTree = layoutEngine.build(tokens);

  renderer.clear();           // fades out current glyph
  renderBreakdown(tokens);    // updates breakdown with fade
  renderer.grow(glyphTree);   // starts new growth animation
}
```

The renderer's `clear()` will trigger a quick fade (handled in `renderer.js`, Section 3).

---

### `js/main.js` — Full Structure

```javascript
// main.js — app initialization and event wiring

document.addEventListener('DOMContentLoaded', () => {
  initDemoPills();
  initInput();
  initRenderer();    // starts p5.js sketch with idle pulsing dot
});

function initDemoPills() {
  const container = document.getElementById('demos');
  DEMOS.forEach((demo, i) => {
    const pill = document.createElement('button');
    pill.className = 'demo-pill';
    pill.textContent = demo.title;
    pill.setAttribute('data-index', i);
    pill.addEventListener('click', () => {
      setActivePill(pill);
      document.getElementById('text-input').value = demo.text;
      submitText(demo.text);
    });
    container.appendChild(pill);
  });
}

function setActivePill(activePill) {
  document.querySelectorAll('.demo-pill').forEach(p => p.classList.remove('active'));
  if (activePill) activePill.classList.add('active');
}

let debounceTimer = null;

function initInput() {
  const input = document.getElementById('text-input');
  const btn = document.getElementById('generate-btn');

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      setActivePill(null);
      submitText(input.value);
    }
  });

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    setActivePill(null);
    debounceTimer = setTimeout(() => {
      if (input.value.trim()) submitText(input.value);
    }, 600);
  });

  btn.addEventListener('click', () => {
    clearTimeout(debounceTimer);
    setActivePill(null);
    submitText(input.value);
  });
}

async function submitText(text) {
  if (!text || !text.trim()) return;

  const semanticNodes = semanticEngine.process(text);
  const glyphTree = layoutEngine.build(semanticNodes);

  renderer.clear();
  renderBreakdown(semanticNodes);
  renderer.grow(glyphTree);
}

function renderBreakdown(semanticNodes) {
  const el = document.getElementById('breakdown');
  el.classList.remove('visible');

  setTimeout(() => {
    el.innerHTML = semanticNodes.map(node => `
      <span class="breakdown-word">
        <span class="category-dot" style="background: ${node.color}"></span>
        ${escapeHtml(node.word)}
        <span class="label">${node.categoryName || node.category}</span>
      </span>
    `).join('');
    el.classList.add('visible');
  }, 300);
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function initRenderer() {
  // renderer.js exposes a global `renderer` object that accepts:
  // renderer.init(containerId)
  // renderer.grow(glyphTree)
  // renderer.clear()
  renderer.init('canvas-container');
}
```

---

## Section 5: Demo Content

### File Owned

- `js/demos.js`

---

### Data Format

Each demo is an object with three fields:

```javascript
{
  title: String,   // Short label for the pill button (2-4 words max)
  text:  String,   // The full text submitted to the semantic engine
  note:  String    // Internal comment for developers — not displayed
}
```

**Why `title` separate from `text`?**
The pill needs a short label.
The text can be a full sentence or paragraph.
Decoupling them lets the pill read cleanly while the semantic input is rich.

**Format declaration in `demos.js`:**

```javascript
const DEMOS = [ ... ];
```

Global constant — no export needed (vanilla JS, no modules).
`main.js` accesses `DEMOS` directly after `demos.js` loads (script order in `index.html` ensures this).

---

### The 7 Demo Paragraphs

Selected to:
1. Cover diverse semantic category distributions — different color palettes per glyph
2. Vary in length — from a 2-word phrase to a 3-sentence paragraph
3. Draw from PS philosophy — authentic, not generic
4. Be beautiful to read — someone should feel something from the text alone

#### Demo 1 — "Being Here" (short phrase)
**Category emphasis:** Existence/Being (white), Relation/Connection (gold), Space/Place (indigo)

```
title: "being here"
text: "presence is the gift"
```

Simple, powerful. Three meaningful nouns. "Presence" and "gift" will map to Existence and Quality.
The glyph will be sparse and radiant — a few bright nodes.
Good opening demo because it looks like a star.

#### Demo 2 — "Love Grows" (short sentence)
**Category emphasis:** Emotion (coral), Nature/Life (emerald), Action (amber), Relation (gold)

```
title: "love grows"
text: "love grows through genuine connection"
```

Classic PS phrasing. Four semantic nodes, all different categories.
Action verb "grows" triggers Nature/Life + Action.
Will produce a warm, branching glyph — organic and alive.

#### Demo 3 — "Every Person" (medium sentence)
**Category emphasis:** Existence (white), Space (indigo), Thought (violet), Quality (rose), Quantity (silver)

```
title: "every person"
text: "every person carries a universe of experiences within them"
```

Rich noun structure. "Universe" → Space/Place. "Experiences" → Thought/Mind.
"Within" encodes containment — a nested cluster visually.
The glyph will feel vast, layered.

#### Demo 4 — "Community as Art" (medium sentence)
**Category emphasis:** Relation (gold), Structure (cyan), Expression (lime), Action (amber), Quality (rose)

```
title: "community"
text: "gathering together is the oldest form of art we know"
```

PS core idea. "Gathering" = Action + Relation.
"Art" = Expression + Quality.
"Oldest" = Time/Change.
Produces a glyph that looks like a web or constellation — many nodes, dense connections.

#### Demo 5 — "Consciousness" (philosophical — medium sentence)
**Category emphasis:** Thought (violet), Existence (white), Time (teal), Structure (cyan)

```
title: "consciousness"
text: "awareness watching itself is the strange loop at the center of all meaning"
```

High-density abstract vocabulary. "Awareness," "watching," "loop," "center," "meaning" — all rich semantic primitives.
Will generate the most complex glyph of the set — a layered, hexagon-heavy structure.
Good showpiece for the depth of the system.

#### Demo 6 — "Regeneration" (two sentences — long)
**Category emphasis:** Nature (emerald), Time (teal), Action (amber), Existence (white), Quality (rose)

```
title: "regeneration"
text: "nothing in nature is wasted. every ending becomes the soil for what grows next."
```

PS's regenerative design lens. Multi-sentence input shows how the engine handles sentence boundaries.
"Soil" = Nature + Space. "Ending" and "grows" will anchor opposing motion vectors — death and growth in spatial tension.
The glyph will show two clusters with a connective arc between them — visually tells the story.

#### Demo 7 — "Playful Sincerity" (two sentences — long)
**Category emphasis:** Emotion (coral), Quality (rose), Relation (gold), Expression (lime), Action (amber), Thought (violet)

```
title: "playful sincerity"
text: "to be truly playful is to be truly sincere. warmth and depth are not opposites — they are the same love expressed in different directions."
```

The core PS paradox in two sentences.
Most semantically complex: "playful," "sincere," "warmth," "depth," "opposites," "love," "directions."
Will produce the largest, most colorful glyph — a good closer/signature demo.
The word "opposites" may trigger Structure/Order with a split spatial arrangement — visually representing the tension.

#### Demo 8 — "The Long Path" (short philosophical)
**Category emphasis:** Time (teal), Space (indigo), Action (amber), Quality (rose), Existence (white)

```
title: "the long path"
text: "we are building something that will outlast us"
```

Clean, future-oriented. "Building" = Action. "Outlast" = Time.
Minimal node count, strong directional vector toward "future" (right side of canvas).
Feels like a pointing glyph — arrow-shaped composition.
Good contrast in feel from the dense consciousness/PS demos.

---

### Full `js/demos.js` File Plan

```javascript
// demos.js — pre-written demo content drawn from PS philosophy
// Each demo: { title, text, note }
// Pill label = title. Input to engine = text. note is developer-only.

const DEMOS = [
  {
    title: "being here",
    text: "presence is the gift",
    note: "Sparse, radiant. Tests short-input behavior. Existence + Quality + Relation."
  },
  {
    title: "love grows",
    text: "love grows through genuine connection",
    note: "Classic PS. Organic branching glyph. Emotion + Nature + Action + Relation."
  },
  {
    title: "every person",
    text: "every person carries a universe of experiences within them",
    note: "Vast and layered. Tests containment. Existence + Space + Thought + Quality."
  },
  {
    title: "community",
    text: "gathering together is the oldest form of art we know",
    note: "Dense web glyph. Relation + Structure + Expression + Time."
  },
  {
    title: "consciousness",
    text: "awareness watching itself is the strange loop at the center of all meaning",
    note: "Most complex glyph. Showpiece for the system. Thought + Existence + Time + Structure."
  },
  {
    title: "regeneration",
    text: "nothing in nature is wasted. every ending becomes the soil for what grows next.",
    note: "Two-sentence input. Two clusters with connective arc. Nature + Time + Action + Existence."
  },
  {
    title: "playful sincerity",
    text: "to be truly playful is to be truly sincere. warmth and depth are not opposites — they are the same love expressed in different directions.",
    note: "Signature demo. Largest, most colorful glyph. All categories represented."
  },
  {
    title: "the long path",
    text: "we are building something that will outlast us",
    note: "Short, directional. Future-pointing glyph. Time + Action + Space."
  }
];
```

---

### Category Coverage Across Demos

| Category | Color | Demos |
|----------|-------|-------|
| Existence / Being | White | 1, 3, 6, 8 |
| Emotion / Feeling | Coral | 2, 7 |
| Thought / Mind | Violet | 3, 5, 7 |
| Action / Motion | Amber | 2, 4, 6, 7, 8 |
| Nature / Life | Emerald | 2, 6 |
| Structure / Order | Cyan | 4, 5 |
| Relation / Connection | Gold | 1, 2, 4, 7 |
| Time / Change | Teal | 4, 5, 6, 8 |
| Space / Place | Indigo | 1, 3, 8 |
| Quantity / Measure | Silver | 3 |
| Quality / Attribute | Rose | 1, 3, 6, 7 |
| Expression / Language | Lime | 4, 7 |

All 12 categories appear at least once across the 8 demos.

---

## Integration Notes

### How Sections 4+5 connect to the other sections

**To Sections 1+2 (Semantic + Layout Engines):**
`submitText()` in `main.js` calls `semanticEngine.process(text)` and `layoutEngine.build(nodes)`.
These must return `semanticNodes[]` (with `.word`, `.color`, `.category`, `.categoryName` fields)
and a `GlyphTree` respectively, matching the shapes defined in the cross-cutting data model.

**To Section 3 (Renderer):**
`main.js` calls `renderer.init('canvas-container')`, `renderer.grow(glyphTree)`, `renderer.clear()`.
The renderer must expose this interface as a global `renderer` object.

**Interface contract (what `main.js` expects):**
```javascript
// From semantic engine:
semanticEngine.process(text) → SemanticNode[]
// SemanticNode: { word, category, categoryName, color, shape, role }

// From layout engine:
layoutEngine.build(semanticNodes) → GlyphTree
// GlyphTree: { nodes: GlyphNode[], edges: GlyphEdge[] }

// From renderer:
renderer.init(containerId)  → void
renderer.grow(glyphTree)    → void  (triggers growth animation)
renderer.clear()            → void  (fades out, resets)
```

---

## Open Questions (For Implementation Phase)

1. **Scrollable demo pills or wrapping?**
   Plan says `flex-wrap: nowrap` + horizontal scroll.
   Alternative: allow 2 rows if pills overflow.
   Recommendation: start with nowrap + scroll — cleaner for projection.

2. **Real-time preview on debounce — should we show a "loading" state?**
   For short inputs (<50 chars) the engine should be fast enough.
   Recommendation: no spinner. If ConceptNet is called, show a subtle pulse on the generate button.

3. **Breakdown show/hide — always visible after first input, or only while glyph is showing?**
   Recommendation: fade out breakdown when input field is cleared or focused with empty value.
   Fade back in when a glyph is showing.

4. **Empty state (before any input):**
   Renderer should show a softly pulsing center dot (the "invite" state from plan.md's error handling).
   No breakdown shown. Input placeholder does the work.

5. **Demo pill order:**
   Shortest to longest keeps the first impression clean.
   Current order: being here → love grows → every person → community → consciousness → regeneration → playful sincerity → the long path.
   Could reorder to end on "playful sincerity" as the signature.
   Recommendation: keep current order — let users discover depth as they scroll right.

---

## Estimated Implementation Time

| Task | Estimate |
|------|----------|
| `css/style.css` (full) | 25 min |
| `js/main.js` (UI layer + wiring) | 20 min |
| `js/demos.js` | 10 min |
| **Total** | **~55 min** |

This is within the "S complexity" estimate from the meta-plan and leaves buffer for integration surprises.
