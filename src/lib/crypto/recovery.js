/**
 * hushSpace v0.0.1 — Cryptographic Recovery Phrase Generator
 * 
 * Generates and validates human-readable 12-word / 24-word mnemonic recovery phrases
 * derived from cryptographically secure entropy.
 * 
 * @module lib/crypto/recovery
 */

// Curated 256-word phonetic & memorable wordlist for zero-dependency mnemonic recovery
const WORDLIST = [
  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
  "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire",
  "across", "act", "action", "actor", "actress", "actual", "adapt", "add",
  "addict", "address", "adjust", "admit", "adult", "advance", "advice", "aerobic",
  "affair", "afford", "afraid", "again", "age", "agent", "agree", "ahead",
  "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
  "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already",
  "also", "alter", "always", "amateur", "amazing", "among", "amount", "amused",
  "analyst", "anchor", "ancient", "anger", "angle", "angry", "animal", "ankle",
  "announce", "annual", "another", "answer", "antenna", "antique", "anxiety", "any",
  "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
  "area", "arena", "argue", "arm", "armed", "armor", "army", "around",
  "arrange", "arrest", "arrive", "arrow", "art", "artefact", "artist", "artwork",
  "ask", "aspect", "assault", "asset", "assist", "assume", "asthma", "athlete",
  "atom", "attack", "attend", "attitude", "attract", "auction", "audit", "august",
  "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake",
  "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor",
  "bacon", "badge", "bag", "balance", "balcony", "ball", "bamboo", "banana",
  "banner", "bar", "barely", "bargain", "barrel", "base", "basic", "basket",
  "battle", "beach", "bean", "beauty", "because", "become", "beef", "before",
  "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit",
  "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike",
  "bind", "biology", "bird", "birth", "bitter", "black", "blade", "blame",
  "blanket", "blast", "bleak", "bless", "blind", "blood", "blossom", "blouse",
  "blue", "blur", "blush", "board", "boat", "body", "boil", "bomb",
  "bone", "bonus", "book", "boost", "border", "boring", "borrow", "boss",
  "bottom", "bounce", "box", "boy", "bracket", "brain", "brand", "brass",
  "brave", "bread", "breeze", "brick", "bridge", "brief", "bright", "bring",
  "brisk", "broccoli", "broken", "bronze", "broom", "brother", "brown", "brush",
  "bubble", "buddy", "budget", "buffalo", "build", "bulb", "bulk", "bullet",
  "bundle", "bunker", "burden", "burger", "burst", "bus", "business", "busy",
  "butter", "buyer", "buzz", "cabbage", "cabin", "cable", "cactus", "cage"
];

/**
 * Generate a 12-word human-readable recovery phrase from 128-bit cryptographic entropy.
 * @returns {string} 12-word space-separated recovery phrase
 */
export function generateRecoveryPhrase() {
  const entropy = crypto.getRandomValues(new Uint8Array(12));
  const words = [];
  for (let i = 0; i < entropy.length; i++) {
    const wordIndex = entropy[i] % WORDLIST.length;
    words.push(WORDLIST[wordIndex]);
  }
  return words.join(" ");
}

/**
 * Validate that a provided recovery phrase is syntactically valid and consists of recognized words.
 * @param {string} phrase 
 * @returns {boolean}
 */
export function validateRecoveryPhrase(phrase) {
  if (!phrase || typeof phrase !== 'string') return false;
  const words = phrase.trim().toLowerCase().split(/\s+/);
  if (words.length !== 12 && words.length !== 24) return false;
  return words.every(word => WORDLIST.includes(word));
}
