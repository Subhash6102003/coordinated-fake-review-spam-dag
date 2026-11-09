import type { Stage, PipelineContext } from '../core/index.js';
import type { ReviewFingerprint, SpamVerdict } from '../types.js';
import { type ReviewStore, jaccardSimilarity } from '../review-store.js';

export function createClusterDetectorStage(store: ReviewStore): Stage<ReviewFingerprint, SpamVerdict> {
  return {
    id: 'cluster-detector',
    name: 'Coordinated Cluster Detector & Spam Scorer',
    description: 'Detects high text similarity or bursty submissions from same subnet/device',
    async run(input: ReviewFingerprint, ctx: PipelineContext): Promise<SpamVerdict> {
      const recents = store.getRecentForProduct(input.productId);
      let spamScore = 0;
      const flags: string[] = [];

      for (const prev of recents) {
        // Text similarity check
        const sim = jaccardSimilarity(input.shingles, prev.shingles);
        if (sim >= 0.65) {
          spamScore += 50;
          flags.push(`Near-duplicate review text detected (${Math.round(sim * 100)}% similarity)`);
          break;
        }

        // Device fingerprint reuse on same product
        if (input.deviceFingerprint === prev.deviceFingerprint && input.reviewId !== prev.reviewId) {
          spamScore += 40;
          flags.push('Same device fingerprint submitted multiple reviews for product');
          break;
        }

        // Rapid burst from same IP subnet within 5 minutes (300,000ms)
        const timeDiff = Math.abs(input.timestamp - prev.timestamp);
        if (input.ipSubnet === prev.ipSubnet && timeDiff < 300_000) {
          spamScore += 30;
          flags.push('Bursty submission from shared /24 subnet');
          break;
        }
      }

      spamScore = Math.min(100, spamScore);

      let verdict: SpamVerdict['verdict'] = 'PUBLISH';
      let isSpam = false;

      if (spamScore >= 60) {
        verdict = 'AUTO_REJECT';
        isSpam = true;
      } else if (spamScore >= 30) {
        verdict = 'QUARANTINE_REVIEW';
        isSpam = true;
      }

      // Record this review's fingerprint into store
      store.add(input);

      ctx.logger.info(`Review spam verdict: ${verdict} (score=${spamScore})`, {
        reviewId: input.reviewId,
        isSpam,
      });

      return {
        reviewId: input.reviewId,
        productId: input.productId,
        isSpam,
        spamScore,
        verdict,
        flags,
      };
    },
  };
}
