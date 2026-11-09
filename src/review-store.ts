import type { ReviewSubmission, ReviewFingerprint } from './types.js';

export function extractShingles(text: string, k: number = 3): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const shingles = new Set<string>();
  if (words.length < k) {
    shingles.add(words.join(' '));
    return shingles;
  }

  for (let i = 0; i <= words.length - k; i++) {
    shingles.add(words.slice(i, i + k).join(' '));
  }
  return shingles;
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1.0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export class ReviewStore {
  private history = new Map<string, ReviewFingerprint[]>(); // productId -> fingerprints

  add(fingerprint: ReviewFingerprint): void {
    const list = this.history.get(fingerprint.productId) ?? [];
    list.push(fingerprint);
    this.history.set(fingerprint.productId, list);
  }

  getRecentForProduct(productId: string): ReviewFingerprint[] {
    return this.history.get(productId) ?? [];
  }

  clear(): void {
    this.history.clear();
  }
}
