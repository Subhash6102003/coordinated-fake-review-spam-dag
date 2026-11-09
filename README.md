# Coordinated Fake Review Spam Prevention & Quarantine DAG

> 3-gram text shingling, Jaccard similarity clustering, and /24 subnet temporal burst quarantine before product rating distortion.

[![CI Build](https://github.com/Subhash6102003/coordinated-fake-review-spam-dag/actions/workflows/ci.yml/badge.svg)](https://github.com/Subhash6102003/coordinated-fake-review-spam-dag/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Vitest](https://img.shields.io/badge/Vitest-2.1-green?logo=vitest)
![Architecture](https://img.shields.io/badge/System%20Design-Production%20Grade-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## 📌 Domain & Context
**Domain:** E-Commerce / Trust & Content Moderation  
**Architecture Pattern:** Typed Stage-based Pipeline DAG with Sagas & State Machine  

---

## 💥 The Real-World Problem

Rogue sellers and paid rings coordinate bot accounts and review syndicates to flood product listings with fake 5-star reviews or review-bomb competitors.

These accounts bypass simple exact-string deduplication by introducing minor paraphrasing, rotating through proxies within the same ISP subnet, or sharing common device signatures.

### The Naive Failure Mode
```
+---------------------------------------------------------------------------------------+
|                    NAIVE STRING MATCHING: THE PARAPHRASE ESCAPE                       |
+---------------------------------------------------------------------------------------+
  Review 1: "Outstanding product amazing sound best quality highly recommend buying!"
  Review 2: "Outstanding product amazing sound best quality highly recommend buying now!"
  
  Naive Exact String Filter: Review 1 != Review 2
  RESULT: Both reviews pass filter and corrupt the product star rating!
+---------------------------------------------------------------------------------------+
```

---

## 🏛️ System Design Pipeline Architecture

This repository implements a modular, typed DAG pipeline where each stage has explicit preconditions, execution contracts, and compensating rollback handlers.

```
+---------------------------------------------------------------------------------------------------------+
|                                    MODERATION PIPELINE DAG ARCHITECTURE                                 |
+---------------------------------------------------------------------------------------------------------+

  [Incoming Review Submission]
             |
             v
  +-----------------------------------------+
  | 1. Text Shingle & Network Fingerprint   |
  |  - Tokenizes text into 3-word shingles  |
  |  - Extracts /24 CIDR Subnet             |
  +-----------------------------------------+
             | Shingle Set & Subnet ID
             v
  +-----------------------------------------+
  | 2. Coordinated Cluster Detector         |
  |  - Computes Jaccard Similarity          |
  |  - Subnet Burst Temporal Density Check  |
  +-----------------------------------------+
             |
             +---> Calculated Spam Score (0 - 100)
                     |
                     |-- Score < 30 --> [ PUBLISH ] (Display immediately)
                     |-- Score 30-59 -> [ QUARANTINE_REVIEW ] (Held for audit)
                     +-- Score >= 60 -> [ AUTO_REJECT ] (Permanently blocked)
```

---

## 🔄 Distributed Saga & Rollback Mechanics

```
+---------------------------------------------------------------------------------------+
|                         JACCARD SHINGLE SIMILARITY METRIC                             |
+---------------------------------------------------------------------------------------+
  Jaccard Similarity = |Shingles(A) ∩ Shingles(B)| / |Shingles(A) ∪ Shingles(B)|
  Threshold: >= 0.65 (65% overlap) automatically flags review as coordinated spam!
+---------------------------------------------------------------------------------------+
```

---

## 📊 Live Concurrency Simulation Output

Every pipeline includes an automated concurrency load test that proves race condition resistance:

```
===================================================================================
              COORDINATED REVIEW SPAM DETECTION SIMULATION
===================================================================================
[2026-11-10T02:46:19.509Z] [INFO] [pipeline] Genuine Review (Original wording) -> PUBLISH
[2026-11-10T02:46:19.512Z] [WARN] [pipeline] Coordinated Paraphrased Review detected:
  Jaccard Similarity:     90% overlap with previous submission
  Spam Verdict:           QUARANTINE_REVIEW (Blocked from live storefront)
[2026-11-10T02:46:19.513Z] [WARN] [pipeline] Bursty submission from shared 198.51.100.0/24 subnet:
  Temporal Delta:         10 seconds
  Spam Verdict:           QUARANTINE_REVIEW (Bot ring flagged)
===================================================================================
```

---

## ⚡ Architectural Comparison

| Defense Layer | Basic Keyword / Exact Hash | SystemFlow Shingle DAG |
|---|:---:|:---:|
| **Paraphrased Review Text** | ❌ Bypassed | **✅ Detected via Jaccard 3-gram Shingling** |
| **Rotating Proxy Farms** | ❌ Missed | **✅ Caught via CIDR /24 Subnet Clustering** |
| **Device Fingerprint Reuse** | ❌ Missed | **✅ Hard-blocked via device token tracking** |
| **Impact on Storefront** | Rating distorted | **Pre-publish quarantine prevents distortion** |

---

## 📁 Repository Structure

```
coordinated-fake-review-spam-dag/
├── .github/
│   └── workflows/
│       └── ci.yml             # Automated GitHub Actions test & build workflow
├── src/
│   ├── core/                  # Embedded zero-dependency Pipeline DAG engine
│   │   ├── pipeline.ts        # Linear & DAG stage executor with reverse rollback
│   │   ├── types.ts           # Pipeline context & event streaming types
│   │   ├── logger.ts          # Structured ISO logger
│   │   └── errors.ts          # Domain typed errors
│   ├── stages/                # Granular pipeline stages
│   ├── pipeline.ts            # Stage composition & pipeline instantiation
│   ├── types.ts               # Domain-specific state models & contracts
│   └── index.ts               # Library entry point
├── tests/
│   └── pipeline.test.ts       # Race condition & unit test suite
├── docs/
│   └── ARCHITECTURE.md        # Technical deep dive & design choices
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js >= 22.0.0
- npm or pnpm

### Installation

```bash
# Clone this repository
git clone https://github.com/Subhash6102003/coordinated-fake-review-spam-dag.git
cd coordinated-fake-review-spam-dag

# Install dependencies
npm install
```

### Running Tests & Verification

```bash
# Run complete test suite (includes concurrent race condition simulations)
npm test

# Build production TypeScript output
npm run build

# Run typechecker
npm run typecheck
```

---

## 📄 License
MIT License. Crafted with zero slop for production systems.
