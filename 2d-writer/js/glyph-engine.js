/**
 * glyph-engine.js
 * Core of the recursive glyph system.
 *
 * A glyph is a tree: a root node with children branching in 6 hexagonal
 * directions. Each node has a shape and color. Any node can recursively
 * branch into more nodes.
 *
 * This file provides:
 *   - The 6-direction compass (angles, names)
 *   - The 5 shape primitives
 *   - The 12 semantic color palette
 *   - A notation parser ("5.1o3~6^")
 *   - A random glyph generator
 *   - GlyphSpec data model
 *
 * Public API:
 *   window.GlyphEngine.parse(notation)      → GlyphSpec
 *   window.GlyphEngine.random(opts)          → GlyphSpec
 *   window.GlyphEngine.DIRECTIONS
 *   window.GlyphEngine.SHAPES
 *   window.GlyphEngine.PALETTE
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // 6-Direction Hexagonal Compass
  //
  //          1 (up)
  //         / \
  //    6   /   \   2
  //       /     \
  //      |   ●   |
  //       \     /
  //    5   \   /   3
  //         \ /
  //          4 (down)
  //
  // Angles in canvas coordinates (Y-axis points down).
  // ─────────────────────────────────────────────────────────────────────────────

  const DIRECTIONS = {
    1: -Math.PI / 2,              // up
    2: -Math.PI / 6,              // upper-right
    3:  Math.PI / 6,              // lower-right
    4:  Math.PI / 2,              // down
    5:  5 * Math.PI / 6,          // lower-left
    6: -5 * Math.PI / 6,          // upper-left
  };

  const DIR_NAMES = {
    1: 'up',
    2: 'upper-right',
    3: 'lower-right',
    4: 'down',
    5: 'lower-left',
    6: 'upper-left',
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5 Shape Primitives
  //
  // Each shape has a notation character and a visual identity.
  // ─────────────────────────────────────────────────────────────────────────────

  const SHAPES = {
    '.': 'dot',
    '-': 'line',
    '~': 'curve',
    '^': 'triangle',
    '*': 'diamond',
  };

  const SHAPE_NAMES = ['dot', 'line', 'curve', 'triangle', 'diamond'];

  // ─────────────────────────────────────────────────────────────────────────────
  // 12 Semantic Color Palette
  // ─────────────────────────────────────────────────────────────────────────────

  const PALETTE = [
    '#FFFFFF',   // 0  existence — bright white
    '#FF6B6B',   // 1  emotion — warm coral
    '#B388FF',   // 2  thought — soft violet
    '#FFB347',   // 3  action — amber orange
    '#4ECDC4',   // 4  nature — emerald green
    '#45B7D1',   // 5  structure — cyan blue
    '#FFD93D',   // 6  relation — warm gold
    '#26A69A',   // 7  time — teal
    '#5C6BC0',   // 8  space — deep indigo
    '#B0BEC5',   // 9  quantity — silver
    '#F48FB1',   // 10 quality — rose pink
    '#AED581',   // 11 expression — lime green
  ];

  // Warm-to-cool depth gradient (default coloring strategy)
  const DEPTH_COLORS = [
    '#FF6B6B',   // depth 0 — coral
    '#FFB347',   // depth 1 — amber
    '#FFD93D',   // depth 2 — gold
    '#4ECDC4',   // depth 3 — emerald
    '#B388FF',   // depth 4 — violet
    '#45B7D1',   // depth 5 — cyan
    '#FFFFFF',   // depth 6+ — white
  ];

  function colorForDepth(depth) {
    return DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GlyphSpec Data Model
  //
  // {
  //   shape: 'dot',           // shape name
  //   color: '#FF6B6B',       // hex color
  //   children: [
  //     { dir: 1, shape: 'curve', color: '#B388FF', children: [] },
  //     { dir: 3, shape: 'triangle', color: '#4ECDC4', children: [...] },
  //   ]
  // }
  //
  // Root node has no `dir` (it's the center). Children have `dir` 1-6.
  // ─────────────────────────────────────────────────────────────────────────────

  function makeNode(shape, color, dir, children) {
    return {
      shape:    shape || 'dot',
      color:    color || '#FFFFFF',
      dir:      dir || null,
      children: children || [],
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Notation Parser
  //
  // Syntax:  [direction 1-6][shape char][o?]
  //   shape chars: . (dot)  - (line)  ~ (curve)  ^ (triangle)  * (diamond)
  //   o = junction (open for children — subsequent tokens nest under this node)
  //   ( ) = explicit grouping
  //
  // Examples:
  //   "1.2.3.4.5.6."         → 6-armed star, all dots
  //   "5.1o3~1o6^1o4*"       → spine with branching shapes
  //   "1o(2.3.)4o(5~6^)"     → two junctions with explicit children
  // ─────────────────────────────────────────────────────────────────────────────

  function parse(notation, colorMode) {
    if (!notation || typeof notation !== 'string') {
      return makeNode('dot', PALETTE[0]);
    }

    const cMode = colorMode || 'depth';
    const root = makeNode('dot', colorForDepth(0));
    const stack = [root]; // stack[stack.length-1] is the current parent
    let i = 0;
    const s = notation.replace(/\s/g, '');

    while (i < s.length) {
      const ch = s[i];

      // Grouping
      if (ch === '(') {
        // The most recently added child becomes the new parent
        const parent = stack[stack.length - 1];
        const lastChild = parent.children[parent.children.length - 1];
        if (lastChild) {
          stack.push(lastChild);
        }
        i++;
        continue;
      }
      if (ch === ')') {
        if (stack.length > 1) stack.pop();
        i++;
        continue;
      }

      // Direction digit (1-6)
      const dirChar = ch;
      const dir = parseInt(dirChar, 10);
      if (isNaN(dir) || dir < 1 || dir > 6) {
        i++;
        continue; // skip invalid characters
      }
      i++;

      // Shape character
      let shape = 'dot';
      let isJunction = false;
      if (i < s.length) {
        const shapeChar = s[i];
        if (shapeChar === 'o') {
          // Junction — dot that opens for children
          shape = 'dot';
          isJunction = true;
          i++;
        } else if (SHAPES[shapeChar]) {
          shape = SHAPES[shapeChar];
          i++;
          // Check for trailing 'o' (e.g., "1~o" = curve junction)
          if (i < s.length && s[i] === 'o') {
            isJunction = true;
            i++;
          }
        }
        // If neither shape char nor 'o', treat as bare direction (dot terminal)
      }

      // Determine color (children of root are depth 1, etc.)
      const depth = stack.length;
      let color;
      if (cMode === 'depth') {
        color = colorForDepth(depth);
      } else if (cMode === 'shape') {
        const shapeIdx = SHAPE_NAMES.indexOf(shape);
        color = PALETTE[shapeIdx >= 0 ? shapeIdx : 0];
      } else {
        color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      }

      // Create the child node
      const child = makeNode(shape, color, dir, []);
      const parent = stack[stack.length - 1];
      parent.children.push(child);

      // If junction, push onto stack so subsequent tokens are children
      if (isJunction) {
        stack.push(child);
      }
    }

    return root;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Random Glyph Generator
  //
  // Creates organically beautiful random glyphs.
  // ─────────────────────────────────────────────────────────────────────────────

  function random(opts) {
    const o = opts || {};
    const maxDepth     = o.maxDepth     || 3;
    const maxChildren  = o.maxChildren  || 2;
    const branchChance = o.branchChance || 0.35;
    const colorMode    = o.colorMode    || 'depth';
    const palette      = o.palette      || null;  // custom color array
    const maxNodes     = o.maxNodes     || 20;    // hard cap for performance

    function pickColor(depth) {
      if (palette) return palette[depth % palette.length];
      if (colorMode === 'depth') return colorForDepth(depth);
      if (colorMode === 'shape') return PALETTE[Math.floor(Math.random() * 5)];
      return PALETTE[Math.floor(Math.random() * PALETTE.length)];
    }

    function pickShape() {
      return SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
    }

    function usedDirections(node) {
      return new Set(node.children.map(c => c.dir));
    }

    function availableDirections(node) {
      const used = usedDirections(node);
      return [1, 2, 3, 4, 5, 6].filter(d => !used.has(d));
    }

    function pickDirection(node) {
      const avail = availableDirections(node);
      if (avail.length === 0) return null;
      return avail[Math.floor(Math.random() * avail.length)];
    }

    let nodeCount = 0;

    function buildSubtree(depth) {
      nodeCount++;
      const shape = depth === 0 ? 'dot' : pickShape();
      const color = pickColor(depth);
      const node = makeNode(shape, color, null, []);

      if (depth >= maxDepth || nodeCount >= maxNodes) return node;

      // Decide how many children (at least 1 for root, random after that)
      let numChildren;
      if (depth === 0) {
        // Root gets 2-4 arms
        numChildren = 2 + Math.floor(Math.random() * 3);
      } else {
        // Deeper nodes branch with decreasing probability
        const adjustedChance = branchChance * Math.pow(0.8, depth);
        numChildren = 0;
        for (let c = 0; c < maxChildren; c++) {
          if (Math.random() < adjustedChance) numChildren++;
        }
      }

      numChildren = Math.min(numChildren, 6);

      const usedDirs = new Set();
      for (let c = 0; c < numChildren; c++) {
        if (nodeCount >= maxNodes) break;
        const avail = [1, 2, 3, 4, 5, 6].filter(d => !usedDirs.has(d));
        if (avail.length === 0) break;
        const dir = avail[Math.floor(Math.random() * avail.length)];
        usedDirs.add(dir);

        const child = buildSubtree(depth + 1);
        child.dir = dir;
        node.children.push(child);
      }

      return node;
    }

    return buildSubtree(0);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Text → Glyph
  //
  // Deterministic mapping: same text always produces the same glyph.
  // No semantics — just character codes driving direction + shape.
  //
  // Structure: each word becomes a branch from root. Within each word,
  // characters chain together, each one picking the next direction and shape.
  // ─────────────────────────────────────────────────────────────────────────────

  function fromText(text) {
    if (!text || typeof text !== 'string') {
      return makeNode('dot', PALETTE[0]);
    }

    const clean = text.trim().toLowerCase();
    if (clean.length === 0) return makeNode('dot', PALETTE[0]);

    // Split into words (non-whitespace chunks)
    const words = clean.split(/\s+/).filter(w => w.length > 0);

    const root = makeNode('dot', colorForDepth(0));

    // Assign each word a direction from root (spread evenly around compass)
    const wordDirs = words.length <= 6
      ? words.map((_, i) => ((i % 6) + 1))
      : words.map((_, i) => ((i % 6) + 1)); // wraps for 7+ words

    words.forEach((word, wi) => {
      const wordDir = wordDirs[wi];
      // Build a chain for this word's characters
      const wordNode = buildWordChain(word, 1, wi);
      wordNode.dir = wordDir;
      root.children.push(wordNode);
    });

    return root;
  }

  /**
   * Build a chain of nodes for a word's characters.
   * Each character determines the next direction and shape.
   */
  function buildWordChain(word, depth, wordIndex) {
    if (word.length === 0) return makeNode('dot', colorForDepth(depth));

    const chars = word.split('');
    const firstChar = chars[0];
    const code = firstChar.charCodeAt(0);

    // Shape from char code
    const shape = SHAPE_NAMES[code % SHAPE_NAMES.length];

    // Color from char position in alphabet + word index for variety
    const colorIdx = (code + wordIndex) % PALETTE.length;
    const color = PALETTE[colorIdx];

    const node = makeNode(shape, color, null, []);

    // Chain remaining characters as descendants
    if (chars.length > 1) {
      const remaining = chars.slice(1);
      // Direction for next char: derived from current + next char
      const nextCode = remaining[0].charCodeAt(0);
      const nextDir = (nextCode % 6) + 1;

      const child = buildWordChain(remaining.join(''), depth + 1, wordIndex);
      child.dir = nextDir;
      node.children.push(child);
    }

    return node;
  }

  /**
   * Detect whether input is notation or text.
   * Notation: only digits 1-6, shape chars (.~^*-o), parens, whitespace.
   * Anything else (letters, other chars) = text.
   */
  function isNotation(input) {
    if (!input) return false;
    const cleaned = input.replace(/\s/g, '');
    return /^[1-6\.\-~\^*o()]+$/.test(cleaned);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Utility: count total nodes in a spec
  // ─────────────────────────────────────────────────────────────────────────────

  function countNodes(spec) {
    if (!spec) return 0;
    let count = 1;
    (spec.children || []).forEach(c => { count += countNodes(c); });
    return count;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Utility: spec to notation string (for display)
  // ─────────────────────────────────────────────────────────────────────────────

  function toNotation(spec) {
    if (!spec) return '';

    const shapeToChar = {};
    Object.entries(SHAPES).forEach(([ch, name]) => { shapeToChar[name] = ch; });

    function walk(node) {
      let result = '';
      (node.children || []).forEach(child => {
        result += child.dir;
        if (child.children && child.children.length > 0) {
          // Junction
          if (child.shape === 'dot') {
            result += 'o';
          } else {
            result += (shapeToChar[child.shape] || '.') + 'o';
          }
          if (child.children.length > 1) {
            result += '(' + walk(child) + ')';
          } else {
            result += walk(child);
          }
        } else {
          // Terminal
          result += shapeToChar[child.shape] || '.';
        }
      });
      return result;
    }

    return walk(spec);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────────────────────────────────────

  window.GlyphEngine = {
    parse,
    random,
    fromText,
    isNotation,
    makeNode,
    countNodes,
    toNotation,
    colorForDepth,
    DIRECTIONS,
    DIR_NAMES,
    SHAPES,
    SHAPE_NAMES,
    PALETTE,
    DEPTH_COLORS,
  };

})();
