/**
 * Stock Confidence Score — v1
 *
 * Formula:
 *   score = 100 × (0.7·exp(-hours/48) + 0.3·M)
 *   where M = { photo: 1.0, csv: 0.9, manual: 0.7, import: 0.5 }
 *
 * Labels:
 *   ≥ 70 → Fresh
 *   40–69 → Aging
 *   < 40 → Stale
 *
 * Factors deferred to v2:
 *   P — pharmacy reliability (needs update-history stat)
 *   V — demand velocity (needs sales history)
 *
 * All weights and τ are named constants at the top of this file.
 * Changing them changes the model; tests should assert against the current values.
 */


const TAU_HOURS = 48;
const W_RECENCY = 0.7;
const W_METHOD = 0.3;

const METHOD_WEIGHTS = {
  photo: 1.0,
  csv: 0.9,
  manual: 0.7,
  import: 0.5,
};

const FRESH_THRESHOLD = 70;
const AGING_THRESHOLD = 40;

function hoursSince(date) {
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
}

function labelFor(score) {
  if (score >= FRESH_THRESHOLD) return 'Fresh';
  if (score >= AGING_THRESHOLD) return 'Aging';
  return 'Stale';
}

function humanizeHours(h) {
  if (h < 1) return 'less than an hour ago';
  if (h < 24) return `${Math.round(h)} hour${Math.round(h) === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

function humanizeMethod(m) {
  return (
    {
      photo: 'shelf photo',
      csv: 'CSV upload',
      manual: 'manual entry',
      import: 'system import',
    }[m] || 'unknown method'
  );
}

export function computeConfidence({ stock }) {
  if (!stock || !stock.verifiedAt) {
    return {
      score: 0,
      label: 'Stale',
      reasons: ['No verification on record'],
    };
  }

  const hours = hoursSince(stock.verifiedAt);
  const recency = Math.exp(-hours / TAU_HOURS);
  const method = METHOD_WEIGHTS[stock.verificationMethod] ?? 0.5;

  const raw = W_RECENCY * recency + W_METHOD * method;
  const score = Math.round(raw * 100);
  const label = labelFor(score);

  const reasons = [
    `Verified ${humanizeHours(hours)} by ${humanizeMethod(stock.verificationMethod)}`,
  ];

  if (method < 0.8) {
    reasons.push(
      `Lower-trust verification method (${humanizeMethod(stock.verificationMethod)})`
    );
  }
  if (hours > 24 * 7) {
    reasons.push('Not verified in over a week');
  }

  return { score, label, reasons };
}