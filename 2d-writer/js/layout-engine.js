/**
 * layout-engine.js
 * 2D spatial grammar engine for the ULP 2D Writer.
 *
 * Produces a CONNECTED GLYPH — a single unified symbol where shapes are
 * physically joined by lines at meaningful orientations. Not scattered shapes;
 * one cohesive visual unit that grows from center outward.
 *
 * 8 Orientation System (angles carry grammatical meaning):
 *   N  (90°)  = quality / modifier / "what kind"
 *   NE (45°)  = agent / doer / source of action
 *   E  (0°)   = action / verb / "does what"
 *   SE (315°) = result / object / "to what"
 *   S  (270°) = ground / context / "where/when"
 *   SW (225°) = cause / reason / "because"
 *   W  (180°) = origin / source / "from what"
 *   NW (135°) = condition / "if/when"
 *
 * Public API:
 *   window.LayoutEngine.buildGlyphTree(semanticNodes, canvasW, canvasH) → GlyphTree
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // Constants
  // ─────────────────────────────────────────────────────────────────────────────

  // Arm length — distance from parent shape center to child shape center
  const ARM_LENGTH = 52;

  // Base shape size (radius)
  const BASE_SIZE = 14;

  // Size decay per depth level — deeper nodes are slightly smaller
  const SIZE_DECAY = 0.82;

  // Minimum size
  const MIN_SIZE = 5;

  // Canvas margin
  const CANVAS_MARGIN = 80;

  // ─────────────────────────────────────────────────────────────────────────────
  // 8-direction orientation system
  //
  // Each grammatical role maps to a preferred direction.
  // Multiple children of the same role fan out around their preferred direction.
  // ─────────────────────────────────────────────────────────────────────────────

  const DIRECTIONS = {
    N:  Math.PI / 2,
    NE: Math.PI / 4,
    E:  0,
    SE: -Math.PI / 4,       // = 7π/4
    S:  -Math.PI / 2,       // = 3π/2
    SW: -3 * Math.PI / 4,   // = 5π/4
    W:  Math.PI,
    NW: 3 * Math.PI / 4,    // = 3π/4
  };

  // Role → preferred direction
  const ROLE_DIRECTION = {
    verb:      'E',      // action goes right
    object:    'SE',     // result goes lower-right
    modifier:  'N',      // quality goes up
    context:   'S',      // ground goes down
    connector: 'NW',     // connectors go upper-left
    unknown:   'SW',     // unknowns go lower-left
  };

  // Connection style by role
  const CONNECTION_STYLE = {
    verb:      { type: 'solid',  weight: 1.4 },
    object:    { type: 'solid',  weight: 1.2 },
    modifier:  { type: 'solid',  weight: 0.8 },
    context:   { type: 'dashed', weight: 0.7 },
    connector: { type: 'dotted', weight: 0.6 },
    unknown:   { type: 'solid',  weight: 0.6 },
    subject:   { type: 'solid',  weight: 1.0 },
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

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
  // Build the glyph tree
  // ─────────────────────────────────────────────────────────────────────────────

  function buildGlyphTree(semanticNodes, canvasW, canvasH) {
    const w = (canvasW && canvasW > 0) ? canvasW : 800;
    const h = (canvasH && canvasH > 0) ? canvasH : 600;
    const cx = w / 2;
    const cy = h / 2;

    const nodes = Array.isArray(semanticNodes) ? semanticNodes : [];
    if (nodes.length === 0) {
      return { nodes: [], connections: [], centerX: cx, centerY: cy, scaleFactor: 1 };
    }

    // ── 1. Build parent-child tree structure ──────────────────────────────────

    // Find root (first node with parentIndex === -1, or index 0 as fallback)
    let rootIdx = nodes.findIndex(n => n.parentIndex === -1);
    if (rootIdx === -1) rootIdx = 0;

    // Build children map: parentIdx → [childIdx, childIdx, ...]
    const childrenOf = {};
    nodes.forEach((n, i) => {
      if (i === rootIdx) return;
      const pi = (n.parentIndex >= 0 && n.parentIndex < nodes.length) ? n.parentIndex : rootIdx;
      if (!childrenOf[pi]) childrenOf[pi] = [];
      childrenOf[pi].push(i);
    });

    // ── 2. Assign positions via recursive tree walk ──────────────────────────

    const glyphNodes = [];
    const connections = [];
    let growthCounter = 0;

    // Track used angles at each parent to avoid overlap
    const usedAnglesAt = {}; // parentGlyphId → Set of used angle keys

    function placeNode(nodeIdx, x, y, depth, incomingAngle) {
      const sNode = nodes[nodeIdx];
      const size = Math.max(MIN_SIZE, BASE_SIZE * Math.pow(SIZE_DECAY, depth) * (sNode.weight || 1.0));

      const glyphNode = {
        id:             'node_' + nodeIdx,
        word:           sNode.word || '',
        shape:          sNode.shape || 'dot',
        color:          sNode.color || '#888888',
        secondaryColor: (sNode.colors && sNode.colors[1]) || null,
        size:           Math.round(size * 10) / 10,
        x:              x,
        y:              y,
        growthOrder:    growthCounter++,
        role:           sNode.role || 'unknown',
        sentenceIndex:  sNode.sentenceIndex || 0,
        depth:          depth,
      };

      glyphNodes.push(glyphNode);

      // ── Place children ────────────────────────────────────────────────────

      const children = childrenOf[nodeIdx] || [];
      if (children.length === 0) return;

      // Group children by their preferred direction
      const directionGroups = {};
      children.forEach(childIdx => {
        const childRole = nodes[childIdx].role || 'unknown';
        const dirKey = ROLE_DIRECTION[childRole] || 'SW';
        if (!directionGroups[dirKey]) directionGroups[dirKey] = [];
        directionGroups[dirKey].push(childIdx);
      });

      // For each direction group, fan children around the base direction
      const allPlacements = [];

      Object.entries(directionGroups).forEach(([dirKey, childIndices]) => {
        const baseAngle = DIRECTIONS[dirKey];
        const count = childIndices.length;

        // Fan spread: multiple children in same direction spread ±15° each
        const fanSpread = Math.PI / 12; // 15 degrees

        childIndices.forEach((childIdx, i) => {
          let angle;
          if (count === 1) {
            angle = baseAngle;
          } else {
            // Center the fan: -spread*(count-1)/2 to +spread*(count-1)/2
            const offset = (i - (count - 1) / 2) * fanSpread;
            angle = baseAngle + offset;
          }

          // Avoid the incoming angle (don't go back the way we came)
          if (incomingAngle !== null) {
            const oppositeIncoming = incomingAngle + Math.PI;
            const angleDiff = Math.abs(((angle - oppositeIncoming + Math.PI) % (2 * Math.PI)) - Math.PI);
            if (angleDiff < Math.PI / 8) {
              angle += Math.PI / 6; // nudge away from collision
            }
          }

          allPlacements.push({ childIdx, angle });
        });
      });

      // Check for angle collisions between ALL placements at this node
      // Sort by angle and nudge any that are too close
      allPlacements.sort((a, b) => a.angle - b.angle);
      const minAngleSep = Math.PI / 6; // 30° minimum between children

      for (let i = 1; i < allPlacements.length; i++) {
        const diff = allPlacements[i].angle - allPlacements[i - 1].angle;
        if (diff < minAngleSep) {
          allPlacements[i].angle = allPlacements[i - 1].angle + minAngleSep;
        }
      }

      // Place each child
      const armLen = ARM_LENGTH * Math.pow(SIZE_DECAY, depth);

      allPlacements.forEach(({ childIdx, angle }) => {
        const childX = x + Math.cos(angle) * armLen;
        const childY = y - Math.sin(angle) * armLen; // minus because canvas Y is inverted

        const childNode = nodes[childIdx];
        const style = CONNECTION_STYLE[childNode.role] || CONNECTION_STYLE.unknown;

        // Create connection from parent to child
        connections.push({
          fromId: 'node_' + nodeIdx,
          toId:   'node_' + childIdx,
          type:   style.type,
          color:  blendColors(sNode.color || '#888888', childNode.color || '#888888'),
          weight: style.weight,
        });

        // Recurse
        placeNode(childIdx, childX, childY, depth + 1, angle);
      });
    }

    // Start from root at center
    placeNode(rootIdx, cx, cy, 0, null);

    // ── 3. Handle orphan nodes (not connected to root's tree) ──────────────

    const placedSet = new Set(glyphNodes.map(g => parseInt(g.id.split('_')[1])));
    const orphans = nodes.map((_, i) => i).filter(i => !placedSet.has(i));

    if (orphans.length > 0) {
      // Place orphans in a ring around the main glyph
      const orphanRadius = ARM_LENGTH * 2.5;
      orphans.forEach((orphIdx, i) => {
        const angle = (2 * Math.PI / orphans.length) * i - Math.PI / 2;
        const ox = cx + Math.cos(angle) * orphanRadius;
        const oy = cy - Math.sin(angle) * orphanRadius;
        placeNode(orphIdx, ox, oy, 2, null);
      });
    }

    // ── 4. Scale to fit canvas ──────────────────────────────────────────────

    if (glyphNodes.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
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
        // Center the glyph even if no scaling needed
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
      scaleFactor: 1,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────────────────────────────────────

  window.LayoutEngine = {
    buildGlyphTree,
    blendColors,
    ARM_LENGTH,
    BASE_SIZE,
    DIRECTIONS,
    ROLE_DIRECTION,
  };

}());
