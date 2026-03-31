/**
 * semantic-engine.js
 * Core processing pipeline for the 2D Writer.
 *
 * Takes English text → outputs SemanticNode[] for the layout engine.
 *
 * Public API (window.SemanticEngine):
 *   analyzeSync(text) → SemanticNode[]     synchronous, dictionary-only, real-time preview
 *   analyze(text)     → Promise<SemanticNode[]>  async, upgrades unknowns via ConceptNet
 *   CATEGORIES        → re-export from dictionary.js
 *
 * Depends on (must be loaded before this file):
 *   - window.nlp         (compromise.js, CDN)
 *   - window.CATEGORIES  (dictionary.js)
 *   - window.DICTIONARY  (dictionary.js)
 *   - window.ConceptNet  (conceptnet.js)
 *
 * SemanticNode output contract (unified interface from plan.md):
 * {
 *   word:          string,    // original word text
 *   pos:           string,    // "Noun"|"Verb"|"Adjective"|"Adverb"|"Preposition"|
 *                             //  "Conjunction"|"Determiner"|"Pronoun"|"Unknown"
 *   role:          string,    // "subject"|"verb"|"object"|"modifier"|"connector"|"context"|"unknown"
 *   categories:    string[],  // 1–3 keys from CATEGORIES
 *   color:         string,    // hex of primary category
 *   colors:        string[],  // hex array of all categories
 *   shape:         string,    // "dot"|"line"|"curve"|"triangle"|"square"|"pentagon"|"hexagon"
 *   weight:        number,    // 0.5–2.0
 *   parentIndex:   number,    // index of parent node (-1 for root)
 *   sentenceIndex: number,    // which sentence (0-based)
 *   source:        string,    // "dictionary"|"conceptnet"|"pos-inferred"
 *   confidence:    number,    // 0.0–1.0
 * }
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // Constants & helpers
  // ─────────────────────────────────────────────────────────────────────────────

  // Shape tier ordered by complexity: index = tier rank (0 = simplest)
  const SHAPE_TIERS = ['dot', 'line', 'curve', 'triangle', 'square', 'pentagon', 'hexagon'];

  // Clamp a tier index to the valid range
  function clampTier(idx) {
    return Math.max(0, Math.min(SHAPE_TIERS.length - 1, idx));
  }

  // Move a shape name up or down the tier ladder by `delta` steps
  function bumpShape(shape, delta) {
    const idx = SHAPE_TIERS.indexOf(shape);
    if (idx === -1) return shape; // unknown shape — leave unchanged
    return SHAPE_TIERS[clampTier(idx + delta)];
  }

  // Fallback color for words with no recognized category
  const UNKNOWN_COLOR = '#888888';

  // Resolve hex color(s) from a categories array
  function resolveColors(categories) {
    const cats = window.CATEGORIES;
    return categories.map(k => (cats[k] ? cats[k].color : UNKNOWN_COLOR));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POS mapping: compromise.js tag names → our coarser 9-value set
  // compromise's .json() tags are an object like { Noun: true, Singular: true }
  // We pick the most specific match in priority order.
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Map a compromise term's tags object to our canonical POS string.
   * @param {object} tags  e.g. { Noun: true, Singular: true }
   * @returns {string}
   */
  function tagsToPos(tags) {
    if (!tags || typeof tags !== 'object') return 'Unknown';

    // Check in priority order (most specific first)
    if (tags.Pronoun || tags.PersonalPronoun || tags.ReflexivePronoun) return 'Pronoun';
    if (tags.Determiner || tags.Article)                               return 'Determiner';
    if (tags.Preposition || tags.Locative)                            return 'Preposition';
    if (tags.Conjunction || tags.Coordinating || tags.Subordinating)  return 'Conjunction';
    if (tags.Adverb || tags.Comparative || tags.Superlative && tags.Adverb) return 'Adverb';
    if (tags.Adjective)                                               return 'Adjective';
    if (tags.Verb || tags.Infinitive || tags.Gerund || tags.PastTense || tags.PresentTense || tags.Modal) return 'Verb';
    if (tags.Noun || tags.Singular || tags.Plural || tags.ProperNoun) return 'Noun';

    return 'Unknown';
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Shape selection — 4-rule cascade (spec §Shape Selection Logic)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Resolve the shape for a word given its POS, categories, and any dictionary override.
   *
   * Rule 1: POS-first defaults
   * Rule 2: Category overrides (applied on top of POS default)
   * Rule 3: Multi-category escalation
   * Rule 4: Dictionary explicit override (takes precedence over all)
   *
   * @param {string}   pos            Canonical POS string
   * @param {string[]} categories     Resolved category keys
   * @param {string|undefined} dictShape  Shape from dictionary entry (may be undefined)
   * @returns {string}
   */
  function resolveShape(pos, categories, dictShape) {
    // ── Rule 1: POS-first defaults ──────────────────────────────────────────
    let shape;
    switch (pos) {
      case 'Determiner': shape = 'dot';      break;
      case 'Preposition': shape = 'line';    break;
      case 'Conjunction': shape = 'line';    break;
      case 'Adverb':      shape = 'curve';   break;
      case 'Adjective':   shape = 'curve';   break;
      case 'Pronoun':     shape = 'triangle'; break;
      case 'Verb':
        // Concrete actions → square; state/abstract → pentagon
        // We'll default to square here; categories may bump it.
        shape = 'square';
        break;
      case 'Noun':
        // Concrete nouns → square; abstract (determined by category) → hexagon
        shape = 'square';
        break;
      case 'Unknown':
      default:
        shape = 'dot';
        break;
    }

    // ── Rule 2: Category overrides ──────────────────────────────────────────
    // These are applied cumulatively; later rules may move the result further.

    // existence category → bump DOWN one tier (more atomic)
    if (categories.includes('existence') && categories.length === 1) {
      shape = 'dot';
    } else if (categories.includes('existence') && pos === 'Noun') {
      shape = bumpShape(shape, -1);
    }

    // relation category → force line or curve (it IS a connector)
    if (categories.includes('relation') && (pos === 'Preposition' || pos === 'Conjunction')) {
      shape = 'line';
    }

    // nature category → bump shape to pentagon minimum
    if (categories.includes('nature')) {
      const tier = SHAPE_TIERS.indexOf(shape);
      if (tier < SHAPE_TIERS.indexOf('pentagon')) {
        shape = 'pentagon';
      }
    }

    // thought or expression + Noun → push to hexagon (abstract concept)
    if ((categories.includes('thought') || categories.includes('expression')) && pos === 'Noun') {
      shape = 'hexagon';
    }

    // Verb with abstract categories (thought, time, emotion) → pentagon (living process)
    if (pos === 'Verb' && (
      categories.includes('thought') ||
      categories.includes('time') ||
      categories.includes('emotion')
    )) {
      shape = 'pentagon';
    }

    // ── Rule 3: Multi-category escalation ──────────────────────────────────
    if (categories.length >= 3) {
      shape = bumpShape(shape, 1);
    }
    // Single existence → dot (already handled above, but enforce here too)
    if (categories.length === 1 && categories[0] === 'existence') {
      shape = 'dot';
    }

    // ── Rule 4: Dictionary explicit override ────────────────────────────────
    // Comes last and wins over everything.
    if (dictShape && SHAPE_TIERS.includes(dictShape)) {
      shape = dictShape;
    }

    return shape;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POS-inferred category defaults
  // Used when a word is not in the dictionary (analyzeSync path).
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Derive default categories from POS alone.
   * This is the fallback when neither the dictionary nor ConceptNet has the word.
   * @param {string} pos
   * @returns {string[]}
   */
  function posToDefaultCategories(pos) {
    switch (pos) {
      case 'Verb':        return ['action'];
      case 'Noun':        return ['existence'];
      case 'Adjective':   return ['quality'];
      case 'Adverb':      return ['quality'];
      case 'Preposition': return ['relation'];
      case 'Conjunction': return ['relation'];
      case 'Determiner':  return ['existence'];
      case 'Pronoun':     return ['existence'];
      case 'Unknown':
      default:            return ['existence'];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Weight calculation
  // Formula from spec: 1.0 + (categories.length - 1) * 0.15 + (role === "subject" ? 0.2 : 0)
  // ─────────────────────────────────────────────────────────────────────────────

  function calculateWeight(categories, role) {
    const catBonus  = (categories.length - 1) * 0.15;
    const roleBonus = (role === 'subject') ? 0.2 : 0;
    return Math.round((1.0 + catBonus + roleBonus) * 1000) / 1000; // round to 3dp
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Normalize a word for dictionary lookup
  // Uses compromise when available; falls back to lowercase.
  // ─────────────────────────────────────────────────────────────────────────────

  function normalizeWord(raw) {
    if (!raw) return '';
    return raw.toLowerCase().trim();
  }

  /**
   * Try to find a word in the dictionary, using basic stemming fallbacks.
   * Returns the dictionary entry or undefined.
   */
  function lookupDictionary(normalized) {
    const dict = window.DICTIONARY;
    if (!dict) return undefined;

    // Direct match
    if (dict[normalized]) return dict[normalized];

    // Basic suffix stripping (ordered by specificity)
    const stems = [
      normalized.replace(/ies$/, 'y'),      // carries → carry
      normalized.replace(/ing$/, ''),        // building → build
      normalized.replace(/ing$/, 'e'),       // loving → love
      normalized.replace(/tion$/, 't'),      // connection → connect
      normalized.replace(/ness$/, ''),       // darkness → dark
      normalized.replace(/ly$/, ''),         // quietly → quiet
      normalized.replace(/ed$/, ''),         // unseen → unse... no
      normalized.replace(/ed$/, 'e'),        // loved → love
      normalized.replace(/er$/, ''),         // greater → great
      normalized.replace(/est$/, ''),        // oldest → old
      normalized.replace(/s$/, ''),          // grows → grow
      normalized.replace(/n$/, ''),          // known → know (kno... no)
    ];

    for (const stem of stems) {
      if (stem !== normalized && dict[stem]) return dict[stem];
    }

    return undefined;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tokenize text into an array of Token objects using compromise.js
  //
  // Token shape:
  // {
  //   raw:           string,  // original text as it appeared
  //   normalized:    string,  // lowercase (compromise .normalize() where possible)
  //   pos:           string,  // canonical POS
  //   role:          string,  // grammar role (filled after sentence-level analysis)
  //   wordIndex:     number,  // position within the flat token array
  //   sentenceIndex: number,  // which sentence (0-based)
  // }
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Tokenize text into sentences → tokens with POS and grammar role.
   * @param {string} text
   * @returns {Token[]}
   */
  function tokenize(text) {
    if (!text || typeof text !== 'string') return [];

    const trimmed = text.trim();
    if (!trimmed) return [];

    // Require compromise.js
    if (typeof window.nlp !== 'function') {
      console.warn('[SemanticEngine] compromise.js (window.nlp) not loaded. Falling back to basic tokenizer.');
      return _basicTokenize(trimmed);
    }

    const doc = window.nlp(trimmed);
    const sentences = doc.sentences().json({ offset: true });

    const tokens = [];
    let wordIndex = 0;

    sentences.forEach((sentenceData, sentenceIndex) => {
      // Re-parse each sentence in isolation for better role detection
      const sentenceText = sentenceData.text || '';
      const sentDoc = window.nlp(sentenceText);

      // Build role hint sets from compromise's tag-based matching.
      // compromise v14 uses .match('#Tag') instead of .subjects()/.verbs() etc.
      const verbTerms     = new Set();
      const modifierTerms = new Set();

      // Verbs
      try {
        sentDoc.match('#Verb').json().forEach(t => {
          const terms = t.terms || [];
          terms.forEach(term => verbTerms.add((term.text || '').toLowerCase()));
        });
      } catch (_) { /* safe fallback — POS tags handle it */ }

      // Adjectives + adverbs → modifiers
      try {
        sentDoc.match('#Adjective').json().forEach(t => {
          const terms = t.terms || [];
          terms.forEach(term => modifierTerms.add((term.text || '').toLowerCase()));
        });
        sentDoc.match('#Adverb').json().forEach(t => {
          const terms = t.terms || [];
          terms.forEach(term => modifierTerms.add((term.text || '').toLowerCase()));
        });
      } catch (_) { /* safe fallback */ }

      // Get all terms with POS tags
      const termJsonArr = sentDoc.json();

      // termJsonArr is an array of sentence-level objects; each has .terms[]
      let sentenceTerms = [];
      if (termJsonArr.length > 0 && termJsonArr[0].terms) {
        sentenceTerms = termJsonArr[0].terms;
      }

      // Track state for heuristic role assignment
      let foundSubject = false;
      let foundVerb    = false;
      let subjectIdx   = -1; // index in tokens[] of the sentence's subject node

      sentenceTerms.forEach((term) => {
        const raw = term.text || '';
        if (!raw.trim()) return; // skip whitespace-only terms

        // Skip pure punctuation tokens
        if (/^[^\w]+$/.test(raw)) return;

        const normalized = normalizeWord(term.normal || raw);
        const pos = tagsToPos(term.tags || {});
        const lc  = raw.toLowerCase();

        // ── Grammar role assignment ──────────────────────────────────────────
        //
        // Priority:
        // 1. compromise subject set (first noun/pronoun in subject position)
        // 2. compromise verb set
        // 3. compromise modifier set (adjectives, adverbs)
        // 4. Prepositions / conjunctions → connector
        // 5. Nouns after a verb → object
        // 6. Remaining → context / unknown

        let role;

        if (!foundSubject && (pos === 'Noun' || pos === 'Pronoun')) {
          role = 'subject';
          foundSubject = true;
          subjectIdx = wordIndex;
        } else if (verbTerms.has(lc) || pos === 'Verb') {
          role = 'verb';
          if (!foundVerb) foundVerb = true;
        } else if (pos === 'Preposition' || pos === 'Conjunction') {
          role = 'connector';
        } else if (modifierTerms.has(lc) || pos === 'Adjective' || pos === 'Adverb') {
          role = 'modifier';
        } else if ((pos === 'Noun' || pos === 'Pronoun') && foundVerb) {
          role = 'object';
        } else if (pos === 'Noun' || pos === 'Pronoun') {
          // Noun before verb and no subject yet → promote to subject
          if (!foundSubject) {
            role = 'subject';
            foundSubject = true;
            subjectIdx = wordIndex;
          } else {
            role = 'context';
          }
        } else if (pos === 'Determiner') {
          role = 'context';
        } else {
          role = 'unknown';
        }

        tokens.push({
          raw,
          normalized,
          pos,
          role,
          wordIndex,
          sentenceIndex,
          _subjectIdx: subjectIdx, // used by parent-index assignment later
        });

        wordIndex++;
      });
    });

    return tokens;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Basic tokenizer fallback (when compromise is not available)
  // ─────────────────────────────────────────────────────────────────────────────

  function _basicTokenize(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    return words.map((raw, i) => ({
      raw,
      normalized: normalizeWord(raw),
      pos: 'Unknown',
      role: i === 0 ? 'subject' : 'unknown',
      wordIndex: i,
      sentenceIndex: 0,
      _subjectIdx: i === 0 ? 0 : -1,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Parent index assignment
  //
  // Heuristic:
  //   subject           → parentIndex: -1 (root)
  //   verb              → attach to nearest preceding subject/noun
  //   object            → attach to nearest preceding verb
  //   modifier          → attach to nearest following noun/verb
  //   connector         → attach to nearest preceding content word
  //   context/unknown   → attach to root (subject), or -1 if no subject
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Assign parentIndex to each node in-place.
   * Operates on nodes that already have role assigned.
   * @param {SemanticNode[]} nodes
   */
  function assignParentIndices(nodes) {
    // Build quick role-indexed lookup within each sentence
    // We operate sentence by sentence.

    const sentences = {};
    nodes.forEach((node, idx) => {
      const si = node.sentenceIndex;
      if (!sentences[si]) sentences[si] = [];
      sentences[si].push({ node, idx });
    });

    Object.values(sentences).forEach(sentenceNodes => {
      // Find the root (subject) of this sentence
      const rootEntry = sentenceNodes.find(e => e.node.role === 'subject');
      const rootIdx   = rootEntry ? rootEntry.idx : -1;

      sentenceNodes.forEach(({ node, idx }) => {
        switch (node.role) {
          case 'subject':
            node.parentIndex = -1;
            break;

          case 'verb': {
            // Attach to nearest preceding subject or noun
            const preceding = sentenceNodes
              .filter(e => e.idx < idx && (e.node.role === 'subject' || e.node.pos === 'Noun'))
              .sort((a, b) => b.idx - a.idx); // descending by index (nearest first)
            node.parentIndex = preceding.length > 0 ? preceding[0].idx : rootIdx;
            break;
          }

          case 'object': {
            // Attach to nearest preceding verb
            const preceding = sentenceNodes
              .filter(e => e.idx < idx && e.node.role === 'verb')
              .sort((a, b) => b.idx - a.idx);
            node.parentIndex = preceding.length > 0 ? preceding[0].idx : rootIdx;
            break;
          }

          case 'modifier': {
            // Attach to nearest following noun or verb; if none, nearest preceding
            const following = sentenceNodes
              .filter(e => e.idx > idx && (e.node.pos === 'Noun' || e.node.pos === 'Verb'))
              .sort((a, b) => a.idx - b.idx); // ascending (nearest first)
            if (following.length > 0) {
              node.parentIndex = following[0].idx;
            } else {
              // Fallback: nearest preceding content word
              const prec = sentenceNodes
                .filter(e => e.idx < idx && (e.node.pos === 'Noun' || e.node.pos === 'Verb'))
                .sort((a, b) => b.idx - a.idx);
              node.parentIndex = prec.length > 0 ? prec[0].idx : rootIdx;
            }
            break;
          }

          case 'connector': {
            // Attach to nearest preceding content word
            const preceding = sentenceNodes
              .filter(e => e.idx < idx && (e.node.pos === 'Noun' || e.node.pos === 'Verb' || e.node.pos === 'Adjective'))
              .sort((a, b) => b.idx - a.idx);
            node.parentIndex = preceding.length > 0 ? preceding[0].idx : rootIdx;
            break;
          }

          case 'context':
          case 'unknown':
          default:
            node.parentIndex = rootIdx;
            break;
        }
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Build a SemanticNode from a token + resolved semantic info
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Assemble a full SemanticNode from parts.
   * parentIndex is set to -1 here; assignParentIndices fills it in properly.
   *
   * @param {object} token         Tokenizer output
   * @param {string[]} categories  Resolved categories
   * @param {string|undefined} dictShape  Shape override from dictionary (or undefined)
   * @param {string} source        "dictionary"|"conceptnet"|"pos-inferred"
   * @param {number} confidence    0.0–1.0
   * @returns {SemanticNode}
   */
  function buildNode(token, categories, dictShape, source, confidence) {
    const shape  = resolveShape(token.pos, categories, dictShape);
    const colors = resolveColors(categories);
    const color  = colors[0] || UNKNOWN_COLOR;
    const weight = calculateWeight(categories, token.role);

    return {
      word:          token.raw,
      pos:           token.pos,
      role:          token.role,
      categories:    categories,
      color:         color,
      colors:        colors,
      shape:         shape,
      weight:        weight,
      parentIndex:   -1,           // filled by assignParentIndices
      sentenceIndex: token.sentenceIndex,
      source:        source,
      confidence:    confidence,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // analyzeSync — synchronous, dictionary-only path
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Synchronous analysis. Uses only DICTIONARY + POS-inferred fallback.
   * Safe to call on every keystroke for real-time preview.
   *
   * @param {string} text
   * @returns {SemanticNode[]}
   */
  function analyzeSync(text) {
    if (!text || !text.trim()) return [];

    const tokens = tokenize(text);
    if (tokens.length === 0) return [];

    const dict = window.DICTIONARY || {};
    const nodes = [];

    // Handle single-token input: treat it as "center" — no subject/verb context
    if (tokens.length === 1) {
      tokens[0].role = 'subject'; // lone word is the root concept
    }

    for (const token of tokens) {
      const entry = lookupDictionary(token.normalized);

      let categories, dictShape, source, confidence;

      if (entry) {
        // Dictionary hit
        categories = entry.categories.slice(); // defensive copy
        dictShape  = entry.shape;
        source     = 'dictionary';
        confidence = 1.0;
      } else {
        // POS-inferred fallback
        categories = posToDefaultCategories(token.pos);
        dictShape  = undefined;
        source     = 'pos-inferred';
        confidence = 0.5;
      }

      nodes.push(buildNode(token, categories, dictShape, source, confidence));
    }

    // Assign parent indices now that all nodes exist
    assignParentIndices(nodes);

    return nodes;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // analyze — async path with ConceptNet upgrade
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Async analysis.
   * 1. Runs analyzeSync for an immediate base result.
   * 2. For every node with source "pos-inferred", queries ConceptNet in parallel.
   * 3. Upgrades matching nodes in-place; re-resolves shape/colors after upgrade.
   * 4. Re-assigns parent indices (roles unchanged, but colors/shapes may differ).
   *
   * @param {string} text
   * @returns {Promise<SemanticNode[]>}
   */
  async function analyze(text) {
    if (!text || !text.trim()) return [];

    // Start with synchronous base
    const nodes = analyzeSync(text);
    if (nodes.length === 0) return nodes;

    // Find nodes that could benefit from ConceptNet
    const posInferredIndices = nodes
      .map((n, i) => ({ node: n, idx: i }))
      .filter(({ node }) => node.source === 'pos-inferred');

    if (posInferredIndices.length === 0) return nodes;

    // Check that ConceptNet is available
    if (!window.ConceptNet || typeof window.ConceptNet.lookup !== 'function') {
      return nodes; // graceful degradation
    }

    // Fetch ConceptNet results in parallel for all pos-inferred words
    const lookupPromises = posInferredIndices.map(async ({ node, idx }) => {
      const result = await window.ConceptNet.lookup(node.word.toLowerCase());
      return { idx, result };
    });

    const lookupResults = await Promise.all(lookupPromises);

    // Upgrade nodes where ConceptNet returned useful data
    const dict = window.DICTIONARY || {};

    for (const { idx, result } of lookupResults) {
      // ConceptNet returned a fallback with confidence ≤ 0.2 — skip upgrading
      if (!result || result.confidence <= 0.2) continue;

      const node = nodes[idx];

      // Determine if dictionary also has this word (should not happen for pos-inferred,
      // but safety check)
      const dictEntry = dict[node.word.toLowerCase()];
      if (dictEntry) continue; // dictionary wins

      // Apply upgrade
      node.categories  = result.categories.slice();
      node.source      = 'conceptnet';
      node.confidence  = result.confidence;

      // Re-resolve visual properties with the richer category data
      node.shape  = resolveShape(node.pos, node.categories, undefined);
      node.colors = resolveColors(node.categories);
      node.color  = node.colors[0] || UNKNOWN_COLOR;
      node.weight = calculateWeight(node.categories, node.role);
    }

    // Re-assign parent indices (roles haven't changed, but worth re-running
    // in case confidence-weighted logic is added later)
    assignParentIndices(nodes);

    return nodes;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────────────────────────────────────

  window.SemanticEngine = {
    /**
     * Synchronous analysis — real-time, dictionary-only.
     * @param {string} text
     * @returns {SemanticNode[]}
     */
    analyzeSync,

    /**
     * Async analysis — upgrades unknown words via ConceptNet.
     * @param {string} text
     * @returns {Promise<SemanticNode[]>}
     */
    analyze,

    /**
     * Re-export of CATEGORIES from dictionary.js.
     * Convenience for consumers who load only semantic-engine.js.
     * Returns live reference — reflects any runtime mutation of window.CATEGORIES.
     */
    get CATEGORIES() {
      return window.CATEGORIES;
    },

    // ── Exposed internals for testing / debugging ───────────────────────────

    /**
     * Tokenize text into Token objects (POS-tagged, role-assigned).
     * Useful for debugging the NLP layer independently.
     */
    tokenize,

    /**
     * Resolve the shape for given pos + categories + optional dict override.
     * Useful for visual QA in browser console.
     */
    resolveShape,

    /**
     * Re-run parent-index assignment on an existing node array.
     * Useful if roles are modified externally.
     */
    assignParentIndices,
  };

}());
