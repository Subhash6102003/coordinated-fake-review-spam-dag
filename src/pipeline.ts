import { Pipeline } from './core/index.js';
import type { ReviewSubmission, SpamVerdict } from './types.js';
import { ReviewStore } from './review-store.js';
import { reviewFingerprintStage } from './stages/fingerprint.js';
import { createClusterDetectorStage } from './stages/cluster-detector.js';
import type { Stage, PipelineResult } from './core/index.js';

export function createReviewSpamPipeline(store: ReviewStore = new ReviewStore()) {
  const pipeline = new Pipeline<ReviewSubmission, SpamVerdict>('review-spam-moderation');

  const stages: Stage<unknown, unknown>[] = [
    reviewFingerprintStage as Stage<unknown, unknown>,
    createClusterDetectorStage(store) as Stage<unknown, unknown>,
  ];

  return {
    async moderateReview(submission: ReviewSubmission): Promise<PipelineResult<SpamVerdict>> {
      return pipeline.run(stages, submission);
    },
    store,
  };
}
