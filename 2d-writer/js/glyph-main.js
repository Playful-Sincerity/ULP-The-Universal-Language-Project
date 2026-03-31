/**
 * glyph-main.js
 * Entry point for the recursive glyph system.
 *
 * Wires together:
 *   - GlyphEngine (glyph-engine.js)  — parse notation, generate random
 *   - GlyphLayout  (glyph-layout.js) — position nodes on canvas
 *   - Renderer      (renderer.js)    — animate the glyph
 *   - GLYPH_DEMOS   (glyph-demos.js) — curated presets
 *
 * Owns: event handling, demo pill injection, notation display, resize.
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // DOM refs
  // ─────────────────────────────────────────────────────────────────────────────

  const canvasContainer = document.getElementById('canvas-container');
  const demosContainer  = document.getElementById('demos');
  const inputEl         = document.getElementById('text-input');
  const btnEl           = document.getElementById('generate-btn');
  const notationDisplay = document.getElementById('notation-display');

  // ─────────────────────────────────────────────────────────────────────────────
  // Boot renderer
  // ─────────────────────────────────────────────────────────────────────────────

  const renderer = window.Renderer.create('canvas-container');

  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────

  let currentNotation = '';
  let currentSpec     = null;

  // ─────────────────────────────────────────────────────────────────────────────
  // Core pipeline: notation/spec → layout → render
  // ─────────────────────────────────────────────────────────────────────────────

  function renderGlyph(spec, notation) {
    if (!spec) return;

    currentSpec     = spec;
    currentNotation = notation || '';

    const canvasW = canvasContainer.offsetWidth  || window.innerWidth;
    const canvasH = canvasContainer.offsetHeight || window.innerHeight;

    const glyphTree = window.GlyphLayout.build(spec, canvasW, canvasH);
    renderer.setGlyphTree(glyphTree);

    // Update notation display
    if (notationDisplay) {
      const displayText = notation || window.GlyphEngine.toNotation(spec);
      notationDisplay.textContent = displayText || '●';
      notationDisplay.classList.add('visible');
    }
  }

  function submitInput(input) {
    const trimmed = (input || '').trim();
    if (!trimmed) {
      renderGlyph(window.GlyphEngine.makeNode('dot', '#FFFFFF'), '');
      return;
    }

    if (window.GlyphEngine.isNotation(trimmed)) {
      // Notation mode: parse directly
      const spec = window.GlyphEngine.parse(trimmed);
      renderGlyph(spec, trimmed);
    } else {
      // Text mode: convert characters to glyph
      const spec = window.GlyphEngine.fromText(trimmed);
      const notation = window.GlyphEngine.toNotation(spec);
      renderGlyph(spec, notation);
    }
  }

  function submitRandom() {
    const spec = window.GlyphEngine.random();
    const notation = window.GlyphEngine.toNotation(spec);
    renderGlyph(spec, notation);
    // Show the notation in the input so user can see/edit it
    if (inputEl) inputEl.value = notation;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Populate demo pills
  // ─────────────────────────────────────────────────────────────────────────────

  function populateDemos() {
    if (!window.GLYPH_DEMOS || !window.GLYPH_DEMOS.length) return;

    window.GLYPH_DEMOS.forEach((demo, i) => {
      const pill = document.createElement('button');
      pill.className = 'demo-pill';
      pill.textContent = demo.title;
      pill.dataset.index = i;
      pill.addEventListener('click', () => {
        // Deactivate all pills, activate this one
        demosContainer.querySelectorAll('.demo-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        if (demo.notation === null) {
          // "random" demo
          submitRandom();
        } else {
          inputEl.value = demo.notation;
          submitInput(demo.notation);
        }
      });
      demosContainer.appendChild(pill);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Event handlers
  // ─────────────────────────────────────────────────────────────────────────────

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      demosContainer.querySelectorAll('.demo-pill').forEach(p => p.classList.remove('active'));
      submitInput(inputEl.value);
    }
  });

  btnEl.addEventListener('click', () => {
    demosContainer.querySelectorAll('.demo-pill').forEach(p => p.classList.remove('active'));
    submitInput(inputEl.value);
  });

  // Re-layout on resize
  window.addEventListener('resize', () => {
    renderer.resize();
    if (currentSpec) {
      const canvasW = canvasContainer.offsetWidth  || window.innerWidth;
      const canvasH = canvasContainer.offsetHeight || window.innerHeight;
      const tree = window.GlyphLayout.build(currentSpec, canvasW, canvasH);
      renderer.setGlyphTree(tree);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialize
  // ─────────────────────────────────────────────────────────────────────────────

  console.log('[Glyph] Boot check:');
  console.log('  GlyphEngine:', typeof window.GlyphEngine);
  console.log('  GlyphLayout:', typeof window.GlyphLayout);
  console.log('  Renderer:',    typeof window.Renderer);
  console.log('  GLYPH_DEMOS:', typeof window.GLYPH_DEMOS,
    window.GLYPH_DEMOS ? window.GLYPH_DEMOS.length + ' demos' : 'MISSING');

  populateDemos();
  inputEl.placeholder = 'Type anything — words become glyphs...';
  inputEl.focus();

  console.log('[Glyph] Ready.');

})();
