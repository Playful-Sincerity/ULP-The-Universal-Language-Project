/**
 * main.js
 * Application entry point for the 2D Writer.
 *
 * Wires together:
 *   - SemanticEngine (semantic-engine.js)
 *   - LayoutEngine (layout-engine.js)
 *   - Renderer (renderer.js)
 *   - DEMOS (demos.js)
 *
 * Owns: event handling, demo pill injection, breakdown display, resize.
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
  const breakdownEl     = document.getElementById('breakdown');

  // ─────────────────────────────────────────────────────────────────────────────
  // Boot renderer
  // ─────────────────────────────────────────────────────────────────────────────

  const renderer = window.Renderer.create('canvas-container');

  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────

  let currentText = '';
  let isProcessing = false;

  // ─────────────────────────────────────────────────────────────────────────────
  // Populate demo pills
  // ─────────────────────────────────────────────────────────────────────────────

  function populateDemos() {
    if (!window.DEMOS || !window.DEMOS.length) return;

    window.DEMOS.forEach((demo, i) => {
      const pill = document.createElement('button');
      pill.className = 'demo-pill';
      pill.textContent = demo.title;
      pill.dataset.index = i;
      pill.addEventListener('click', () => {
        // Deactivate all pills, activate this one
        demosContainer.querySelectorAll('.demo-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        // Set input and submit
        inputEl.value = demo.text;
        submit(demo.text);
      });
      demosContainer.appendChild(pill);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Semantic breakdown display
  // ─────────────────────────────────────────────────────────────────────────────

  function showBreakdown(nodes) {
    // Clear previous
    breakdownEl.innerHTML = '';
    breakdownEl.classList.remove('visible');

    if (!nodes || !nodes.length) return;

    // Build chips
    nodes.forEach(node => {
      // Skip very small function words for cleaner display
      if (node.shape === 'dot' && node.role === 'connector') return;

      const chip = document.createElement('span');
      chip.className = 'breakdown-word';

      const wordRow = document.createElement('span');
      wordRow.className = 'word-row';

      const dot = document.createElement('span');
      dot.className = 'category-dot';
      dot.style.backgroundColor = node.color;

      const word = document.createElement('span');
      word.className = 'word-text';
      word.textContent = node.word;

      wordRow.appendChild(dot);
      wordRow.appendChild(word);

      const label = document.createElement('span');
      label.className = 'label';
      const catKey = node.categories[0];
      const catInfo = window.CATEGORIES[catKey];
      label.textContent = catInfo ? catInfo.label.split(' / ')[0].toLowerCase() : catKey;

      chip.appendChild(wordRow);
      chip.appendChild(label);
      breakdownEl.appendChild(chip);
    });

    // Fade in after a beat
    requestAnimationFrame(() => {
      breakdownEl.classList.add('visible');
    });
  }

  function hideBreakdown() {
    breakdownEl.classList.remove('visible');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Core pipeline: text → semantic → layout → render
  // ─────────────────────────────────────────────────────────────────────────────

  async function submit(text) {
    text = (text || '').trim();
    if (!text || isProcessing) return;

    currentText = text;
    isProcessing = true;
    hideBreakdown();

    try {
      // Step 1: Semantic analysis (sync first for speed, then async upgrade)
      console.log('[2D Writer] Step 1: Analyzing text:', text);
      let nodes;
      try {
        nodes = window.SemanticEngine.analyzeSync(text);
      } catch (e) {
        console.error('[2D Writer] SemanticEngine.analyzeSync failed:', e);
        isProcessing = false;
        return;
      }
      console.log('[2D Writer] Semantic nodes:', nodes);
      console.log('[2D Writer] Parent indices:', nodes.map(n => n.word + ':' + n.parentIndex + '(' + n.role + ')'));

      if (!nodes || !nodes.length) {
        console.warn('[2D Writer] No semantic nodes produced — aborting.');
        isProcessing = false;
        return;
      }

      // Step 2: Layout
      const canvasW = canvasContainer.offsetWidth || window.innerWidth;
      const canvasH = canvasContainer.offsetHeight || window.innerHeight;
      console.log('[2D Writer] Step 2: Layout', nodes.length, 'nodes into', canvasW, 'x', canvasH);
      let glyphTree;
      try {
        glyphTree = window.LayoutEngine.buildGlyphTree(nodes, canvasW, canvasH);
      } catch (e) {
        console.error('[2D Writer] LayoutEngine.buildGlyphTree failed:', e);
        isProcessing = false;
        return;
      }
      console.log('[2D Writer] GlyphTree:', glyphTree);

      // Step 3: Render
      console.log('[2D Writer] Step 3: Rendering');
      renderer.setGlyphTree(glyphTree);

      // Step 4: Show breakdown
      showBreakdown(nodes);

      // Step 5: Async upgrade (ConceptNet for unknown words) — fire and forget
      // If any nodes get upgraded, re-layout and re-render
      window.SemanticEngine.analyze(text).then(upgradedNodes => {
        // Check if text has changed since we started
        if (text !== currentText) return;

        // Check if any nodes actually changed
        const changed = upgradedNodes.some((n, i) =>
          nodes[i] && n.source !== nodes[i].source
        );

        if (changed) {
          const upgradedTree = window.LayoutEngine.buildGlyphTree(upgradedNodes, canvasW, canvasH);
          renderer.setGlyphTree(upgradedTree);
          showBreakdown(upgradedNodes);
        }
      }).catch(() => {
        // ConceptNet failure — no problem, sync results are fine
      });

    } catch (err) {
      console.error('[2D Writer] Pipeline error:', err);
    } finally {
      isProcessing = false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Event handlers
  // ─────────────────────────────────────────────────────────────────────────────

  // Submit on Enter or button click
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Clear active demo pill since user typed something custom
      demosContainer.querySelectorAll('.demo-pill').forEach(p => p.classList.remove('active'));
      submit(inputEl.value);
    }
  });

  btnEl.addEventListener('click', () => {
    demosContainer.querySelectorAll('.demo-pill').forEach(p => p.classList.remove('active'));
    submit(inputEl.value);
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    renderer.resize();

    // Re-layout current glyph if we have one
    if (currentText) {
      const nodes = window.SemanticEngine.analyzeSync(currentText);
      const canvasW = canvasContainer.offsetWidth || window.innerWidth;
      const canvasH = canvasContainer.offsetHeight || window.innerHeight;
      const tree = window.LayoutEngine.buildGlyphTree(nodes, canvasW, canvasH);
      renderer.setGlyphTree(tree);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialize
  // ─────────────────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────────────────
  // Boot diagnostics
  // ─────────────────────────────────────────────────────────────────────────────

  console.log('[2D Writer] Boot check:');
  console.log('  compromise (window.nlp):', typeof window.nlp);
  console.log('  CATEGORIES:', typeof window.CATEGORIES, window.CATEGORIES ? Object.keys(window.CATEGORIES).length + ' categories' : 'MISSING');
  console.log('  DICTIONARY:', typeof window.DICTIONARY, window.DICTIONARY ? Object.keys(window.DICTIONARY).length + ' words' : 'MISSING');
  console.log('  SemanticEngine:', typeof window.SemanticEngine);
  console.log('  LayoutEngine:', typeof window.LayoutEngine);
  console.log('  Renderer:', typeof window.Renderer);
  console.log('  DEMOS:', typeof window.DEMOS, window.DEMOS ? window.DEMOS.length + ' demos' : 'MISSING');
  console.log('  renderer instance:', renderer);

  populateDemos();

  // Focus input on load
  inputEl.focus();

  console.log('[2D Writer] Ready. Type a concept or click a demo.');

})();
