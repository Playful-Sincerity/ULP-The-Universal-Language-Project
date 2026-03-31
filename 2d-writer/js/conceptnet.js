/**
 * conceptnet.js
 * ConceptNet 5 API fallback client for the 2D Writer semantic engine.
 *
 * Role: async fallback for words not found in dictionary.js.
 * Returns { categories: string[], confidence: number } — always, never throws.
 *
 * The 12 valid category keys:
 *   existence, emotion, thought, action, nature, structure,
 *   relation, time, space, quantity, quality, expression
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // ConceptNet relation type → category vote(s)
  // ---------------------------------------------------------------------------
  const RELATION_CATEGORY_MAP = {
    '/r/IsA':             ['structure'],
    '/r/HasProperty':     ['quality'],
    '/r/CapableOf':       ['action'],
    '/r/Causes':          ['action', 'time'],
    '/r/UsedFor':         ['action'],
    '/r/AtLocation':      ['space'],
    '/r/RelatedTo':       ['relation'],
    '/r/PartOf':          ['structure', 'relation'],
    '/r/HasContext':      ['thought'],
    '/r/ReceivesAction':  ['action'],
    '/r/HasSubevent':     ['time'],
    '/r/Desires':         ['emotion'],
    '/r/CausesDesire':    ['emotion'],
    '/r/MotivatedByGoal': ['thought', 'action'],
    '/r/SymbolOf':        ['expression'],
    '/r/DerivedFrom':     ['existence'],
    '/r/FormOf':          ['existence'],
    '/r/SimilarTo':       ['quality'],
    '/r/Antonym':         ['relation'],
    '/r/ObstructedBy':    ['structure'],
    '/r/NotIsA':          ['existence'],
    '/r/MadeOf':          ['nature'],
    '/r/NotCapableOf':    ['existence'],
    '/r/LocatedNear':     ['space'],
    '/r/MannerOf':        ['action'],
    '/r/HasA':            ['relation'],
    '/r/ExternalURL':     ['expression'],
    '/r/EtymologicallyRelatedTo': ['expression'],
    '/r/dbpedia/genre':   ['expression'],
    '/r/dbpedia/influenced': ['relation'],
  };

  // ---------------------------------------------------------------------------
  // Keyword → category lookup for related concept text
  // Used to boost categories when the related word itself is a strong signal.
  // ---------------------------------------------------------------------------
  const KEYWORD_CATEGORY_MAP = [
    // emotion
    { keywords: ['feel', 'feeling', 'emotion', 'love', 'fear', 'joy', 'grief', 'happy', 'sad', 'anger', 'anger', 'hurt', 'care', 'desire', 'passion', 'heart', 'mood', 'affection', 'longing', 'compassion'], category: 'emotion' },
    // thought
    { keywords: ['think', 'thought', 'mind', 'know', 'believe', 'idea', 'concept', 'reason', 'logic', 'knowledge', 'understand', 'aware', 'conscious', 'perception', 'memory', 'imagine', 'dream', 'mental', 'cognitive', 'intellect'], category: 'thought' },
    // action
    { keywords: ['do', 'act', 'action', 'move', 'run', 'build', 'create', 'make', 'work', 'perform', 'execute', 'operate', 'cause', 'effect', 'drive', 'push', 'pull', 'strike', 'force', 'energy'], category: 'action' },
    // nature
    { keywords: ['nature', 'life', 'grow', 'plant', 'tree', 'animal', 'earth', 'water', 'fire', 'air', 'organic', 'living', 'wild', 'natural', 'forest', 'river', 'ocean', 'mountain', 'seed', 'flower', 'bird', 'soil', 'breath', 'body'], category: 'nature' },
    // structure
    { keywords: ['structure', 'order', 'system', 'pattern', 'rule', 'form', 'organize', 'arrange', 'category', 'type', 'class', 'hierarchy', 'layer', 'frame', 'foundation', 'architecture', 'design', 'schema', 'logic', 'law'], category: 'structure' },
    // relation
    { keywords: ['relate', 'relation', 'connect', 'link', 'bond', 'between', 'together', 'with', 'association', 'network', 'belong', 'attach', 'bind', 'combine', 'involve', 'interact', 'join', 'partnership', 'community', 'family'], category: 'relation' },
    // time
    { keywords: ['time', 'change', 'become', 'begin', 'end', 'past', 'future', 'moment', 'duration', 'sequence', 'process', 'evolve', 'flow', 'before', 'after', 'history', 'cycle', 'transition', 'develop', 'transform'], category: 'time' },
    // space
    { keywords: ['place', 'space', 'location', 'position', 'area', 'region', 'here', 'there', 'where', 'inside', 'outside', 'near', 'far', 'above', 'below', 'center', 'boundary', 'distance', 'world', 'universe', 'field'], category: 'space' },
    // quantity
    { keywords: ['number', 'quantity', 'amount', 'measure', 'count', 'many', 'few', 'all', 'none', 'more', 'less', 'degree', 'size', 'scale', 'mass', 'weight', 'volume', 'frequency', 'rate', 'proportion'], category: 'quantity' },
    // quality
    { keywords: ['quality', 'property', 'attribute', 'character', 'nature', 'beautiful', 'good', 'bad', 'strong', 'weak', 'bright', 'dark', 'pure', 'true', 'real', 'false', 'subtle', 'rich', 'deep', 'simple'], category: 'quality' },
    // expression
    { keywords: ['word', 'speak', 'say', 'express', 'language', 'symbol', 'sign', 'communicate', 'write', 'read', 'text', 'meaning', 'story', 'voice', 'sound', 'music', 'art', 'image', 'describe', 'represent'], category: 'expression' },
    // existence
    { keywords: ['exist', 'be', 'is', 'presence', 'absence', 'void', 'nothing', 'something', 'being', 'real', 'actual', 'fact', 'truth', 'essence', 'foundation', 'ground', 'pure', 'raw', 'bare', 'origin'], category: 'existence' },
  ];

  // Pre-build a flat lookup: word → category (first match wins for performance)
  const _keywordLookup = Object.create(null);
  for (const entry of KEYWORD_CATEGORY_MAP) {
    for (const kw of entry.keywords) {
      if (!_keywordLookup[kw]) _keywordLookup[kw] = entry.category;
    }
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const _cache = new Map();          // word → { categories, confidence }
  let _consecutiveFailures = 0;
  let _circuitOpenUntil = 0;         // timestamp ms; 0 = circuit closed (open for calls)

  const CIRCUIT_FAILURE_THRESHOLD = 3;
  const CIRCUIT_COOLDOWN_MS = 60_000;  // 60 seconds
  const FETCH_TIMEOUT_MS = 3_000;

  const FALLBACK_TIMEOUT  = { categories: ['existence'], confidence: 0.1 };
  const FALLBACK_EMPTY    = { categories: ['existence'], confidence: 0.2 };
  const FALLBACK_CIRCUIT  = { categories: ['existence'], confidence: 0.1 };

  // ---------------------------------------------------------------------------
  // Helper: extract the terminal word from a ConceptNet node URI
  // e.g. "/c/en/tree/n" → "tree"
  // ---------------------------------------------------------------------------
  function _termFromUri(uri) {
    if (!uri || typeof uri !== 'string') return '';
    const parts = uri.split('/');
    // URI format: /c/en/word  or  /c/en/word/pos
    // index 3 = word segment (after '', 'c', 'en')
    const word = parts[3] || '';
    return word.replace(/_/g, ' ').toLowerCase();
  }

  // ---------------------------------------------------------------------------
  // Helper: given a concept text string, return a category vote or null
  // ---------------------------------------------------------------------------
  function _categoryFromText(text) {
    if (!text) return null;
    const words = text.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (_keywordLookup[w]) return _keywordLookup[w];
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Core: parse ConceptNet edges → { categories, confidence }
  // ---------------------------------------------------------------------------
  function _parseEdges(edges, normalizedWord) {
    if (!edges || !Array.isArray(edges) || edges.length === 0) {
      return null;
    }

    const votes = Object.create(null); // category → count

    for (const edge of edges) {
      const rel = edge.rel && edge.rel['@id'];
      if (!rel) continue;

      // 1. Votes from relation type
      const relCategories = RELATION_CATEGORY_MAP[rel];
      if (relCategories) {
        for (const cat of relCategories) {
          votes[cat] = (votes[cat] || 0) + 1;
        }
      }

      // 2. Votes from the related concept's text
      const startUri = edge.start && edge.start['@id'];
      const endUri   = edge.end   && edge.end['@id'];

      // The "other" node (not the word we looked up)
      const otherUri = _termFromUri(startUri) === normalizedWord ? endUri : startUri;
      const otherText = (edge.start && edge.start.label) || _termFromUri(otherUri) || '';
      const otherCategory = _categoryFromText(otherText);

      if (otherCategory) {
        // Keyword matches get half a vote (relation type is the primary signal)
        votes[otherCategory] = (votes[otherCategory] || 0) + 0.5;
      }
    }

    const totalWeight = Object.values(votes).reduce((s, v) => s + v, 0);
    if (totalWeight === 0) return null;

    // Sort categories by vote descending, take top 1–3
    const sorted = Object.entries(votes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const topVotes = votes[sorted[0]] || 0;
    // Cap at 0.85 — ConceptNet is never as confident as the dictionary
    const confidence = Math.min(0.85, topVotes / edges.length);

    return { categories: sorted, confidence };
  }

  // ---------------------------------------------------------------------------
  // Core: fetch with timeout
  // ---------------------------------------------------------------------------
  async function _fetchWithTimeout(url) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timerId);
      return response;
    } catch (err) {
      clearTimeout(timerId);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Public: lookup(word) → Promise<{ categories: string[], confidence: number }>
  // Never throws. Always returns a valid result.
  // ---------------------------------------------------------------------------
  async function lookup(word) {
    if (!word || typeof word !== 'string') return FALLBACK_EMPTY;

    const normalized = word.toLowerCase().trim().replace(/\s+/g, '_');
    if (!normalized) return FALLBACK_EMPTY;

    // 1. Cache hit
    if (_cache.has(normalized)) {
      return _cache.get(normalized);
    }

    // 2. Circuit breaker: are we in cooldown?
    const now = Date.now();
    if (_consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD && now < _circuitOpenUntil) {
      console.warn(`[ConceptNet] Circuit open — skipping API call for "${word}". Retry after ${Math.ceil((_circuitOpenUntil - now) / 1000)}s.`);
      return FALLBACK_CIRCUIT;
    }
    // Reset circuit if cooldown has expired
    if (_consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD && now >= _circuitOpenUntil) {
      _consecutiveFailures = 0;
    }

    // 3. Fetch from ConceptNet
    const url = `https://api.conceptnet.io/c/en/${encodeURIComponent(normalized)}?limit=20`;
    let response;

    try {
      response = await _fetchWithTimeout(url);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn(`[ConceptNet] Timeout (3s) for "${word}"`);
        _recordFailure();
        return FALLBACK_TIMEOUT;
      }
      console.warn(`[ConceptNet] Network error for "${word}":`, err.message);
      _recordFailure();
      return FALLBACK_TIMEOUT;
    }

    if (!response.ok) {
      console.warn(`[ConceptNet] HTTP ${response.status} for "${word}"`);
      _recordFailure();
      const result = FALLBACK_EMPTY;
      _cache.set(normalized, result);
      return result;
    }

    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.warn(`[ConceptNet] JSON parse error for "${word}":`, err.message);
      _recordFailure();
      return FALLBACK_EMPTY;
    }

    // 4. Parse edges
    const edges = data.edges || [];
    const parsed = _parseEdges(edges, normalized.replace(/_/g, ' '));

    if (!parsed) {
      _recordSuccess();
      const result = FALLBACK_EMPTY;
      _cache.set(normalized, result);
      return result;
    }

    _recordSuccess();
    _cache.set(normalized, parsed);
    return parsed;
  }

  // ---------------------------------------------------------------------------
  // Circuit breaker helpers
  // ---------------------------------------------------------------------------
  function _recordFailure() {
    _consecutiveFailures += 1;
    if (_consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
      _circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
      console.warn(`[ConceptNet] Circuit opened after ${_consecutiveFailures} consecutive failures. Will retry after ${CIRCUIT_COOLDOWN_MS / 1000}s.`);
    }
  }

  function _recordSuccess() {
    _consecutiveFailures = 0;
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------
  window.ConceptNet = {
    lookup,

    // Exposed for testing / debugging
    _cache,
    _getCircuitState() {
      const now = Date.now();
      const open = _consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD && now < _circuitOpenUntil;
      return {
        failures: _consecutiveFailures,
        open,
        retryInMs: open ? Math.max(0, _circuitOpenUntil - now) : 0,
      };
    },
  };

}());
