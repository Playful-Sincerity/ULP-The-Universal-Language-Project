/**
 * glyph-layout.js
 * Converts a GlyphSpec tree (from glyph-engine.js) into a positioned
 * GlyphTree that renderer.js can animate.
 *
 * Walks the spec tree recursively from center outward, placing each node
 * at the correct canvas position based on its direction and depth.
 *
 * Public API:
 *   window.GlyphLayout.build(glyphSpec, canvasW, canvasH) → GlyphTree
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // Layout Constants
  // ─────────────────────────────────────────────────────────────────────────────

  const ARM_LENGTH     = 48;     // px between parent center and child center
  const BASE_SIZE      = 13;     // px radius of root node
  const SIZE_DECAY     = 0.82;   // multiply size by this per depth level
  const MIN_SIZE       = 4;      // px minimum radius
  const JUNCTION_SCALE = 0.65;   // junctions are smaller than terminals
  const CANVAS_MARGIN  = 60;     // px margin from canvas edges

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const DIRS = window.GlyphEngine.DIRECTIONS;

  function blendColors(hex1, hex2) {
    try {
      const r1 = parseInt(hex1.slice(1, 3), 16);
      const g1 = parseInt(hex1.slice(3, 5), 16);
      const b1 = parseInt(hex1.slice(5, 7), 16);
      const r2 = parseInt(hex2.slice(1, 3), 16);
      const g2 = parseInt(hex2.slice(3, 5), 16);
      const b2 = parseInt(hex2.slice(5, 7), 16);
      const r = Math.round((r1 + r2) / 2);
      const g = Math.round((g1 + g2) / 2);
      const b = Math.round((b1 + b2) / 2);
      return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    } catch (_) {
      return hex1;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Overlap Resolution
  //
  // After initial placement, push apart overlapping nodes and check that
  // connection lines don't pass through unrelated nodes.
  // ─────────────────────────────────────────────────────────────────────────────

  const PADDING = 6;           // minimum px gap between node edges
  const RELAX_ITERATIONS = 8;  // max relaxation passes
  const RELAX_STRENGTH = 0.5;  // how aggressively to push apart (0-1)

  function resolveOverlaps(nodes, connections) {
    if (nodes.length < 2) return;

    // Build parent lookup: childId → parentId (from connections)
    const parentOf = {};
    connections.forEach(c => { parentOf[c.toId] = c.fromId; });

    for (let iter = 0; iter < RELAX_ITERATIONS; iter++) {
      let anyOverlap = false;

      // ── Node-node overlap ────────────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const minDist = a.size + b.size + PADDING;

          if (dist < minDist) {
            anyOverlap = true;
            const overlap = minDist - dist;
            const push = overlap * RELAX_STRENGTH * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            // Deeper nodes move more (shallower ones are more "anchored")
            const aWeight = (a.depth || 0) + 1;
            const bWeight = (b.depth || 0) + 1;
            const total = aWeight + bWeight;

            a.x -= nx * push * (aWeight / total);
            a.y -= ny * push * (aWeight / total);
            b.x += nx * push * (bWeight / total);
            b.y += ny * push * (bWeight / total);
          }
        }
      }

      // ── Node-connection overlap ──────────────────────────────────────
      // Check if any node sits on a connection line it doesn't belong to.
      for (let ni = 0; ni < nodes.length; ni++) {
        const node = nodes[ni];
        for (let ci = 0; ci < connections.length; ci++) {
          const conn = connections[ci];
          // Skip connections this node belongs to
          if (conn.fromId === node.id || conn.toId === node.id) continue;

          const from = nodes.find(n => n.id === conn.fromId);
          const to   = nodes.find(n => n.id === conn.toId);
          if (!from || !to) continue;

          const closest = pointToSegmentDist(node.x, node.y, from.x, from.y, to.x, to.y);
          const minClear = node.size + PADDING;

          if (closest < minClear) {
            anyOverlap = true;
            // Push node perpendicular to the connection line
            const ldx = to.x - from.x;
            const ldy = to.y - from.y;
            const len = Math.sqrt(ldx * ldx + ldy * ldy) || 0.01;
            // Perpendicular direction
            let px = -ldy / len;
            let py =  ldx / len;
            // Make sure we push in the right direction (away from line)
            const testDx = node.x - from.x;
            const testDy = node.y - from.y;
            if (testDx * px + testDy * py < 0) { px = -px; py = -py; }

            const pushDist = (minClear - closest) * RELAX_STRENGTH;
            node.x += px * pushDist;
            node.y += py * pushDist;
          }
        }
      }

      if (!anyOverlap) break;
    }
  }

  /**
   * Distance from point (px, py) to the closest point on segment (x1,y1)-(x2,y2).
   */
  function pointToSegmentDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));

    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Build GlyphTree
  // ─────────────────────────────────────────────────────────────────────────────

  function build(glyphSpec, canvasW, canvasH) {
    const w = (canvasW && canvasW > 0) ? canvasW : 800;
    const h = (canvasH && canvasH > 0) ? canvasH : 600;
    const cx = w / 2;
    const cy = h / 2;

    if (!glyphSpec) {
      return { nodes: [], connections: [], centerX: cx, centerY: cy };
    }

    const glyphNodes = [];
    const connections = [];
    let idCounter = 0;

    // ── Recursive tree walk ────────────────────────────────────────────────

    function placeNode(spec, x, y, depth, armAngle) {
      const isJunction = spec.children && spec.children.length > 0;
      const sizeMultiplier = isJunction ? JUNCTION_SCALE : 1.0;
      const rawSize = BASE_SIZE * Math.pow(SIZE_DECAY, depth) * sizeMultiplier;
      const size = Math.max(MIN_SIZE, rawSize);

      const id = 'g_' + (idCounter++);
      const growthOrder = glyphNodes.length;

      glyphNodes.push({
        id:             id,
        word:           '',
        shape:          spec.shape || 'dot',
        color:          spec.color || '#FFFFFF',
        secondaryColor: null,
        size:           Math.round(size * 10) / 10,
        x:              x,
        y:              y,
        growthOrder:    growthOrder,
        rotation:       armAngle || 0,
        depth:          depth,
        role:           'unknown',
        sentenceIndex:  0,
      });

      // Place children
      if (spec.children) {
        spec.children.forEach(child => {
          const dir = child.dir || 1;
          const angle = DIRS[dir] !== undefined ? DIRS[dir] : DIRS[1];
          const arm = ARM_LENGTH * Math.pow(SIZE_DECAY, depth * 0.5);
          const childX = x + Math.cos(angle) * arm;
          const childY = y + Math.sin(angle) * arm;

          // Connection from parent to child
          connections.push({
            fromId: id,
            toId:   'g_' + idCounter,  // next node will get this id
            type:   'solid',
            color:  blendColors(spec.color || '#FFFFFF', child.color || '#FFFFFF'),
            weight: Math.max(0.6, 1.2 * Math.pow(SIZE_DECAY, depth)),
          });

          placeNode(child, childX, childY, depth + 1, angle);
        });
      }
    }

    // Start from root at center
    placeNode(glyphSpec, cx, cy, 0, 0);

    // ── Overlap resolution ─────────────────────────────────────────────────
    // Push apart any nodes whose bounding circles overlap.
    // Preserves the connection topology — only adjusts positions.

    resolveOverlaps(glyphNodes, connections);

    // ── Scale to fit canvas ────────────────────────────────────────────────

    if (glyphNodes.length > 1) {
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      glyphNodes.forEach(n => {
        minX = Math.min(minX, n.x - n.size);
        maxX = Math.max(maxX, n.x + n.size);
        minY = Math.min(minY, n.y - n.size);
        maxY = Math.max(maxY, n.y + n.size);
      });

      const glyphW = maxX - minX;
      const glyphH = maxY - minY;
      const availW = w - 2 * CANVAS_MARGIN;
      const availH = h - 2 * CANVAS_MARGIN;

      const scale = Math.min(availW / (glyphW || 1), availH / (glyphH || 1), 1.0);

      if (scale < 1.0) {
        const glyphCX = (minX + maxX) / 2;
        const glyphCY = (minY + maxY) / 2;
        glyphNodes.forEach(n => {
          n.x = cx + (n.x - glyphCX) * scale;
          n.y = cy + (n.y - glyphCY) * scale;
          n.size *= scale;
        });
      } else {
        // Center the glyph
        const glyphCX = (minX + maxX) / 2;
        const glyphCY = (minY + maxY) / 2;
        const dx = cx - glyphCX;
        const dy = cy - glyphCY;
        glyphNodes.forEach(n => {
          n.x += dx;
          n.y += dy;
        });
      }
    }

    return {
      nodes:       glyphNodes,
      connections: connections,
      centerX:     cx,
      centerY:     cy,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────────────────────────────────────

  window.GlyphLayout = {
    build,
    blendColors,
    ARM_LENGTH,
    BASE_SIZE,
  };

})();
