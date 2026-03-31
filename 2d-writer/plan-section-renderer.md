# Section 3: Renderer (p5.js) — Detailed Implementation Plan

## Goal

`js/renderer.js` is the visual payoff of the whole system.
It receives a `GlyphTree` from the Layout Engine and makes it *feel alive* — shapes growing from center outward, glowing lines, breathing idle animation.
This file does nothing but make things beautiful.

---

## Architecture Decision: Instance Mode

**Use p5.js instance mode.** Never global mode.

Reasons:
- The `#canvas-container` div is owned by Section 4 (UI Shell). Instance mode lets us mount into that exact element without p5 polluting the global scope.
- Avoids `setup`/`draw` name collisions with any other JS in the project.
- Cleaner for future multi-sketch or testing scenarios.

```js
// renderer.js exports a factory function, not a raw p5 sketch
function createRenderer(containerEl) {
  const sketch = (p) => {
    // all p5 code lives here
  };
  return new p5(sketch, containerEl);
}
```

`main.js` calls `createRenderer(document.getElementById('canvas-container'))` once on load.

---

## Transparent Background

**Use 2D mode (not WEBGL) with `clear()` each frame.**

WEBGL adds unnecessary complexity (different coordinate system, shader compilation, z-axis concerns).
2D mode supports canvas transparency natively.

Setup:
```js
p.setup = () => {
  const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
  cnv.style('background', 'transparent');
  // The parent div must also have no background — CSS handles that
  p.colorMode(p.RGB, 255, 255, 255, 1.0); // alpha 0–1
};

p.draw = () => {
  p.clear(); // clears to fully transparent every frame
  renderFrame();
};
```

The `#canvas-container` div in `style.css` must have `background: transparent` and `position: absolute` filling the viewport.
The `body` background can be black (for local development) or transparent (for projection embed).

**Critical:** `p.background()` must NEVER be called — it would fill with a solid color.
Only `p.clear()` in the draw loop.

---

## Data Contract: What Renderer Expects

The Layout Engine (Section 2) must provide a `GlyphTree` with this shape:

```js
// GlyphTree
{
  nodes: [GlyphNode, ...],
  connections: [Connection, ...]
}

// GlyphNode
{
  id: string,
  x: number,          // position relative to canvas center
  y: number,
  shape: 'dot' | 'line' | 'arc' | 'triangle' | 'square' | 'pentagon' | 'hexagon',
  color: string,      // hex, e.g. "#FF6B6B"
  size: number,       // radius/half-size in px
  growthOrder: number // 0 = first (center node), ascending outward
}

// Connection
{
  fromId: string,
  toId: string,
  type: 'solid' | 'dashed' | 'curved',
  color: string       // usually derived from source or target node color
}
```

Renderer is a pure consumer — it never modifies the tree.

---

## Animation State Machine

The renderer has four states:

```
IDLE → GROWING → ALIVE → FADING
```

- **IDLE**: Empty canvas. If no glyph yet, draw a single softly pulsing dot at center as invitation.
- **GROWING**: A new GlyphTree has been received. Nodes appear sequentially by `growthOrder`. Connections draw as their source node completes.
- **ALIVE**: Growth is complete. Glyph breathes/pulses gently. Awaiting next input.
- **FADING**: New input received while ALIVE. Current glyph fades to 0 opacity over ~400ms, then transitions to GROWING for new tree.

```js
// Renderer-level state
let state = 'IDLE';
let currentTree = null;
let nextTree = null;        // queued while fading
let masterAlpha = 1.0;      // used during FADING
let growthProgress = [];    // per-node progress [0.0–1.0]
let aliveTime = 0;          // ms since growth completed (for idle animation)
```

### Public API

```js
// Called by main.js when Layout Engine produces a new tree
renderer.setGlyphTree(glyphTree);

// Called on window resize
renderer.resize();
```

`setGlyphTree()` behavior:
- If state is IDLE or ALIVE → immediately start FADING (or skip fade if IDLE), queue new tree
- If state is GROWING → finish current growth, then fade and grow new tree (or just interrupt — TBD based on feel)

---

## Growth Animation: Frame-by-Frame

### Core Approach: Sequential Staggered Growth with Easing

Each node has a `growthOrder` integer.
Nodes with the same `growthOrder` value can grow simultaneously (siblings at same radial ring).
Nodes with higher `growthOrder` begin only after all lower-order nodes reach a threshold (~70% progress).

```js
// growthProgress[i] tracks each node's t value (0.0 → 1.0)
// Each frame, advance the front of the queue

const GROWTH_RATE = 0.035;         // t increment per frame at 60fps ≈ 0.48s per node
const SIBLING_THRESHOLD = 0.70;    // next ring starts when current is 70% done
const CONNECTION_START = 0.50;     // connections begin drawing at 50% node progress
```

Per-frame update loop:
```
for each growthOrder tier (ascending):
  if previous tier has all nodes >= SIBLING_THRESHOLD:
    advance all nodes in this tier by GROWTH_RATE * deltaTime
```

### Easing Functions

**Shape emergence: ease-out cubic**
```js
// t goes 0→1, returns eased value
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
```
Feels like shapes materialize quickly then settle into place — natural, not mechanical.

**Shape scale during growth:**
```js
const displayScale = easeOutCubic(t); // 0 → 1 for size
```

**Organic micro-wobble (Perlin noise):**
After growth completes, nodes don't hold perfectly still.
```js
// In ALIVE state
const wobbleX = p.noise(node.id * 100 + aliveTime * 0.0003) * 4 - 2;
const wobbleY = p.noise(node.id * 200 + aliveTime * 0.0003) * 4 - 2;
```
`p.noise()` is seeded by node ID so each node moves independently but consistently.
Amplitude: ±2px. Very subtle — the glyph breathes, it doesn't shake.

**Breathing pulse on opacity:**
```js
// In ALIVE state — applied to the whole glyph
const breathe = 0.85 + 0.15 * Math.sin(aliveTime * 0.0008 * Math.PI * 2);
// Alpha oscillates 0.85 → 1.0 over ~21 seconds. Barely perceptible.
```

---

## Drawing Shapes

p5.js has no built-in regular polygon function.
We write one:

```js
function drawPolygon(p, cx, cy, radius, sides, rotation = 0) {
  p.beginShape();
  for (let i = 0; i < sides; i++) {
    const angle = (p.TWO_PI / sides) * i + rotation;
    p.vertex(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  }
  p.endShape(p.CLOSE);
}
```

Shape dispatch:
```js
function drawShape(p, node, t, alpha) {
  const r = node.size * easeOutCubic(t);
  const [R, G, B] = hexToRGB(node.color);

  p.push();
  p.translate(node.x, node.y);

  switch (node.shape) {
    case 'dot':
      p.noStroke();
      p.fill(R, G, B, alpha);
      p.circle(0, 0, r * 2);
      break;

    case 'line':
      // A line-shape is drawn as a short stroke, not a closed polygon.
      // Direction comes from node's angle property (set by Layout Engine).
      p.strokeWeight(2.5);
      p.stroke(R, G, B, alpha);
      p.noFill();
      const len = r * 2 * easeOutCubic(t);
      p.line(-len / 2, 0, len / 2, 0);
      break;

    case 'arc':
      p.noFill();
      p.strokeWeight(2);
      p.stroke(R, G, B, alpha);
      p.arc(0, 0, r * 2, r * 2, 0, p.PI * easeOutCubic(t));
      break;

    case 'triangle':
      p.noFill();
      p.strokeWeight(1.8);
      p.stroke(R, G, B, alpha);
      drawPolygon(p, 0, 0, r, 3, -p.HALF_PI);
      break;

    case 'square':
      p.noFill();
      p.strokeWeight(1.8);
      p.stroke(R, G, B, alpha);
      drawPolygon(p, 0, 0, r, 4, p.PI / 4);
      break;

    case 'pentagon':
      p.noFill();
      p.strokeWeight(1.8);
      p.stroke(R, G, B, alpha);
      drawPolygon(p, 0, 0, r, 5, -p.HALF_PI);
      break;

    case 'hexagon':
      p.noFill();
      p.strokeWeight(1.8);
      p.stroke(R, G, B, alpha);
      drawPolygon(p, 0, 0, r, 6, 0);
      break;
  }

  p.pop();
}
```

**Rotation choice:** Triangles point up (`-HALF_PI`), squares are diamond-rotated (`PI/4`) — more interesting visually than axis-aligned.
Pentagons point up, hexagons flat-side-top. These are aesthetic calls — can be tuned.

---

## Drawing Connections

Connections grow along the line from source to target, starting at `CONNECTION_START` (when source node is 50% grown).

```js
function drawConnection(p, conn, fromNode, toNode, t, alpha) {
  if (t <= 0) return;

  const [R, G, B] = hexToRGB(conn.color);
  const progress = Math.min(t * 2, 1.0); // connection grows in first half of t range

  p.push();

  if (conn.type === 'solid') {
    p.strokeWeight(1.2);
    p.stroke(R, G, B, alpha * 0.8);
    p.noFill();
    // Interpolate endpoint along the line
    const ex = p.lerp(fromNode.x, toNode.x, easeOutCubic(progress));
    const ey = p.lerp(fromNode.y, toNode.y, easeOutCubic(progress));
    p.line(fromNode.x, fromNode.y, ex, ey);
  }

  else if (conn.type === 'dashed') {
    // Draw as a series of short segments
    p.strokeWeight(1.0);
    p.stroke(R, G, B, alpha * 0.5);
    p.noFill();
    const segments = 8;
    for (let i = 0; i < segments * progress; i++) {
      if (i % 2 === 0) {
        const t0 = i / segments;
        const t1 = Math.min((i + 0.7) / segments, progress);
        p.line(
          p.lerp(fromNode.x, toNode.x, t0), p.lerp(fromNode.y, toNode.y, t0),
          p.lerp(fromNode.x, toNode.x, t1), p.lerp(fromNode.y, toNode.y, t1)
        );
      }
    }
  }

  else if (conn.type === 'curved') {
    // Quadratic Bezier with a gentle perpendicular offset
    p.strokeWeight(1.2);
    p.stroke(R, G, B, alpha * 0.7);
    p.noFill();
    // Control point: midpoint offset perpendicular by 30px
    const mx = (fromNode.x + toNode.x) / 2;
    const my = (fromNode.y + toNode.y) / 2;
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const cx = mx - (dy / len) * 30;
    const cy = my + (dx / len) * 30;
    // Animate endpoint along the Bezier
    const endT = easeOutCubic(progress);
    const ex = quadBezier(fromNode.x, cx, toNode.x, endT);
    const ey = quadBezier(fromNode.y, cy, toNode.y, endT);
    // Draw the partial curve by stepping through t=0..endT
    p.beginShape();
    for (let s = 0; s <= 20; s++) {
      const st = (s / 20) * endT;
      p.vertex(quadBezier(fromNode.x, cx, toNode.x, st),
               quadBezier(fromNode.y, cy, toNode.y, st));
    }
    p.endShape();
  }

  p.pop();
}

function quadBezier(p0, p1, p2, t) {
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}
```

---

## Glow Effect

**The single most important visual choice in this whole file.**

### Technique: `drawingContext.shadowBlur` (Canvas 2D API)

This is the best glow technique for 2D p5.js with colored lines on transparent background.
It uses the browser's native Canvas shadow API directly — no extra passes, no shader.

```js
function setGlow(p, color, intensity) {
  p.drawingContext.shadowBlur = intensity;    // e.g. 18
  p.drawingContext.shadowColor = color;       // e.g. "rgba(255, 107, 107, 0.9)"
}

function clearGlow(p) {
  p.drawingContext.shadowBlur = 0;
  p.drawingContext.shadowColor = 'transparent';
}
```

**Usage pattern — the key to richness:**
Draw each shape in two passes:
1. **Wide glow pass**: `shadowBlur = 30`, `alpha = 0.35` — the outer halo
2. **Crisp stroke pass**: `shadowBlur = 10`, `alpha = 0.95` — the bright core

```js
function drawShapeGlowing(p, node, t, alpha) {
  const col = hexToRGB(node.color);
  const glowColor = `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0.7)`;

  // Pass 1: outer halo
  setGlow(p, glowColor, 28);
  drawShape(p, node, t, alpha * 0.4);
  clearGlow(p);

  // Pass 2: core stroke
  setGlow(p, glowColor, 10);
  drawShape(p, node, t, alpha);
  clearGlow(p);
}
```

**Why not CSS filters?** CSS `filter: blur()` applies to the whole canvas element, not individual shapes.
**Why not WEBGL shaders?** Overkill and adds coordinate system complexity.
**Why not p5.js blendMode?** `ADD` blend mode helps with layering luminosity but doesn't create the outward halo shape.
`shadowBlur` is the right tool here.

### Performance Note on shadowBlur

`shadowBlur` is expensive when many shapes are drawn per frame.
Mitigation:
- Only use glow on shapes with `alpha > 0.1` (skip nearly-invisible shapes)
- For complex glyphs (50+ nodes): reduce `shadowBlur` intensity proportionally to node count
  ```js
  const nodeCount = currentTree.nodes.length;
  const glowScale = nodeCount > 30 ? Math.max(0.5, 1 - (nodeCount - 30) / 60) : 1.0;
  ```
- Consider an offscreen graphics buffer for the glow pass if performance degrades on low-end hardware

---

## Color Handling and Overlap

When shapes overlap, colors layer on the transparent canvas.
Since we use alpha < 1 for shapes, natural blending occurs.

**Use `p.blendMode(p.ADD)`** for the entire glyph draw pass.
ADD blend mode makes overlapping luminous colors *brighter*, not muddier.
This is how neon and light behaves physically — exactly the aesthetic we want.

```js
p.draw = () => {
  p.clear();
  p.blendMode(p.ADD);    // all drawing below is additive
  renderFrame();
  p.blendMode(p.BLEND);  // reset for any UI elements drawn after
};
```

**Important:** ADD mode means black = invisible, white = fully bright.
This is fine — our background is transparent/dark.
Shapes should use mid-to-high brightness colors (the hex palette already does this).
Avoid near-black colors in ADD mode — they disappear.

---

## Transition: New Input Arrives

When `setGlyphTree(newTree)` is called while ALIVE:

1. Store `nextTree = newTree`
2. State → FADING
3. Each frame: `masterAlpha -= 0.035` (fade over ~17 frames = ~280ms at 60fps)
4. When `masterAlpha <= 0`:
   - `currentTree = nextTree`
   - `nextTree = null`
   - Reset `growthProgress` to all zeros
   - `masterAlpha = 1.0`
   - State → GROWING

The fade feels like the old glyph dissolving, the new one crystallizing from the void.
No crossfade (both visible simultaneously) — the sharp cut to black before regrowth feels more intentional, like a breath before speaking.

---

## Idle State (No Input Yet)

When state is IDLE and no glyph has been generated:

Draw a single dot at canvas center, pulsing.
```js
function drawIdleDot(p, time) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 0.001 * p.TWO_PI);
  const r = 4 + pulse * 3;
  const alpha = 0.3 + pulse * 0.4;

  setGlow(p, 'rgba(255,255,255,0.8)', 20 + pulse * 15);
  p.noStroke();
  p.fill(255, 255, 255, alpha);
  p.circle(p.width / 2, p.height / 2, r * 2);
  clearGlow(p);
}
```

This is the "invitation" — something living is here, waiting.

---

## Canvas Positioning

The canvas must fill the viewport.
The sketch origin `(0, 0)` is top-left by default.
All GlyphTree positions from the Layout Engine should be in a coordinate space where `(0, 0)` is the glyph center.

The renderer translates to canvas center before drawing:
```js
p.draw = () => {
  p.clear();
  p.blendMode(p.ADD);
  p.push();
  p.translate(p.width / 2, p.height / 2);  // origin = canvas center
  renderGlyph();
  p.pop();
  p.blendMode(p.BLEND);
};
```

**Window resize handling:**
```js
p.windowResized = () => {
  p.resizeCanvas(p.windowWidth, p.windowHeight);
};
```

---

## Complete Module Structure

```js
// js/renderer.js

function createRenderer(containerEl) {
  const sketch = (p) => {

    // ── State ──────────────────────────────────────────────
    let state = 'IDLE';          // 'IDLE' | 'GROWING' | 'ALIVE' | 'FADING'
    let currentTree = null;
    let nextTree = null;
    let masterAlpha = 1.0;
    let growthProgress = [];     // Float32Array, one entry per node
    let aliveTime = 0;
    let frameTime = 0;

    // ── Setup ──────────────────────────────────────────────
    p.setup = () => {
      const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
      cnv.parent(containerEl);
      cnv.style('background', 'transparent');
      p.colorMode(p.RGB, 255, 255, 255, 1.0);
      p.frameRate(60);
      p.noSmooth(); // actually: p.smooth() — want antialiasing ON
    };

    // ── Draw Loop ──────────────────────────────────────────
    p.draw = () => {
      p.clear();
      const dt = p.deltaTime; // ms since last frame

      if (state === 'IDLE') {
        drawIdleDot(p, p.millis());
      }
      else if (state === 'GROWING') {
        updateGrowth(dt);
        p.blendMode(p.ADD);
        p.push();
        p.translate(p.width / 2, p.height / 2);
        drawGlyph(currentTree, growthProgress, masterAlpha);
        p.pop();
        p.blendMode(p.BLEND);
        if (growthComplete()) { state = 'ALIVE'; aliveTime = 0; }
      }
      else if (state === 'ALIVE') {
        aliveTime += dt;
        p.blendMode(p.ADD);
        p.push();
        p.translate(p.width / 2, p.height / 2);
        drawGlyph(currentTree, growthProgress, masterAlpha, aliveTime);
        p.pop();
        p.blendMode(p.BLEND);
      }
      else if (state === 'FADING') {
        masterAlpha = Math.max(0, masterAlpha - 0.035);
        p.blendMode(p.ADD);
        p.push();
        p.translate(p.width / 2, p.height / 2);
        drawGlyph(currentTree, growthProgress, masterAlpha);
        p.pop();
        p.blendMode(p.BLEND);
        if (masterAlpha <= 0) {
          currentTree = nextTree;
          nextTree = null;
          masterAlpha = 1.0;
          growthProgress = new Array(currentTree.nodes.length).fill(0);
          state = 'GROWING';
        }
      }
    };

    // ── Growth Update ──────────────────────────────────────
    function updateGrowth(dt) {
      const speedFactor = dt / 16.67; // normalize to 60fps
      const maxOrder = Math.max(...currentTree.nodes.map(n => n.growthOrder));

      for (let order = 0; order <= maxOrder; order++) {
        const prevNodes = currentTree.nodes.filter(n => n.growthOrder === order - 1);
        const prevReady = prevNodes.every(n => {
          const idx = currentTree.nodes.indexOf(n);
          return growthProgress[idx] >= 0.70;
        }) || order === 0;

        if (!prevReady) break;

        const thisNodes = currentTree.nodes.filter(n => n.growthOrder === order);
        thisNodes.forEach(n => {
          const idx = currentTree.nodes.indexOf(n);
          growthProgress[idx] = Math.min(1.0, growthProgress[idx] + 0.032 * speedFactor);
        });
      }
    }

    function growthComplete() {
      return growthProgress.every(t => t >= 1.0);
    }

    // ── Render Glyph ──────────────────────────────────────
    function drawGlyph(tree, progress, alpha, time = 0) {
      if (!tree) return;

      // 1. Draw connections first (under shapes)
      tree.connections.forEach(conn => {
        const fromNode = tree.nodes.find(n => n.id === conn.fromId);
        const toNode = tree.nodes.find(n => n.id === conn.toId);
        const fromIdx = tree.nodes.indexOf(fromNode);
        const connT = Math.max(0, (progress[fromIdx] - 0.5) * 2);
        if (connT > 0) drawConnectionGlowing(p, conn, fromNode, toNode, connT, alpha);
      });

      // 2. Draw nodes
      tree.nodes.forEach((node, i) => {
        const t = progress[i];
        if (t <= 0) return;

        // Apply alive wobble
        const wobNode = { ...node };
        if (time > 0) {
          wobNode.x += p.noise(i * 100 + time * 0.0003) * 4 - 2;
          wobNode.y += p.noise(i * 200 + time * 0.0003) * 4 - 2;
        }

        const breathAlpha = time > 0 ? (0.85 + 0.15 * Math.sin(time * 0.0008 * Math.PI * 2)) : 1.0;
        drawShapeGlowing(p, wobNode, t, alpha * breathAlpha);
      });
    }

    // ── Shape Drawing ─────────────────────────────────────
    function drawShapeGlowing(p, node, t, alpha) {
      const [R, G, B] = hexToRGB(node.color);
      const glowColor = `rgba(${R}, ${G}, ${B}, 0.75)`;

      setGlow(p, glowColor, 26);
      drawShape(p, node, t, alpha * 0.35);
      clearGlow(p);

      setGlow(p, glowColor, 10);
      drawShape(p, node, t, alpha);
      clearGlow(p);
    }

    function drawShape(p, node, t, alpha) {
      const r = node.size * easeOutCubic(t);
      const [R, G, B] = hexToRGB(node.color);
      p.push();
      p.translate(node.x, node.y);
      p.noFill();
      p.strokeWeight(1.8);
      p.stroke(R, G, B, alpha);

      switch (node.shape) {
        case 'dot':
          p.fill(R, G, B, alpha);
          p.noStroke();
          p.circle(0, 0, r * 2);
          break;
        case 'line':
          p.line(-r, 0, r * easeOutCubic(t), 0);
          break;
        case 'arc':
          p.arc(0, 0, r * 2, r * 2, 0, p.PI * easeOutCubic(t));
          break;
        case 'triangle':
          drawPolygon(p, 0, 0, r, 3, -p.HALF_PI);
          break;
        case 'square':
          drawPolygon(p, 0, 0, r, 4, p.PI / 4);
          break;
        case 'pentagon':
          drawPolygon(p, 0, 0, r, 5, -p.HALF_PI);
          break;
        case 'hexagon':
          drawPolygon(p, 0, 0, r, 6, 0);
          break;
      }
      p.pop();
    }

    // ── Polygon Helper ────────────────────────────────────
    function drawPolygon(p, cx, cy, radius, sides, rotation) {
      p.beginShape();
      for (let i = 0; i < sides; i++) {
        const angle = (p.TWO_PI / sides) * i + rotation;
        p.vertex(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      }
      p.endShape(p.CLOSE);
    }

    // ── Connection Drawing ────────────────────────────────
    function drawConnectionGlowing(p, conn, fromNode, toNode, t, alpha) {
      const [R, G, B] = hexToRGB(conn.color);
      const glowColor = `rgba(${R}, ${G}, ${B}, 0.6)`;

      setGlow(p, glowColor, 16);
      drawConnection(p, conn, fromNode, toNode, t, alpha * 0.5);
      clearGlow(p);

      setGlow(p, glowColor, 6);
      drawConnection(p, conn, fromNode, toNode, t, alpha * 0.85);
      clearGlow(p);
    }

    function drawConnection(p, conn, from, to, t, alpha) {
      const progress = easeOutCubic(Math.min(t, 1.0));
      const [R, G, B] = hexToRGB(conn.color);
      p.noFill();
      p.stroke(R, G, B, alpha);

      if (conn.type === 'solid') {
        p.strokeWeight(1.2);
        const ex = p.lerp(from.x, to.x, progress);
        const ey = p.lerp(from.y, to.y, progress);
        p.line(from.x, from.y, ex, ey);
      }
      else if (conn.type === 'dashed') {
        p.strokeWeight(0.9);
        const segs = 8;
        for (let i = 0; i < segs * progress; i++) {
          if (i % 2 === 0) {
            const t0 = i / segs;
            const t1 = Math.min((i + 0.6) / segs, progress);
            p.line(p.lerp(from.x, to.x, t0), p.lerp(from.y, to.y, t0),
                   p.lerp(from.x, to.x, t1), p.lerp(from.y, to.y, t1));
          }
        }
      }
      else if (conn.type === 'curved') {
        p.strokeWeight(1.2);
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const cpx = mx - (dy / len) * 28;
        const cpy = my + (dx / len) * 28;
        p.beginShape();
        for (let s = 0; s <= 24; s++) {
          const st = (s / 24) * progress;
          p.vertex(quadBezier(from.x, cpx, to.x, st),
                   quadBezier(from.y, cpy, to.y, st));
        }
        p.endShape();
      }
    }

    function quadBezier(p0, p1, p2, t) {
      return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
    }

    // ── Idle Animation ────────────────────────────────────
    function drawIdleDot(p, time) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.001 * p.TWO_PI);
      const r = 4 + pulse * 3;
      const a = 0.3 + pulse * 0.4;
      p.push();
      p.translate(p.width / 2, p.height / 2);
      setGlow(p, `rgba(255,255,255,0.8)`, 20 + pulse * 15);
      p.noStroke();
      p.fill(255, 255, 255, a);
      p.circle(0, 0, r * 2);
      clearGlow(p);
      p.pop();
    }

    // ── Glow Helpers ──────────────────────────────────────
    function setGlow(p, color, blur) {
      p.drawingContext.shadowBlur = blur;
      p.drawingContext.shadowColor = color;
    }

    function clearGlow(p) {
      p.drawingContext.shadowBlur = 0;
      p.drawingContext.shadowColor = 'transparent';
    }

    // ── Color Helpers ─────────────────────────────────────
    function hexToRGB(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    }

    // ── Easing ────────────────────────────────────────────
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - Math.min(t, 1), 3);
    }

    // ── Resize ────────────────────────────────────────────
    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    // ── Public API ────────────────────────────────────────
    p.setGlyphTree = (tree) => {
      if (state === 'IDLE') {
        currentTree = tree;
        growthProgress = new Array(tree.nodes.length).fill(0);
        masterAlpha = 1.0;
        state = 'GROWING';
      } else {
        nextTree = tree;
        state = 'FADING';
      }
    };
  };

  // Mount the sketch and expose its public API
  const instance = new p5(sketch, containerEl);

  return {
    setGlyphTree: (tree) => instance.setGlyphTree(tree),
    resize: () => instance.windowResized()
  };
}
```

---

## What Makes It "Wow" vs "Meh" — The Trickiest Challenges

### 1. The Double-Pass Glow (CRITICAL)
A single `shadowBlur` pass looks like blurry shapes.
The two-pass technique (wide dim halo + narrow bright core) creates the luminous, volumetric feel of light — like neon or bioluminescence.
**This single detail separates "wow" from "meh."**

### 2. ADD Blend Mode on Transparent Background
Without `blendMode(ADD)`, overlapping colored shapes produce muddy averages.
With ADD, overlapping coral and violet produce bright white-pink — colors combine like light, not paint.
On a dark projection surface, this becomes magical.
**Do not forget this.** It changes everything.

### 3. Growth Timing Feels Organic, Not Mechanical
The `SIBLING_THRESHOLD = 0.70` means child nodes start appearing before parent nodes finish.
This creates overlapping growth — not a strict sequence, not simultaneous chaos.
It feels like something genuinely growing: stems appear as the root is still settling.
Too fast: feels like a chart loading.
Too slow: loses the magic.
Tune this in the first test run.

### 4. Perlin Noise Wobble Seeded by Node ID
If all nodes wobble on the same phase, the glyph feels like it's shaking.
If each node gets its own Perlin seed (`i * 100`), nodes breathe independently.
The overall glyph feels organic and alive, not jittery.
**Amplitude must stay small** — ±2px is barely visible but felt subconsciously.

### 5. The Fade-to-Black Transition
The sharp cut to darkness before new growth (instead of a crossfade) is a deliberate choice.
It reinforces the void-to-presence dynamic that ULP is philosophically built on.
If it feels too abrupt in testing, slow the fade to 600ms — but don't crossfade.

### 6. Connection Curves Don't Look Like Flowcharts
The perpendicular control point offset for curved connectors must be proportional to line length.
Short connections with large offsets look like eyes or bubbles — wrong.
Long connections with small offsets look like straight lines — wasted.
A formula like `offset = Math.min(lineLength * 0.25, 40)` keeps curves graceful at all distances.

---

## Performance: 50+ Nodes

For complex glyphs, performance is maintained via:

| Strategy | Detail |
|---|---|
| Skip invisible nodes | `if (t <= 0 || alpha < 0.02) return` |
| Scale glow intensity | Reduce `shadowBlur` by 40% when node count > 30 |
| Cap frame rate as fallback | `p.frameRate(30)` if `p.deltaTime > 40` (detecting < 25fps) |
| Perlin noise is cheap | `p.noise()` is O(1); no concern |
| ADD blend mode is native GPU | No performance penalty vs BLEND mode in modern browsers |

---

## Integration Contract with main.js

```js
// main.js
const renderer = createRenderer(document.getElementById('canvas-container'));

// When Layout Engine produces a tree:
function onNewGlyph(glyphTree) {
  renderer.setGlyphTree(glyphTree);
}
```

The renderer is self-contained.
It handles its own timing, animation loop, and state.
`main.js` only calls `setGlyphTree()` — nothing else.

---

## CSS Requirements (for style.css — Section 4 to implement)

```css
#canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  pointer-events: none;  /* let UI elements below receive clicks */
  z-index: 0;
}

/* For local dev/demo: dark body bg so glow shows */
body {
  background: #0a0a0f;  /* near-black, very dark blue */
}

/* For projection: body background: transparent; and embed in a div */
```

---

## Open Questions for Integration Testing

1. **Alpha range for shapes:** In ADD blend mode, shapes drawn at alpha 0.7 over white will blow out.
   Test on a dark background first. If demoing on white, may need to reduce node alpha or disable ADD mode.

2. **GlyphTree coordinate scale:** If Layout Engine produces coordinates in a ±200px range and the installation runs at 4K resolution, shapes will cluster in a tiny center patch.
   The renderer should expose a `scale` parameter, or Layout Engine should normalize to percentage of viewport.
   Recommend: Layout Engine produces coordinates in ±(viewportWidth/4) range.

3. **Connection color:** Plan says connections have a `color` property.
   If Layout Engine doesn't set it, renderer should default to a blend of source/target node colors:
   ```js
   const blended = blendHexColors(fromNode.color, toNode.color, 0.5);
   ```

4. **Shape rotation for 'line' shape:** The `line` shape needs a direction angle.
   Layout Engine should set `node.angle` for line-shaped nodes. If absent, default to `0` (horizontal).

---

## Summary: Implementation Order

1. Scaffold: instance mode setup, transparent canvas, resize handler
2. Idle state: pulsing center dot
3. Shape drawing: `drawPolygon` + all 7 shapes, no glow yet
4. Glow: add two-pass `shadowBlur` technique, verify it looks good on dark bg
5. ADD blend mode: enable, test color mixing
6. Growth animation: state machine, `updateGrowth`, `growthProgress`
7. Connections: solid, dashed, curved Bezier
8. Alive state: Perlin wobble + breathing pulse
9. Fading transition: masterAlpha fade-out + new tree transition
10. Performance tuning: node count scaling, frameRate guard
