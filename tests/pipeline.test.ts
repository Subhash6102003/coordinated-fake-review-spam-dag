import { describe, it, expect, beforeEach } from 'vitest';
import { createReviewSpamPipeline } from '../src/pipeline.js';
import type { ReviewSubmission } from '../src/types.js';

describe('E3 — Coordinated Fake Review Spam Prevention Pipeline', () => {
  let pipeline: ReturnType<typeof createReviewSpamPipeline>;

  beforeEach(() => {
    pipeline = createReviewSpamPipeline();
  });

  const makeReview = (id: string, text: string, overrides: Partial<ReviewSubmission> = {}): ReviewSubmission => ({
    reviewId: `rev-${id}`,
    productId: 'prod-earbuds-x',
    userId: `user-${id}`,
    rating: 5,
    reviewText: text,
    clientIp: '192.168.1.10',
    deviceFingerprint: `dev-${id}`,
    timestamp: Date.now(),
    ...overrides,
  });

  it('allows publication of genuine original review', async () => {
    const res = await pipeline.moderateReview(
      makeReview('1', 'The battery life is decent and sound quality is well balanced for this price.'),
    );

    expect(res.status).toBe('success');
    expect(res.output?.isSpam).toBe(false);
    expect(res.output?.verdict).toBe('PUBLISH');
  });

  it('detects near-duplicate spam text and triggers auto-rejection or quarantine', async () => {
    // 1st review
    await pipeline.moderateReview(
      makeReview('1', 'Outstanding product amazing sound best quality highly recommend buying this now!'),
    );

    // 2nd review from different user, but nearly copied review text
    const dupRes = await pipeline.moderateReview(
      makeReview('2', 'Outstanding product amazing sound best quality highly recommend buying this now immediately!', {
        clientIp: '10.0.0.5',
      }),
    );

    expect(dupRes.status).toBe('success');
    expect(dupRes.output?.isSpam).toBe(true);
    expect(dupRes.output?.flags[0]).toContain('Near-duplicate');
  });

  it('quarantines rapid burst reviews coming from identical /24 subnet', async () => {
    const now = Date.now();

    // Review from IP .15
    await pipeline.moderateReview(
      makeReview('1', 'Good quality headphones nice bass', {
        clientIp: '198.51.100.15',
        timestamp: now,
      }),
    );

    // Rapid review 10 seconds later from IP .22 (same /24 subnet)
    const burstRes = await pipeline.moderateReview(
      makeReview('2', 'Completely different wording about bluetooth pairing', {
        clientIp: '198.51.100.22',
        timestamp: now + 10_000,
      }),
    );

    expect(burstRes.status).toBe('success');
    expect(burstRes.output?.isSpam).toBe(true);
    expect(burstRes.output?.verdict).toBe('QUARANTINE_REVIEW');
  });
});
