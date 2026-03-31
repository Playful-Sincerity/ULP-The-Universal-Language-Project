// demos.js — pre-written demo content drawn from PS (Playful Sincerity) philosophy
// Each demo: { title, text, note }
// Pill label = title. Input to semantic engine = text. note is developer-only.
//
// Category coverage goals:
//   All 12 categories appear at least once across the 8 demos.
//   Each demo emphasizes a distinct palette — glyphs should look visually different.
//
// Text principles:
//   Beautiful as standalone writing, not motivational captions.
//   Philosophical without being vacant — every word does work.
//   Voice: Playful Sincerity — grounded, warm, honest, a little strange.

window.DEMOS = [
  {
    // Categories: Existence / Being (white) · Quality / Attribute (rose) · Relation / Connection (gold)
    // Glyph shape: sparse, radiant — three bright nodes like a point of light
    title: "being here",
    text: "presence is the gift",
    note: "Shortest demo — three semantic nodes. Tests short-input rendering. Should look like a star: Existence + Quality + Relation."
  },
  {
    // Categories: Emotion / Feeling (coral) · Nature / Life (emerald) · Action / Motion (amber) · Relation / Connection (gold)
    // Glyph shape: warm, branching — organic and alive, like a plant reaching
    title: "love grows",
    text: "love does not arrive fully formed. it grows through honest contact with another living world.",
    note: "Two sentences, medium density. Organic branching glyph. Emotion + Nature + Action + Relation — four distinct colors should all appear."
  },
  {
    // Categories: Existence (white) · Space / Place (indigo) · Thought / Mind (violet) · Quality / Attribute (rose) · Quantity / Measure (silver)
    // Glyph shape: vast and layered — nested clusters, a sense of depth
    title: "every person",
    text: "every person you meet is carrying a world as large as yours — unseen, intact, and quietly aching to be known",
    note: "Tests containment and nested structure. 'Carrying' + 'within' should produce nested visual clusters. Existence + Space + Thought + Quality."
  },
  {
    // Categories: Relation / Connection (gold) · Structure / Order (cyan) · Expression / Language (lime) · Time / Change (teal) · Action / Motion (amber)
    // Glyph shape: dense web — many nodes, constellation-like
    title: "community",
    text: "gathering is the oldest technology. before language, before structure, there was the circle of people who chose to stay near one another.",
    note: "High node count. Dense web glyph. 'Oldest' anchors Time; 'language' fires Expression; 'circle' fires Structure. Relation + Structure + Expression + Time + Action."
  },
  {
    // Categories: Thought / Mind (violet) · Existence (white) · Time / Change (teal) · Structure / Order (cyan)
    // Glyph shape: most complex — hexagon-heavy, deeply layered
    title: "consciousness",
    text: "awareness watching itself is the strange loop at the heart of all meaning — the mind that cannot step outside itself, circling its own light",
    note: "Maximum abstract density. Most complex glyph in the set. Thought + Existence + Time + Structure. Showpiece for system depth."
  },
  {
    // Categories: Nature / Life (emerald) · Time / Change (teal) · Action / Motion (amber) · Existence (white) · Quality / Attribute (rose)
    // Glyph shape: two clusters with connective arc — death-cluster and growth-cluster in spatial tension
    title: "regeneration",
    text: "nothing in nature is wasted. every ending becomes the soil for what grows next.",
    note: "Two-sentence input — tests sentence-boundary handling. The two clusters and connecting arc should visually tell the story: ending → beginning."
  },
  {
    // Categories: ALL 12 — signature showpiece
    // Glyph shape: largest, most colorful — the canvas's defining image
    title: "playful sincerity",
    text: "to be truly playful is to be truly sincere. warmth and depth are not opposites — they are the same love, expressed in different directions.",
    note: "Two sentences, maximum semantic density. All 12 categories should appear. 'Opposites' may generate a structural split — the visual tension IS the philosophical meaning."
  },
  {
    // Categories: Time / Change (teal) · Action / Motion (amber) · Space / Place (indigo) · Existence (white)
    // Glyph shape: minimal and directional — a pointing arrow toward the future
    title: "the long path",
    text: "we are building something that will outlast us",
    note: "Shortest closing demo. Future-pointing vector. Good visual contrast to the dense demos. Time + Action + Space + Existence."
  }
];
