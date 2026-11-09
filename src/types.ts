export interface ReviewSubmission {
  reviewId: string;
  productId: string;
  userId: string;
  rating: number; // 1 - 5
  reviewText: string;
  clientIp: string;
  deviceFingerprint: string;
  timestamp: number;
}

export interface ReviewFingerprint {
  reviewId: string;
  productId: string;
  shingles: Set<string>;
  ipSubnet: string; // /24 CIDR prefix
  deviceFingerprint: string;
  timestamp: number;
}

export interface SpamVerdict {
  reviewId: string;
  productId: string;
  isSpam: boolean;
  spamScore: number; // 0 - 100
  verdict: 'PUBLISH' | 'QUARANTINE_REVIEW' | 'AUTO_REJECT';
  flags: string[];
}
