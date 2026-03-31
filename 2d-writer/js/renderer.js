/**
 * renderer.js
 * The visual payoff of the ULP 2D Writer.
 *
 * Receives a GlyphTree from LayoutEngine and animates it into existence —
 * shapes crystallizing from the center outward, glowing in their semantic colors,
 * then breathing gently as long as they live.
 *
 * State machine:
 *   IDLE → GROWING → ALIVE → FADING → GROWING
 *
 * Uses p5.js instance mode. Transparent background (clear() every frame).
 * Requires p5.js loaded globally before this file.
 *
 * Public API:
 *   window.Renderer.create(containerId) → rendererInstance
 *   rendererInstance.setGlyphTree(glyphTree)
 *   rendererInstance.resize()
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // Animation constants
  // ─────────────────────────────────────────────────────────────────────────────

  // How fast each node grows. At 60fps, 0.035/frame ≈ 29 frames ≈ ~480ms per node.
  const GROWTH_RATE      = 0.035;

  // When the current tier reaches this progress, the next tier may begin.
  const SIBLING_THRESHOLD = 0.70;

  // Connections start drawing when their source node reaches this growth progress.
  const CONNECTION_START  = 0.50;

  // How fast masterAlpha decreases during FADING (~17 frames ≈ 280ms).
  const FADE_RATE         = 0.06;

  // Breathing / alive animation
  const BREATHE_PERIOD    = 4200;   // ms for one full breath cycle
  const BREATHE_DEPTH     = 0.08;   // ±8% size oscillation
  const WOBBLE_AMPLITUDE  = 1.5;    // ±px of floating drift
  const WOBBLE_SPEED      = 0.00025; // Perlin noise time scale

  // Glow parameters (kept moderate — Canvas2D shadowBlur is GPU-expensive)
  const GLOW_OUTER_BLUR   = 14;
  const GLOW_OUTER_ALPHA  = 0.30;
  const GLOW_INNER_BLUR   = 6;
  const GLOW_INNER_ALPHA  = 1.0;
  const CONN_GLOW_BLUR    = 3;

  // ─────────────────────────────────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Parse a hex color string "#RRGGBB" into [r, g, b] (0–255).
   * Returns [180, 180, 180] on failure so we degrade gracefully.
   */
  function hexToRGB(hex) {
    if (!hex || hex.length < 7) return [180, 180, 180];
    const clean = hex.replace('#', '');
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
    ];
  }

  /**
   * Ease-out cubic: fast in, settles gently.
   * t must be in [0, 1].
   */
  function easeOutCubic(t) {
    const c = Math.min(Math.max(t, 0), 1);
    return 1 - Math.pow(1 - c, 3);
  }

  /**
   * Quadratic bezier interpolation for a single axis.
   */
  function quadBezier(p0, p1, p2, t) {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  }

  /**
   * Regular polygon helper. Rotation = 0 places the first vertex to the right.
   */
  function drawPolygon(p, cx, cy, radius, sides, rotation) {
    const rot = rotation != null ? rotation : 0;
    p.beginShape();
    for (let i = 0; i < sides; i++) {
      const angle = (p.TWO_PI / sides) * i + rot;
      p.vertex(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    }
    p.endShape(p.CLOSE);
  }

  /**
   * A stable numeric seed from a node id string, used to seed Perlin offsets
   * so each node drifts independently.
   */
  function idToSeed(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) {
      h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(h) / 0xffffffff;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Glow helpers
  // ─────────────────────────────────────────────────────────────────────────────

  // shadowBlur disabled — Canvas2D shadow is extremely GPU-expensive.
  // Bright shapes on dark background are already luminous.
  function setGlow() {}
  function clearGlow() {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Word labels
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Draw a soft word label beneath the node.
   * Only called after resetting blendMode to BLEND so text compositing works correctly.
   */
  function drawLabel(p, node, alpha, wobbleX, wobbleY) {
    if (!node.word || alpha <= 0) return;
    const labelAlpha = alpha * 0.30;
    p.fill(255, 255, 255, labelAlpha);
    p.noStroke();
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(9);
    p.textFont('monospace');
    p.text(node.word, node.x + wobbleX, node.y + node.size + 5 + wobbleY);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Idle-state invitation dot
  // ─────────────────────────────────────────────────────────────────────────────

  function drawIdleDot(p, millis) {
    const t     = millis * 0.001;
    const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 0.25); // ~4s cycle
    const r     = 4 + pulse * 3;
    const alpha = 0.28 + pulse * 0.38;
    const gAlpha = 0.55 + pulse * 0.35;
    const blur   = 18 + pulse * 14;

    const cx = p.width / 2;
    const cy = p.height / 2;

    setGlow(p, 255, 255, 255, gAlpha, blur);
    p.noStroke();
    p.fill(255, 255, 255, alpha);
    p.circle(cx, cy, r * 2);
    clearGlow(p);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Main sketch factory
  // ─────────────────────────────────────────────────────────────────────────────

  function createRenderer(containerId) {
    const containerEl = document.getElementById(containerId);
    if (!containerEl) {
      console.error('[Renderer] Container not found:', containerId);
      return null;
    }

    // Public handle that main.js receives
    const handle = {
      _p5: null,
      setGlyphTree: null,
      resize: null,
    };

    const sketch = (p) => {

      // ── State ──────────────────────────────────────────────────────────────

      let state        = 'IDLE';   // 'IDLE' | 'GROWING' | 'ALIVE' | 'FADING'
      let currentTree  = null;
      let nextTree     = null;
      let masterAlpha  = 1.0;
      let growthProgress = [];     // number[], one per node (0→1)
      let aliveTime    = 0;        // ms since growth completed
      let glowScale    = 1.0;      // reduced for large trees

      // ── Setup ──────────────────────────────────────────────────────────────

      p.setup = function () {
        const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
        cnv.parent(containerEl);
        cnv.style('background', 'transparent');
        p.colorMode(p.RGB, 255, 255, 255, 1.0);
        p.frameRate(30);
        p.smooth();
      };

      // ── Window resize ──────────────────────────────────────────────────────

      p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      // ── Public API wired onto the handle ──────────────────────────────────

      handle._p5 = p;

      handle.resize = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      handle.setGlyphTree = function (glyphTree) {
        if (!glyphTree || !glyphTree.nodes || glyphTree.nodes.length === 0) return;

        if (state === 'IDLE') {
          // No fade needed — go straight to growing
          currentTree    = glyphTree;
          growthProgress = new Array(glyphTree.nodes.length).fill(0);
          masterAlpha    = 1.0;
          glowScale      = computeGlowScale(glyphTree.nodes.length);
          state          = 'GROWING';
        } else if (state === 'ALIVE' || state === 'GROWING') {
          // Queue the new tree and fade out the current one
          nextTree    = glyphTree;
          masterAlpha = 1.0;
          state       = 'FADING';
        } else if (state === 'FADING') {
          // Replace the queued tree — latest wins
          nextTree = glyphTree;
        }
      };

      // ── Growth helpers ────────────────────────────────────────────────────

      /**
       * Reduce glow intensity for large trees to maintain framerate.
       */
      function computeGlowScale(nodeCount) {
        if (nodeCount > 8) return Math.max(0.3, 1 - (nodeCount - 8) / 40);
        return 1.0;
      }

      /**
       * Advance growthProgress for all nodes each frame.
       *
       * Tiers (grouped by growthOrder) unlock sequentially:
       * a tier starts when the previous tier's minimum progress >= SIBLING_THRESHOLD.
       *
       * @param {number} dt - delta time in ms
       */
      function updateGrowth(dt) {
        if (!currentTree) return;

        const nodes   = currentTree.nodes;
        const speedFactor = dt / 16.667; // normalize to 60fps

        // Build a map of growthOrder → [indices]
        const tiers = {};
        nodes.forEach((node, i) => {
          const order = node.growthOrder;
          if (!tiers[order]) tiers[order] = [];
          tiers[order].push(i);
        });

        const sortedOrders = Object.keys(tiers).map(Number).sort((a, b) => a - b);

        for (let ti = 0; ti < sortedOrders.length; ti++) {
          const order   = sortedOrders[ti];
          const indices = tiers[order];

          // Check if the PREVIOUS tier has all nodes >= SIBLING_THRESHOLD
          if (ti > 0) {
            const prevOrder   = sortedOrders[ti - 1];
            const prevIndices = tiers[prevOrder];
            const prevMinProgress = Math.min(...prevIndices.map(i => growthProgress[i]));
            if (prevMinProgress < SIBLING_THRESHOLD) break; // don't advance this or later tiers
          }

          // Advance this tier
          indices.forEach(i => {
            if (growthProgress[i] < 1.0) {
              growthProgress[i] = Math.min(1.0, growthProgress[i] + GROWTH_RATE * speedFactor);
            }
          });
        }
      }

      function growthComplete() {
        if (!currentTree) return true;
        return growthProgress.every(v => v >= 1.0);
      }

      // ── Alive-state wobble ────────────────────────────────────────────────

      /**
       * Compute per-node wobble offsets using Perlin noise seeded by node id.
       * Returns { [nodeId]: { x, y } }.
       */
      function computeWobbles(nodes, aliveMs) {
        const wobbles = {};
        nodes.forEach(node => {
          const seed  = idToSeed(node.id);
          const seedX = seed * 100;
          const seedY = seed * 200 + 50;
          const t     = aliveMs * WOBBLE_SPEED;
          wobbles[node.id] = {
            x: (p.noise(seedX, t) - 0.5) * 2 * WOBBLE_AMPLITUDE,
            y: (p.noise(seedY, t) - 0.5) * 2 * WOBBLE_AMPLITUDE,
          };
        });
        return wobbles;
      }

      /**
       * Global breathing scale for the ALIVE state.
       * Very subtle sine oscillation so the whole glyph inhales and exhales.
       */
      function computeBreathe(aliveMs) {
        return 1.0 + BREATHE_DEPTH * Math.sin((aliveMs / BREATHE_PERIOD) * Math.PI * 2);
      }

      // ── Connection progress ────────────────────────────────────────────────

      /**
       * For a given connection, determine how far it should be drawn.
       * A connection "belongs" to its target node: it starts growing once the source
       * node passes CONNECTION_START, completing when the target node is fully grown.
       *
       * Returns connT in [0, 1].
       */
      function getConnProgress(conn, nodeIndexById) {
        const fromIdx = nodeIndexById[conn.fromId];
        const toIdx   = nodeIndexById[conn.toId];
        if (fromIdx === undefined || toIdx === undefined) return 0;

        const sourceProgress = growthProgress[fromIdx];
        const targetProgress = growthProgress[toIdx];

        if (sourceProgress < CONNECTION_START) return 0;

        // Connection progress tracks the target node's own growth progress.
        // The gate above ensures we only draw once the source node is well-formed.
        return Math.min(1.0, targetProgress);
      }

      // ── Main draw routine ─────────────────────────────────────────────────

      /**
       * Draw the entire current glyph with all nodes and connections.
       * Connections drawn first (behind nodes). Nodes drawn second.
       * Labels drawn last (after resetting to BLEND mode).
       *
       * @param {number} alpha    - master alpha (1.0 normally, decreasing during fade)
       * @param {number} breathe  - breathing scale (1.0 during GROWING)
       * @param {object} wobbles  - per-node wobble offsets (empty during GROWING)
       */
      function drawGlyph(alpha, breathe, wobbles) {
        if (!currentTree || alpha <= 0) return;

        const { nodes, connections } = currentTree;
        const safeWobbles = wobbles || {};

        // Build nodeId → index map for fast connection lookup
        const nodeIndexById = {};
        nodes.forEach((node, i) => { nodeIndexById[node.id] = i; });

        // ── Pass 1: Draw connections (behind nodes) ────────────────────────
        if (connections && connections.length > 0) {
          connections.forEach(conn => {
            const fromNode = nodes.find(n => n.id === conn.fromId);
            const toNode   = nodes.find(n => n.id === conn.toId);
            if (!fromNode || !toNode) return;

            const connT = getConnProgress(conn, nodeIndexById);
            if (connT <= 0) return;

            drawConnectionScaled(p, conn, fromNode, toNode, connT, alpha, safeWobbles, 0);
          });
        }

        // ── Pass 2: Draw nodes ────────────────────────────────────────────
        nodes.forEach((node, i) => {
          const rawT = growthProgress[i];
          if (rawT <= 0) return;

          // Skip nodes entirely off the visible canvas (performance)
          const wx = safeWobbles[node.id] ? safeWobbles[node.id].x : 0;
          const wy = safeWobbles[node.id] ? safeWobbles[node.id].y : 0;
          const px = node.x + wx;
          const py = node.y + wy;
          if (px < -node.size || px > p.width + node.size ||
              py < -node.size || py > p.height + node.size) return;

          drawNodeScaled(p, node, rawT, alpha, breathe, wx, wy);
        });

        // NOTE: Labels are NOT drawn here. They must be drawn after switching
        // blendMode back to BLEND so text compositing works correctly.
        // The caller handles this via drawLabelsOnly().
      }

      // ── Scaled-glow versions of node/connection draw ──────────────────────
      // These take explicit blur values so the caller can scale them for large trees.

      function drawNodeScaled(p, node, rawT, alpha, breathe, wobbleX, wobbleY) {
        const t = easeOutCubic(rawT);
        if (t <= 0) return;

        const [R, G, B] = hexToRGB(node.color);
        const r = node.size * t * breathe;

        const px = node.x + wobbleX;
        const py = node.y + wobbleY;
        const rot = node.rotation || 0;

        // Single pass — no shadow, no halo
        _drawNodeShapeAt(p, node.shape, px, py, r, R, G, B, alpha, 0, rot);
      }

      function _drawNodeShapeAt(p, shape, px, py, r, R, G, B, alpha, glowBlur, rotation) {
        p.push();
        p.translate(px, py);
        if (rotation) p.rotate(rotation);
        setGlow(p, R, G, B, Math.min(alpha, 1.0), glowBlur);
        p.strokeWeight(1.8);
        p.stroke(R, G, B, Math.min(alpha, 1.0));
        p.noFill();

        switch (shape) {
          case 'dot':
            p.fill(R, G, B, Math.min(alpha, 1.0));
            p.noStroke();
            p.circle(0, 0, r * 2);
            break;

          case 'line':
            // Perpendicular cross-mark. Vertical by default; rotation aligns
            // it perpendicular to the arm direction (like a serif or stop mark).
            p.strokeWeight(2.5);
            p.noFill();
            p.line(0, -r, 0, r);
            break;

          case 'curve':
            // Arc opening upward by default; rotation swings it with the arm.
            p.noFill();
            p.strokeWeight(2.0);
            p.arc(0, 0, r * 2, r * 2, Math.PI, Math.PI * 2);
            break;

          case 'triangle':
            // Points right by default; rotation aims it along the arm direction.
            drawPolygon(p, 0, 0, r, 3, 0);
            break;

          case 'diamond':
            // Filled rhombus, vertex pointing up. Rotationally distinctive.
            p.fill(R, G, B, Math.min(alpha, 1.0));
            drawPolygon(p, 0, 0, r, 4, -Math.PI / 2);
            break;

          case 'square':
            drawPolygon(p, 0, 0, r, 4, Math.PI / 4);
            break;

          case 'pentagon':
            drawPolygon(p, 0, 0, r, 5, -Math.PI / 2);
            break;

          case 'hexagon':
            drawPolygon(p, 0, 0, r, 6, 0);
            break;

          default:
            p.fill(R, G, B, Math.min(alpha, 1.0));
            p.noStroke();
            p.circle(0, 0, r * 2);
            break;
        }

        clearGlow(p);
        p.pop();
      }

      function drawConnectionScaled(p, conn, from, to, connT, alpha, wobbles, connBlur) {
        if (connT <= 0 || alpha <= 0) return;

        const progress = easeOutCubic(Math.min(connT, 1.0));
        const [R, G, B] = hexToRGB(conn.color);
        const connAlpha = alpha * 0.65;

        const fw = wobbles[from.id] || { x: 0, y: 0 };
        const tw = wobbles[to.id]   || { x: 0, y: 0 };
        const x1 = from.x + fw.x;
        const y1 = from.y + fw.y;
        const x2 = to.x   + tw.x;
        const y2 = to.y   + tw.y;

        p.push();

        switch (conn.type) {
          case 'solid': {
            setGlow(p, R, G, B, connAlpha, connBlur);
            p.stroke(R, G, B, connAlpha);
            p.strokeWeight(Math.max(0.8, (conn.weight || 1.0) * 1.5));
            p.noFill();
            p.line(x1, y1, p.lerp(x1, x2, progress), p.lerp(y1, y2, progress));
            clearGlow(p);
            break;
          }

          case 'dashed': {
            setGlow(p, R, G, B, connAlpha * 0.7, connBlur);
            p.stroke(R, G, B, connAlpha * 0.7);
            p.strokeWeight(Math.max(0.7, (conn.weight || 0.8) * 1.2));
            p.noFill();
            const SEGS = 8;
            for (let i = 0; i < SEGS; i++) {
              const t0 = i / SEGS;
              if (t0 > progress) break;
              if (i % 2 !== 0) continue;
              const t1 = Math.min((i + 0.65) / SEGS, progress);
              p.line(
                p.lerp(x1, x2, t0), p.lerp(y1, y2, t0),
                p.lerp(x1, x2, t1), p.lerp(y1, y2, t1)
              );
            }
            clearGlow(p);
            break;
          }

          case 'dotted': {
            setGlow(p, R, G, B, connAlpha * 0.6, connBlur * 0.7);
            p.noStroke();
            p.fill(R, G, B, connAlpha * 0.6);
            const DOTS = 7;
            for (let i = 0; i <= DOTS; i++) {
              const dt = i / DOTS;
              if (dt > progress) break;
              p.circle(p.lerp(x1, x2, dt), p.lerp(y1, y2, dt), 2.5);
            }
            clearGlow(p);
            break;
          }

          case 'curved': {
            const mx  = (x1 + x2) / 2;
            const my  = (y1 + y2) / 2;
            const dx  = x2 - x1;
            const dy  = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const cx  = mx - (dy / len) * 28;
            const cy  = my + (dx / len) * 28;
            const endT = progress;
            const STEPS = 24;

            setGlow(p, R, G, B, connAlpha * 0.8, connBlur);
            p.stroke(R, G, B, connAlpha * 0.8);
            p.strokeWeight(Math.max(0.8, (conn.weight || 1.0) * 1.4));
            p.noFill();
            p.beginShape();
            for (let s = 0; s <= STEPS; s++) {
              const st = (s / STEPS) * endT;
              p.vertex(quadBezier(x1, cx, x2, st), quadBezier(y1, cy, y2, st));
            }
            p.endShape();
            clearGlow(p);
            break;
          }

          default: {
            setGlow(p, R, G, B, connAlpha, connBlur);
            p.stroke(R, G, B, connAlpha);
            p.strokeWeight(1.2);
            p.noFill();
            p.line(x1, y1, p.lerp(x1, x2, progress), p.lerp(y1, y2, progress));
            clearGlow(p);
            break;
          }
        }

        p.pop();
      }

      // ── Main draw loop ────────────────────────────────────────────────────

      p.draw = function () {
        p.clear(); // transparent every frame — never use background()

        const dt = p.deltaTime; // ms since last frame, provided by p5

        if (state === 'IDLE') {
          // Draw an inviting pulsing dot at the center
          p.blendMode(p.ADD);
          p.push();
          drawIdleDot(p, p.millis());
          p.pop();
          p.blendMode(p.BLEND);
          return;
        }

        if (state === 'GROWING') {
          updateGrowth(dt);

          p.blendMode(p.ADD);
          drawGlyph(masterAlpha, 1.0, {});

          p.blendMode(p.BLEND);

          if (growthComplete()) {
            state    = 'ALIVE';
            aliveTime = 0;
          }
          return;
        }

        if (state === 'ALIVE') {
          aliveTime += dt;
          const breathe = computeBreathe(aliveTime);
          const wobbles = computeWobbles(currentTree.nodes, aliveTime);

          p.blendMode(p.ADD);
          drawGlyphAlive(masterAlpha, breathe, wobbles);
          p.blendMode(p.BLEND);

          return;
        }

        if (state === 'FADING') {
          masterAlpha = Math.max(0, masterAlpha - FADE_RATE);

          p.blendMode(p.ADD);
          drawGlyph(masterAlpha, 1.0, {});

          p.blendMode(p.BLEND);

          if (masterAlpha <= 0) {
            // Transition to new tree
            if (nextTree) {
              currentTree    = nextTree;
              nextTree       = null;
              growthProgress = new Array(currentTree.nodes.length).fill(0);
              glowScale      = computeGlowScale(currentTree.nodes.length);
            }
            masterAlpha = 1.0;
            aliveTime   = 0;
            state       = currentTree ? 'GROWING' : 'IDLE';
          }
          return;
        }
      };

      // ── Alive draw (connections + nodes together with wobble) ─────────────

      /**
       * Draw the full glyph in ALIVE state.
       * Wobble and breathing are applied per-node.
       * Labels are drawn separately after blendMode reset.
       */
      function drawGlyphAlive(alpha, breathe, wobbles) {
        if (!currentTree || alpha <= 0) return;

        const { nodes, connections } = currentTree;

        const nodeIndexById = {};
        nodes.forEach((node, i) => { nodeIndexById[node.id] = i; });

        // Connections first
        if (connections && connections.length > 0) {
          connections.forEach(conn => {
            const fromNode = nodes.find(n => n.id === conn.fromId);
            const toNode   = nodes.find(n => n.id === conn.toId);
            if (!fromNode || !toNode) return;
            drawConnectionScaled(p, conn, fromNode, toNode, 1.0, alpha, wobbles, 0);
          });
        }

        // Nodes with breathing
        nodes.forEach(node => {
          const wx = wobbles[node.id] ? wobbles[node.id].x : 0;
          const wy = wobbles[node.id] ? wobbles[node.id].y : 0;
          drawNodeScaled(p, node, 1.0, alpha, breathe, wx, wy);
        });
      }

      /**
       * Draw only the word labels in BLEND mode (called after ADD pass).
       * Must be called with a translate to canvas center already active.
       */
      function drawLabelsOnly(alpha, wobbles) {
        if (!currentTree || alpha <= 0) return;
        currentTree.nodes.forEach((node, i) => {
          const rawT = growthProgress[i] !== undefined ? growthProgress[i] : 1.0;
          if (rawT < 0.8) return;
          const wx = wobbles && wobbles[node.id] ? wobbles[node.id].x : 0;
          const wy = wobbles && wobbles[node.id] ? wobbles[node.id].y : 0;
          drawLabel(p, node, alpha, wx, wy);
        });
      }

    }; // end sketch

    // Instantiate p5 in instance mode, mounted to our container
    // eslint-disable-next-line no-undef
    new p5(sketch, containerEl);

    return handle;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────────

  window.Renderer = {
    /**
     * Create a renderer instance mounted to the given container element id.
     *
     * @param  {string} containerId - id of the DOM element to mount into
     * @returns {{ setGlyphTree: function, resize: function }}
     */
    create(containerId) {
      return createRenderer(containerId);
    },
  };

})();
