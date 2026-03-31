# Recursive Glyph Generator — Plan

## Vision

A glyph is a living symbol. It grows from a seed — a single point at the center.
Arms radiate outward in 6 hexagonal directions, like crystal growth.
At each arm's tip, a shape crystallizes: a dot, a line, a curve, a triangle, a diamond.
Any shape can become a new junction — a new seed — sprouting its own arms.
The result: compact, connected, organic symbols that breathe and glow like bioluminescent runes.

## Assumptions

- **Art-first**: beautiful before rigorous. Can retrofit ULP theory later.
- **Additive**: new system runs alongside existing NLP system (separate entry point).
- **Same renderer**: reuse the p5.js animation engine (growth, glow, breathing).
- **Same aesthetic**: dark bg, transparent for projection, luminous glow, frosted glass UI.
- **No build step**: vanilla JS + p5.js from CDN.

---

## The 6-Direction Compass

```
         1 (up)
        / \
   6   /   \   2
      /     \
     |   ●   |
      \     /
   5   \   /   3
        \ /
         4 (down)
```

60° intervals. Canvas angles (Y-down):

| Dir | Name | Angle (radians) |
|-----|------|-----------------|
| 1 | Up | -π/2 |
| 2 | Upper-right | -π/6 |
| 3 | Lower-right | π/6 |
| 4 | Down | π/2 |
| 5 | Lower-left | 5π/6 |
| 6 | Upper-left | -5π/6 |

## 5 Shape Primitives

| Shape | Glyph | Char | Filled? | Oriented? |
|-------|-------|------|---------|-----------|
| Dot | ● | `.` | yes | no |
| Line | — | `-` | no (stroke) | yes — along arm |
| Curve | ⌒ | `~` | no (stroke) | yes — arc perpendicular to arm |
| Triangle | ▲ | `^` | no (stroke) | yes — points along arm |
| Diamond | ◆ | `*` | yes | no |

Oriented shapes rotate to match the direction of the arm they sit on.

## Notation

A linear encoding of a recursive glyph tree.

**Tokens**: `[direction 1-6][shape char][o?]`

- Shape chars: `.` dot, `-` line, `~` curve, `^` triangle, `*` diamond
- `o` suffix = **junction** (this node opens for children; subsequent tokens are its children)
- Without `o` = **terminal** (leaf node, no children)
- `(` `)` = explicit grouping (optional — for multi-branch junctions)

**Implicit rule**: After a junction (`o`), all following tokens are children of that junction until the string ends or a `)` closes the group.

**Example**: `5.1o(3~6^)4*`

```
Root (dot, center)
├── dir 5: dot
├── dir 1: dot (junction)
│   ├── dir 3: curve
│   └── dir 6: triangle
└── dir 4: diamond
```

**Wisdom's notation**: `5.1o3.1o6.1o4.`

```
Root (dot)
├── dir 5: dot
└── dir 1: junction
    ├── dir 3: dot
    └── dir 1: junction
        ├── dir 6: dot
        └── dir 1: junction
            └── dir 4: dot
```

A spine going upward (dir 1) with dots branching off — an organic tendril.

---

## Architecture

```
Notation string  ──or──  Random generator  ──or──  Curated preset
                    ↓
            GlyphSpec (tree)
         { shape, color, dir, children[] }
                    ↓
           glyph-layout.js
    walks tree, computes x/y positions
                    ↓
          GlyphTree (positioned)
    { nodes[], connections[] }
    same format renderer.js expects
                    ↓
           renderer.js (unchanged*)
    growth animation, glow, breathing
```

*Only change: add `diamond` shape + rotation support for oriented shapes.

## Data Contracts

### GlyphSpec (internal — glyph-engine.js)

```js
{
  shape: 'dot',           // root shape
  color: '#FF6B6B',       // hex
  children: [
    {
      dir: 1,             // direction 1-6
      shape: 'curve',
      color: '#B388FF',
      children: []        // terminal
    },
    {
      dir: 3,
      shape: 'triangle',
      color: '#4ECDC4',
      children: [...]     // recursive
    }
  ]
}
```

### GlyphTree (output — same as renderer expects)

```js
{
  nodes: [{
    id: string,
    word: string,         // notation fragment or empty
    shape: string,        // dot|line|curve|triangle|diamond
    color: string,        // hex
    secondaryColor: null,
    size: number,         // radius px
    x: number,            // absolute canvas position
    y: number,
    growthOrder: number,  // 0=center, BFS outward
    rotation: number,     // radians — arm direction (new field)
    depth: number,
  }],
  connections: [{
    fromId: string,
    toId: string,
    type: 'solid',
    color: string,        // blend of parent+child
    weight: number,
  }],
  centerX: number,
  centerY: number,
}
```

## Color Strategy

12 semantic colors from the existing palette. Assignment modes:

1. **Depth gradient** (default): warm center → cool edges.
   Depth 0: coral `#FF6B6B`, Depth 1: amber `#FFB347`, Depth 2: gold `#FFD93D`,
   Depth 3: emerald `#4ECDC4`, Depth 4: violet `#B388FF`, Depth 5+: white `#FFFFFF`

2. **Shape identity**: each shape type has a fixed color.
   dot=white, line=amber, curve=emerald, triangle=coral, diamond=violet

3. **Per-preset**: curated demos specify exact colors per node.

4. **Random**: pick from palette randomly.

## Demo Glyphs

| Name | Notation | Visual Character | Palette |
|------|----------|-----------------|---------|
| seed | (root only) | Single luminous point | white |
| bloom | `1.2.3.4.5.6.` | 6-armed star, all dots | rainbow by direction |
| fern | `1o(2.1o(3.1o(2.1.)))` | Recursive tendril | warm→cool gradient |
| crystal | `1o(2.6.)3o(2.4.)5o(4.6.)` | 3-fold symmetric | ice blues + whites |
| rune | `1-2o(1^3*)4~6.` | Compact asymmetric symbol | coral + amber |
| cascade | `1o(2o(3.1.)6o(5.1.))4o(3.5.)` | Wide branching tree | emerald + gold |
| spiral | `2o3o4o5o6o1.` | Hexagonal spiral | depth gradient |
| signal | `1-1-1-1-4*` | Tall antenna | amber + violet |

Plus a **random** button that generates a new glyph each click.

## Renderer Changes

1. **Add `diamond` shape**: filled 4-sided polygon, flat orientation (vertex at top).
2. **Add rotation support**: `_drawNodeShapeAt` reads `node.rotation`.
   - `p.translate(px, py)` then `p.rotate(rotation)` then draw at origin.
   - Dot + Diamond: unaffected (rotationally symmetric enough).
   - Line: stroke rotates to match arm direction.
   - Curve: arc rotates to open perpendicular to arm.
   - Triangle: rotates to point along arm.
3. **Junction dots**: junction nodes render as slightly larger dots with a brighter core.

## Layout Constants

```js
ARM_LENGTH   = 48    // px, parent→child distance
BASE_SIZE    = 12    // px, root node radius
SIZE_DECAY   = 0.82  // per depth level
MIN_SIZE     = 4     // px minimum
JUNCTION_SCALE = 0.7 // junctions are smaller than terminals
```

## New Files

| # | File | Lines (est.) |
|---|------|-------------|
| 1 | `js/glyph-engine.js` | ~200 |
| 2 | `js/glyph-layout.js` | ~150 |
| 3 | `js/glyph-demos.js` | ~80 |
| 4 | `js/glyph-main.js` | ~100 |
| 5 | `glyph.html` | ~30 |

## Execution Order

1. `renderer.js` — add diamond + rotation (small, unlocks everything)
2. `glyph-engine.js` — data model, notation parser, random generator
3. `glyph-layout.js` — tree walk → positioned nodes + connections
4. `glyph-demos.js` — curated presets
5. `glyph-main.js` — wire engine + layout + renderer + UI
6. `glyph.html` — entry point loading the new files
7. Browser test → polish
