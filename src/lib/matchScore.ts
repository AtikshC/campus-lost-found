function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function overlapScore(a: string, b: string) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (A.size === 0 || B.size === 0) return 0;

  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = new Set([...A, ...B]).size;
  return Math.round((inter / union) * 30); // 0..30
}

function dateCloseness(a: Date, b: Date) {
  const days = Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 1) return 15;
  if (days <= 3) return 10;
  if (days <= 7) return 6;
  if (days <= 14) return 3;
  return 0;
}

export function computeMatch(lost: any, found: any) {
  let score = 0;
  const reasons: string[] = [];

  if (lost.category === found.category) {
    score += 40;
    reasons.push("same category");
  }

  const textScore = overlapScore(lost.title + " " + lost.description, found.title + " " + found.description);
  if (textScore > 0) reasons.push("similar keywords");
  score += textScore;

  const dateScore = dateCloseness(new Date(lost.dateOccurred), new Date(found.dateOccurred));
  if (dateScore > 0) reasons.push("close in time");
  score += dateScore;

  // locationText similarity as cheap signal
  const locScore = overlapScore(lost.locationText, found.locationText);
  if (locScore > 0) reasons.push("similar location text");
  score += Math.min(15, locScore);

  score = Math.max(0, Math.min(100, score));
  const reason = reasons.length ? reasons.join(" + ") : "low-signal match";
  return { score, reason };
}
