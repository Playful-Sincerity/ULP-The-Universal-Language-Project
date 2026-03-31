// dictionary.js — Hand-crafted semantic dictionary for the 2D Writer
//
// Maps normalized (lowercase) word strings to partial SemanticNode descriptors.
// The semantic engine fills in all other fields at runtime (pos, grammarRole,
// color, weight, source, confidence, raw, normalized, sentenceIndex).
//
// Each entry needs only: { categories: string[] }
// Optional overrides: shape, layoutHint
//
// Shape override rule: only set `shape` when the POS-derived default would be wrong.
// Categories rule: 1–3 entries, chosen for semantic accuracy. Primary = categories[0].
//
// The 12 category keys:
//   existence | emotion | thought | action | nature | structure
//   relation  | time    | space   | quantity | quality | expression

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES constant — 12 semantic categories with color and display label
// Consumed by semantic-engine.js for color lookup and by the breakdown display.
// ─────────────────────────────────────────────────────────────────────────────

window.CATEGORIES = {
  existence:  { color: "#FFFFFF", label: "Existence / Being" },
  emotion:    { color: "#FF6B6B", label: "Emotion / Feeling" },
  thought:    { color: "#B388FF", label: "Thought / Mind" },
  action:     { color: "#FFB347", label: "Action / Motion" },
  nature:     { color: "#4ECDC4", label: "Nature / Life" },
  structure:  { color: "#45B7D1", label: "Structure / Order" },
  relation:   { color: "#FFD93D", label: "Relation / Connection" },
  time:       { color: "#26A69A", label: "Time / Change" },
  space:      { color: "#5C6BC0", label: "Space / Place" },
  quantity:   { color: "#B0BEC5", label: "Quantity / Measure" },
  quality:    { color: "#F48FB1", label: "Quality / Attribute" },
  expression: { color: "#AED581", label: "Expression / Language" },
};


// ─────────────────────────────────────────────────────────────────────────────
// DICTIONARY — ~200 words organized by primary semantic category
// ─────────────────────────────────────────────────────────────────────────────

window.DICTIONARY = {

  // ── FUNCTION WORDS (articles, conjunctions, determiners, basic pronouns) ──
  // These are the structural particles of language — minimal semantic weight.
  // Shape: dot (atomic). Categories: the most relevant structural role.

  "the":    { categories: ["existence"],          shape: "dot" },
  "a":      { categories: ["existence"],          shape: "dot" },
  "an":     { categories: ["existence"],          shape: "dot" },
  "this":   { categories: ["existence", "space"], shape: "dot" },
  "that":   { categories: ["existence", "space"], shape: "dot" },
  "these":  { categories: ["existence", "space"], shape: "dot" },
  "those":  { categories: ["existence", "space"], shape: "dot" },
  "every":  { categories: ["quantity", "existence"], shape: "dot" },
  "each":   { categories: ["quantity", "existence"], shape: "dot" },
  "some":   { categories: ["quantity"],           shape: "dot" },
  "any":    { categories: ["quantity"],           shape: "dot" },
  "no":     { categories: ["existence"],          shape: "dot" },
  "not":    { categories: ["existence"],          shape: "dot" },
  "what":   { categories: ["thought", "relation"], shape: "line" },

  // Conjunctions and connectors — shape: line (pure connector)
  "and":    { categories: ["relation"],  shape: "line" },
  "or":     { categories: ["relation"],  shape: "line" },
  "but":    { categories: ["relation"],  shape: "line" },
  "so":     { categories: ["relation"],  shape: "line" },
  "yet":    { categories: ["relation", "time"], shape: "line" },
  "nor":    { categories: ["relation"],  shape: "line" },
  "if":     { categories: ["thought", "relation"], shape: "line" },
  "as":     { categories: ["relation"],  shape: "line" },
  "than":   { categories: ["relation", "quantity"], shape: "line" },
  "because": { categories: ["relation", "thought"], shape: "line" },
  "though": { categories: ["relation"],  shape: "line" },
  "while":  { categories: ["relation", "time"], shape: "line" },

  // Prepositions — relational direction, shape: line
  "in":     { categories: ["space"],       shape: "line" },
  "on":     { categories: ["space"],       shape: "line" },
  "at":     { categories: ["space", "time"], shape: "line" },
  "to":     { categories: ["relation"],    shape: "line" },
  "for":    { categories: ["relation"],    shape: "line" },
  "of":     { categories: ["relation"],    shape: "line" },
  "from":   { categories: ["space", "time"], shape: "line" },
  "with":   { categories: ["relation"],    shape: "line" },
  "by":     { categories: ["relation"],    shape: "line" },
  "about":  { categories: ["relation", "thought"], shape: "line" },
  "over":   { categories: ["space"],       shape: "line" },
  "under":  { categories: ["space"],       shape: "line" },
  "into":   { categories: ["space", "action"], shape: "line" },
  "out":    { categories: ["space"],       shape: "line" },
  "up":     { categories: ["space"],       shape: "line" },
  "down":   { categories: ["space"],       shape: "line" },
  "after":  { categories: ["time"],        shape: "line" },
  "before": { categories: ["time"],        shape: "line" },
  "through": { categories: ["relation", "space"], shape: "line" },
  "between": { categories: ["relation", "space"], shape: "line" },
  "within": { categories: ["space", "relation"], shape: "line" },
  "around": { categories: ["space"],       shape: "line" },
  "across": { categories: ["space"],       shape: "line" },
  "toward": { categories: ["space", "action"], shape: "line" },
  "upon":   { categories: ["space"],       shape: "line" },
  "near":   { categories: ["space"],       shape: "line" },
  "beyond": { categories: ["space", "thought"], shape: "line" },
  "during": { categories: ["time"],        shape: "line" },
  "since":  { categories: ["time"],        shape: "line" },

  // Personal pronouns — shape: triangle (hierarchical: self/other/it)
  "i":      { categories: ["existence"],   shape: "triangle", layoutHint: "center" },
  "you":    { categories: ["existence", "relation"], shape: "triangle" },
  "he":     { categories: ["existence"],   shape: "triangle" },
  "she":    { categories: ["existence"],   shape: "triangle" },
  "it":     { categories: ["existence"],   shape: "triangle" },
  "we":     { categories: ["existence", "relation"], shape: "triangle" },
  "they":   { categories: ["existence"],   shape: "triangle" },
  "me":     { categories: ["existence"],   shape: "triangle" },
  "him":    { categories: ["existence"],   shape: "triangle" },
  "her":    { categories: ["existence"],   shape: "triangle" },
  "us":     { categories: ["existence", "relation"], shape: "triangle" },
  "them":   { categories: ["existence"],   shape: "triangle" },
  "my":     { categories: ["existence", "relation"], shape: "triangle" },
  "our":    { categories: ["existence", "relation"], shape: "triangle" },
  "your":   { categories: ["existence", "relation"], shape: "triangle" },
  "its":    { categories: ["existence"],   shape: "triangle" },
  "their":  { categories: ["existence"],   shape: "triangle" },
  "itself": { categories: ["existence"],   shape: "triangle" },


  // ── EXISTENCE / BEING ──
  // Core copulas and ontological words — the most fundamental tier.

  "is":       { categories: ["existence"],         shape: "dot" },
  "be":       { categories: ["existence"],         shape: "dot" },
  "are":      { categories: ["existence"],         shape: "dot" },
  "was":      { categories: ["existence", "time"], shape: "dot" },
  "were":     { categories: ["existence", "time"], shape: "dot" },
  "been":     { categories: ["existence", "time"], shape: "dot" },
  "exist":    { categories: ["existence", "action"] },
  "presence": { categories: ["existence", "space"], shape: "hexagon", layoutHint: "center" },
  "absence":  { categories: ["existence", "space"], shape: "hexagon" },
  "void":     { categories: ["existence"],         shape: "dot", layoutHint: "center" },
  "being":    { categories: ["existence"],         shape: "hexagon", layoutHint: "center" },
  "reality":  { categories: ["existence", "thought"] },
  "truth":    { categories: ["existence", "thought"], shape: "hexagon" },
  "self":     { categories: ["existence", "thought"], shape: "hexagon", layoutHint: "center" },
  "nothing":  { categories: ["existence"],         shape: "dot" },
  "something": { categories: ["existence"],        shape: "dot" },
  "everything": { categories: ["existence", "quantity"] },
  "thing":    { categories: ["existence"],         shape: "square" },
  "here":     { categories: ["existence", "space"], shape: "dot", layoutHint: "center" },
  "there":    { categories: ["space", "existence"], shape: "dot" },


  // ── EMOTION / FEELING ──
  // The heart — warmth, passion, longing, joy, grief.

  "love":      { categories: ["emotion", "relation"], shape: "pentagon", layoutHint: "center" },
  "warmth":    { categories: ["emotion", "quality"],  shape: "pentagon" },
  "joy":       { categories: ["emotion", "nature"],   shape: "pentagon" },
  "fear":      { categories: ["emotion"],             shape: "square" },
  "grief":     { categories: ["emotion", "time"],     shape: "square" },
  "hope":      { categories: ["emotion", "time"],     shape: "pentagon" },
  "desire":    { categories: ["emotion", "action"],   shape: "pentagon" },
  "longing":   { categories: ["emotion", "space"],    shape: "pentagon" },
  "pain":      { categories: ["emotion", "nature"],   shape: "square" },
  "anger":     { categories: ["emotion", "action"],   shape: "square" },
  "peace":     { categories: ["emotion", "existence"], shape: "hexagon" },
  "wonder":    { categories: ["emotion", "thought"],  shape: "pentagon" },
  "awe":       { categories: ["emotion", "existence"], shape: "pentagon" },
  "gratitude": { categories: ["emotion", "relation"], shape: "pentagon" },
  "trust":     { categories: ["emotion", "relation"], shape: "pentagon" },
  "courage":   { categories: ["emotion", "action"],   shape: "pentagon" },
  "sadness":   { categories: ["emotion"],             shape: "curve" },
  "happiness": { categories: ["emotion", "quality"],  shape: "pentagon" },
  "compassion": { categories: ["emotion", "relation"], shape: "hexagon" },
  "sincere":   { categories: ["emotion", "quality"],  shape: "pentagon" },
  "sincerity": { categories: ["emotion", "quality"],  shape: "hexagon" },


  // ── THOUGHT / MIND ──
  // Intellect, awareness, knowing, believing, imagining.

  "know":      { categories: ["thought", "action"],      shape: "pentagon" },
  "think":     { categories: ["thought", "action"],      shape: "pentagon" },
  "believe":   { categories: ["thought"],                shape: "hexagon" },
  "understand": { categories: ["thought"],               shape: "hexagon" },
  "imagine":   { categories: ["thought", "expression"],  shape: "hexagon" },
  "remember":  { categories: ["thought", "time"],        shape: "pentagon" },
  "awareness": { categories: ["thought", "existence"],   shape: "hexagon", layoutHint: "center" },
  "watching":  { categories: ["thought", "action"] },
  "watch":     { categories: ["thought", "action"] },
  "see":       { categories: ["thought", "action"],      shape: "pentagon" },
  "learn":     { categories: ["thought", "action"],      shape: "pentagon" },
  "meaning":   { categories: ["thought", "expression"],  shape: "hexagon" },
  "mind":      { categories: ["thought", "existence"],   shape: "hexagon" },
  "wisdom":    { categories: ["thought", "quality"],     shape: "hexagon" },
  "reason":    { categories: ["thought", "structure"],   shape: "hexagon" },
  "insight":   { categories: ["thought", "quality"],     shape: "pentagon" },
  "consciousness": { categories: ["thought", "existence"], shape: "hexagon", layoutHint: "center" },
  "attention": { categories: ["thought", "action"],      shape: "pentagon" },
  "perception": { categories: ["thought", "nature"],     shape: "pentagon" },
  "intention": { categories: ["thought", "action"],      shape: "pentagon" },
  "strange":   { categories: ["quality", "thought"] },
  "loop":      { categories: ["structure", "time"],      shape: "pentagon" },


  // ── ACTION / MOTION ──
  // Doing, moving, building, flowing — energy made visible.

  "grow":     { categories: ["action", "nature"],    shape: "pentagon" },
  "grows":    { categories: ["action", "nature"],    shape: "pentagon" },
  "build":    { categories: ["action", "structure"], shape: "square" },
  "building": { categories: ["action", "structure"], shape: "square" },
  "create":   { categories: ["action", "expression"], shape: "pentagon" },
  "move":     { categories: ["action", "space"] },
  "give":     { categories: ["action", "relation"] },
  "get":      { categories: ["action"] },
  "make":     { categories: ["action", "structure"] },
  "do":       { categories: ["action"],              shape: "square" },
  "go":       { categories: ["action", "space"] },
  "come":     { categories: ["action", "space"] },
  "take":     { categories: ["action"] },
  "find":     { categories: ["action", "thought"] },
  "use":      { categories: ["action", "relation"] },
  "work":     { categories: ["action", "structure"] },
  "carry":    { categories: ["action"],              shape: "square" },
  "carries":  { categories: ["action"],              shape: "square" },
  "gather":   { categories: ["action", "relation"],  shape: "pentagon" },
  "gathering": { categories: ["action", "relation"], shape: "pentagon" },
  "express":  { categories: ["action", "expression"] },
  "expressed": { categories: ["action", "expression"] },
  "transform": { categories: ["action", "time"],     shape: "pentagon" },
  "outlast":  { categories: ["action", "time"],      shape: "pentagon" },
  "wasted":   { categories: ["action", "quality"] },
  "waste":    { categories: ["action", "nature"] },
  "look":     { categories: ["action", "thought"] },
  "want":     { categories: ["emotion", "action"] },
  "will":     { categories: ["action", "time"],      shape: "line" },
  "can":      { categories: ["action"],              shape: "line" },
  "could":    { categories: ["action", "thought"],   shape: "line" },
  "would":    { categories: ["action", "thought"],   shape: "line" },
  "should":   { categories: ["action", "thought"],   shape: "line" },
  "get":      { categories: ["action"] },
  "put":      { categories: ["action", "space"] },
  "let":      { categories: ["action", "relation"] },
  "say":      { categories: ["action", "expression"] },
  "ask":      { categories: ["action", "expression"] },
  "tell":     { categories: ["action", "expression"] },
  "call":     { categories: ["action", "expression"] },
  "play":     { categories: ["action", "emotion"],   shape: "pentagon" },
  "playful":  { categories: ["emotion", "quality"],  shape: "pentagon" },


  // ── NATURE / LIFE ──
  // Growth, living systems, the organic world, cycles.

  "nature":   { categories: ["nature"],              shape: "pentagon" },
  "life":     { categories: ["nature", "existence"], shape: "pentagon" },
  "living":   { categories: ["nature", "existence"], shape: "pentagon" },
  "tree":     { categories: ["nature"],              shape: "square" },
  "water":    { categories: ["nature", "existence"], shape: "pentagon" },
  "light":    { categories: ["nature", "existence"], shape: "curve" },
  "seed":     { categories: ["nature", "time"],      shape: "triangle" },
  "soil":     { categories: ["nature", "space"],     shape: "square" },
  "sun":      { categories: ["nature", "existence"], shape: "pentagon" },
  "earth":    { categories: ["nature", "space"],     shape: "square" },
  "body":     { categories: ["nature", "existence"], shape: "square" },
  "breath":   { categories: ["nature", "existence"], shape: "curve" },
  "flow":     { categories: ["nature", "action"],    shape: "curve" },
  "fire":     { categories: ["nature", "action"],    shape: "pentagon" },
  "air":      { categories: ["nature", "space"],     shape: "curve" },
  "root":     { categories: ["nature", "structure"], shape: "triangle" },
  "bloom":    { categories: ["nature", "action"],    shape: "pentagon" },
  "river":    { categories: ["nature", "time"],      shape: "curve" },
  "sky":      { categories: ["nature", "space"],     shape: "pentagon" },
  "energy":   { categories: ["nature", "action"],    shape: "pentagon" },
  "organic":  { categories: ["nature", "quality"] },
  "ending":   { categories: ["time", "nature"],      shape: "triangle" },
  "next":     { categories: ["time", "space"],       shape: "line" },


  // ── STRUCTURE / ORDER ──
  // Logic, form, architecture, patterns, systems.

  "form":      { categories: ["structure"],           shape: "square" },
  "pattern":   { categories: ["structure", "thought"], shape: "hexagon" },
  "order":     { categories: ["structure"],           shape: "triangle" },
  "system":    { categories: ["structure", "relation"], shape: "hexagon" },
  "frame":     { categories: ["structure", "space"],  shape: "square" },
  "foundation": { categories: ["structure", "space"], shape: "square" },
  "law":       { categories: ["structure", "thought"], shape: "square" },
  "rule":      { categories: ["structure", "thought"], shape: "square" },
  "boundary":  { categories: ["structure", "space"],  shape: "triangle" },
  "logic":     { categories: ["structure", "thought"], shape: "hexagon" },
  "design":    { categories: ["structure", "expression"], shape: "pentagon" },
  "architecture": { categories: ["structure", "space"], shape: "hexagon" },
  "opposite":  { categories: ["structure", "relation"], shape: "triangle" },
  "opposites": { categories: ["structure", "relation"], shape: "triangle" },
  "path":      { categories: ["structure", "space"],  shape: "line" },
  "way":       { categories: ["structure", "space"],  shape: "line" },
  "format":    { categories: ["structure", "expression"] },
  "kind":      { categories: ["structure", "quality"] },
  "type":      { categories: ["structure"] },
  "level":     { categories: ["structure", "quantity"] },


  // ── RELATION / CONNECTION ──
  // Bonds, links, togetherness — the social and connective fabric.

  "connection":  { categories: ["relation", "structure"], shape: "hexagon" },
  "genuine":     { categories: ["quality", "emotion"],    shape: "curve" },
  "together":    { categories: ["relation", "space"],     shape: "pentagon" },
  "community":   { categories: ["relation", "structure"], shape: "hexagon" },
  "bond":        { categories: ["relation", "emotion"],   shape: "pentagon" },
  "link":        { categories: ["relation"],              shape: "line" },
  "bridge":      { categories: ["relation", "structure"], shape: "line" },
  "share":       { categories: ["relation", "action"] },
  "meet":        { categories: ["relation", "action"] },
  "belong":      { categories: ["relation", "emotion"] },
  "unite":       { categories: ["relation", "action"],    shape: "pentagon" },
  "connect":     { categories: ["relation", "action"] },
  "apart":       { categories: ["relation", "space"],     shape: "line" },
  "other":       { categories: ["relation", "existence"], shape: "triangle" },
  "same":        { categories: ["relation", "thought"],   shape: "line" },
  "different":   { categories: ["relation", "quality"],   shape: "triangle" },
  "between":     { categories: ["relation", "space"],     shape: "line" },
  "direction":   { categories: ["space", "action"],       shape: "line" },
  "directions":  { categories: ["space", "action"],       shape: "line" },


  // ── TIME / CHANGE ──
  // Flow, process, becoming, cycles, transformation.

  "time":      { categories: ["time"],              shape: "pentagon" },
  "change":    { categories: ["time", "action"],    shape: "pentagon" },
  "become":    { categories: ["time", "action"],    shape: "pentagon" },
  "becomes":   { categories: ["time", "action"],    shape: "pentagon" },
  "moment":    { categories: ["time"],              shape: "square" },
  "begin":     { categories: ["time", "action"] },
  "end":       { categories: ["time"],              shape: "triangle" },
  "always":    { categories: ["time", "existence"], shape: "curve" },
  "never":     { categories: ["time", "existence"], shape: "curve" },
  "now":       { categories: ["time"],              shape: "dot" },
  "then":      { categories: ["time"],              shape: "dot" },
  "when":      { categories: ["time"],              shape: "line" },
  "once":      { categories: ["time", "quantity"],  shape: "dot" },
  "still":     { categories: ["time", "existence"], shape: "dot" },
  "long":      { categories: ["time", "quantity"],  shape: "curve" },
  "old":       { categories: ["time", "quality"],   shape: "curve" },
  "oldest":    { categories: ["time", "quality"],   shape: "curve" },
  "new":       { categories: ["time", "quality"],   shape: "curve" },
  "first":     { categories: ["time", "quantity"],  shape: "dot" },
  "last":      { categories: ["time", "quantity"],  shape: "dot" },
  "soon":      { categories: ["time"],              shape: "dot" },
  "day":       { categories: ["time", "nature"] },
  "year":      { categories: ["time", "nature"] },
  "process":   { categories: ["time", "action"],    shape: "pentagon" },
  "cycle":     { categories: ["time", "nature"],    shape: "pentagon" },
  "evolve":    { categories: ["time", "action"],    shape: "pentagon" },
  "past":      { categories: ["time"],              shape: "dot" },
  "future":    { categories: ["time", "thought"],   shape: "pentagon" },


  // ── SPACE / PLACE ──
  // Location, container, world — the spatial dimension.

  "center":    { categories: ["space", "existence"],  shape: "hexagon", layoutHint: "center" },
  "world":     { categories: ["space", "nature"],     shape: "hexagon" },
  "universe":  { categories: ["space", "existence"],  shape: "hexagon" },
  "place":     { categories: ["space"],               shape: "square" },
  "home":      { categories: ["space", "emotion"],    shape: "square" },
  "ground":    { categories: ["space", "nature"],     shape: "square" },
  "field":     { categories: ["space", "nature"],     shape: "square" },
  "layer":     { categories: ["space", "structure"] },
  "depth":     { categories: ["quality", "space"],    shape: "curve" },
  "surface":   { categories: ["space"],               shape: "square" },
  "above":     { categories: ["space"],               shape: "line" },
  "below":     { categories: ["space"],               shape: "line" },
  "inside":    { categories: ["space", "relation"],   shape: "line" },
  "outside":   { categories: ["space", "relation"],   shape: "line" },
  "far":       { categories: ["space"],               shape: "line" },
  "close":     { categories: ["space", "relation"],   shape: "line" },
  "left":      { categories: ["space"],               shape: "line" },
  "right":     { categories: ["space"],               shape: "line" },
  "high":      { categories: ["space", "quantity"],   shape: "line" },
  "low":       { categories: ["space", "quantity"],   shape: "line" },
  "vast":      { categories: ["space", "quantity"],   shape: "curve" },
  "open":      { categories: ["space", "quality"],    shape: "curve" },


  // ── QUANTITY / MEASURE ──
  // Numbers, degree, amount, scale.

  "one":       { categories: ["quantity", "existence"], shape: "dot" },
  "two":       { categories: ["quantity"],              shape: "line" },
  "all":       { categories: ["quantity", "existence"], shape: "triangle" },
  "many":      { categories: ["quantity"],              shape: "curve" },
  "more":      { categories: ["quantity"],              shape: "curve" },
  "most":      { categories: ["quantity"],              shape: "curve" },
  "much":      { categories: ["quantity"],              shape: "curve" },
  "few":       { categories: ["quantity"],              shape: "curve" },
  "less":      { categories: ["quantity"],              shape: "curve" },
  "enough":    { categories: ["quantity", "quality"],   shape: "curve" },
  "full":      { categories: ["quantity", "existence"], shape: "pentagon" },
  "half":      { categories: ["quantity"],              shape: "line" },
  "whole":     { categories: ["quantity", "existence"], shape: "hexagon" },
  "small":     { categories: ["quantity", "quality"],   shape: "dot" },
  "large":     { categories: ["quantity", "quality"],   shape: "pentagon" },
  "great":     { categories: ["quantity", "quality"],   shape: "pentagon" },
  "only":      { categories: ["quantity", "existence"], shape: "dot" },
  "both":      { categories: ["quantity", "relation"],  shape: "line" },
  "several":   { categories: ["quantity"],              shape: "curve" },


  // ── QUALITY / ATTRIBUTE ──
  // Properties, beauty, character — the "how it is" layer.

  "beautiful": { categories: ["quality", "emotion"],    shape: "curve" },
  "true":      { categories: ["quality", "thought"],    shape: "triangle" },
  "real":      { categories: ["quality", "existence"],  shape: "triangle" },
  "good":      { categories: ["quality"],               shape: "curve" },
  "deep":      { categories: ["quality", "space"],      shape: "curve" },
  "alive":     { categories: ["quality", "nature"],     shape: "pentagon" },
  "free":      { categories: ["quality", "existence"],  shape: "curve" },
  "whole":     { categories: ["quality", "existence"],  shape: "hexagon" },
  "clear":     { categories: ["quality", "thought"],    shape: "curve" },
  "strong":    { categories: ["quality", "action"],     shape: "square" },
  "soft":      { categories: ["quality", "emotion"],    shape: "curve" },
  "hard":      { categories: ["quality"],               shape: "square" },
  "rich":      { categories: ["quality", "quantity"],   shape: "pentagon" },
  "pure":      { categories: ["quality", "existence"],  shape: "curve" },
  "simple":    { categories: ["quality", "structure"],  shape: "curve" },
  "complex":   { categories: ["quality", "structure"],  shape: "hexagon" },
  "unique":    { categories: ["quality", "existence"] },
  "sacred":    { categories: ["quality", "emotion"],    shape: "hexagon" },
  "gift":      { categories: ["quality", "relation"],   shape: "pentagon" },
  "art":       { categories: ["expression", "quality"], shape: "hexagon" },
  "truly":     { categories: ["quality", "existence"],  shape: "curve" },


  // ── EXPRESSION / LANGUAGE ──
  // Words, symbols, communication — meaning made manifest.

  "speak":     { categories: ["expression", "action"],  shape: "square" },
  "word":      { categories: ["expression"],            shape: "square" },
  "language":  { categories: ["expression", "structure"], shape: "hexagon" },
  "story":     { categories: ["expression", "time"],    shape: "pentagon" },
  "silence":   { categories: ["expression", "existence"], shape: "dot" },
  "voice":     { categories: ["expression", "action"],  shape: "pentagon" },
  "song":      { categories: ["expression", "emotion"], shape: "pentagon" },
  "write":     { categories: ["expression", "action"],  shape: "square" },
  "read":      { categories: ["expression", "thought"], shape: "square" },
  "symbol":    { categories: ["expression", "structure"], shape: "triangle" },
  "sign":      { categories: ["expression", "relation"], shape: "triangle" },
  "name":      { categories: ["expression", "existence"], shape: "square" },
  "call":      { categories: ["expression", "action"] },
  "question":  { categories: ["expression", "thought"], shape: "curve" },
  "answer":    { categories: ["expression", "thought"], shape: "square" },
  "message":   { categories: ["expression", "relation"], shape: "pentagon" },
  "idea":      { categories: ["thought", "expression"], shape: "pentagon" },
  "concept":   { categories: ["thought", "expression"], shape: "hexagon" },
  "meaning":   { categories: ["expression", "thought"], shape: "hexagon" },
  "people":    { categories: ["relation", "existence"], shape: "pentagon" },
  "person":    { categories: ["existence", "relation"], shape: "pentagon" },
  "experience": { categories: ["thought", "time"],     shape: "pentagon" },
  "experiences": { categories: ["thought", "time"],    shape: "pentagon" },

};
