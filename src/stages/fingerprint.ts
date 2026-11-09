import type { Stage, PipelineContext } from '../core/index.js';
import type { ReviewSubmission, ReviewFingerprint } from '../types.js';
import { extractShingles } from '../review-store.js';

export const reviewFingerprintStage: Stage<ReviewSubmission, ReviewFingerprint> = {
  id: 'review-fingerprint',
  name: 'Text Shingling & Network Fingerprint',
  description: 'Generates k-shingles and extracts /24 subnet',
  async run(input: ReviewSubmission, ctx: PipelineContext): Promise<ReviewFingerprint> {
    const shingles = extractShingles(input.reviewText);
    const ipParts = input.clientIp.split('.');
    const ipSubnet = ipParts.length === 4 ? `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24` : input.clientIp;

    ctx.logger.info(`Computed review fingerprint`, {
      reviewId: input.reviewId,
      shingleCount: shingles.size,
      ipSubnet,
    });

    return {
      reviewId: input.reviewId,
      productId: input.productId,
      shingles,
      ipSubnet,
      deviceFingerprint: input.deviceFingerprint,
      timestamp: input.timestamp,
    };
  },
};
