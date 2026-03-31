/**
 * glyph-demos.js
 * Curated glyph compositions showcasing the recursive visual system.
 *
 * Each demo has:
 *   title    — label for the pill button
 *   notation — glyph notation string
 *   note     — developer description of what it looks like
 *
 * The final entry "random" is handled specially by glyph-main.js.
 */

window.GLYPH_DEMOS = [
  {
    title: 'seed',
    notation: '',
    note: 'Just the root dot. A single luminous point — the origin of all glyphs.',
  },
  {
    title: 'bloom',
    notation: '1.2-3~4^5*6.',
    note: 'Six-armed star with each arm a different shape. Shows all 5 primitives radiating from center.',
  },
  {
    title: 'fern',
    notation: '1o2.1o3.1o2~1o3^1*',
    note: 'Recursive tendril growing upward (dir 1) with leaves branching right. Organic and vine-like.',
  },
  {
    title: 'crystal',
    notation: '1o(2.6.)3o(2.4.)5o(4.6.)',
    note: 'Three-fold symmetric branching. Ice crystal / snowflake structure.',
  },
  {
    title: 'rune',
    notation: '1-2o(1^3*)4~6.',
    note: 'Compact asymmetric symbol. Reads as a single character — like a letter from another alphabet.',
  },
  {
    title: 'cascade',
    notation: '1o(2o(3.1.)6o(5.1.))4o(3.5.)',
    note: 'Wide branching tree with depth. Shows recursive composition with varied sub-structures.',
  },
  {
    title: 'spiral',
    notation: '2o3o4o5o6o1.',
    note: 'Each junction opens into the next clockwise direction. Creates a hexagonal spiral.',
  },
  {
    title: 'signal',
    notation: '4*1o1o1o1o(2-6-)',
    note: 'Diamond anchor at bottom, tall vertical spine upward, antenna cross-marks at the top.',
  },
  {
    title: 'tree',
    notation: '4o(4o(5.3.)4.)1o(6o(1.5.)2o(1.3.))',
    note: 'Trunk going down, canopy branching up. Organic tree silhouette.',
  },
  {
    title: 'random',
    notation: null,
    note: 'Generates a new random glyph each time. The surprise button.',
  },
];
