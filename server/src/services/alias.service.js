const SUBSTITUTIONS = [
  ['ph', 'f'],
  ['f', 'ph'],
  ['c', 'k'],
  ['k', 'c'],
  ['y', 'i'],
  ['i', 'y'],
  ['z', 's'],
  ['s', 'z'],
  ['ai', 'e'],
  ['e', 'ai'],
];

const MAX_VARIANTS_PER_WORD = 60;

function variantsForWord(word) {
  if (!word || word.length < 4) return [];

  const lower = word.toLowerCase();
  const out = new Set();

  // 1. Single-character deletions
  for (let i = 0; i < lower.length; i++) {
    out.add(lower.slice(0, i) + lower.slice(i + 1));
  }

  // 2. Adjacent transpositions
  for (let i = 0; i < lower.length - 1; i++) {
    out.add(
      lower.slice(0, i) +
      lower[i + 1] +
      lower[i] +
      lower.slice(i + 2)
    );
  }

  // 3. Common phoneme substitutions (first occurrence only — keeps the set small)
  for (const [from, to] of SUBSTITUTIONS) {
    const idx = lower.indexOf(from);
    if (idx !== -1) {
      out.add(lower.slice(0, idx) + to + lower.slice(idx + from.length));
    }
  }

  // 4. Truncations from the front (people type partial names)
  for (let len = 5; len < lower.length; len++) {
    out.add(lower.slice(0, len));
  }

  // 5. Remove the original (it's already in name/genericName/brandNames)
  out.delete(lower);

  return Array.from(out).slice(0, MAX_VARIANTS_PER_WORD);
}

export function generateAliases({ name, genericName, brandNames = [] }) {
  const words = new Set();

  // Extract the "main word" from the medicine name — the first token before any digits/size
  if (name) {
    const mainWord = name.split(/\s+/)[0];
    if (mainWord) words.add(mainWord);
  }
  if (genericName) words.add(genericName);
  for (const b of brandNames) {
    if (b) words.add(b);
  }

  const aliases = new Set();
  for (const word of words) {
    for (const v of variantsForWord(word)) {
      aliases.add(v);
    }
  }

  return Array.from(aliases);
}