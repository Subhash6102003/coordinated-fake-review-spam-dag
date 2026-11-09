# Coordinated Fake Review Spam Prevention & Quarantine DAG

> 3-gram text shingling, Jaccard similarity clustering, and /24 subnet temporal burst quarantine before product rating distortion.

**Domain:** E-Commerce / Content Moderation  
**Architecture Pattern:** Typed Stage-based Pipeline DAG with Sagas & State Machine  

---

# E3 — Coordinated Review Spam Prevention: Architecture

## Problem

Sellers coordinate black-hat review campaigns using paid rings or bot farms:
Multiple accounts submit 5-star reviews (or 1-star review-bombs against competitors) using slight paraphrasing, common device IDs, or rotating proxies within the same ISP/IP subnet.

## Solution Architecture: Shingling + Subnet Clustering Quarantine DAG

```
Review Submission
       ↓
[1. Text Shingling & Network Hash]  → Deconstructs text into 3-word shingles & /24 subnet
       ↓
[2. Cluster Detector & Scorer]     → Calculates Jaccard similarity & temporal subnet burst density
       ↓
[3. Pre-Publish Quarantine Gate]
    ├── Genuine Review     → PUBLISH
    ├── Moderate Suspicion → QUARANTINE_REVIEW (held for human moderation)
    └── Coordinated Attack → AUTO_REJECT (never displayed on storefront)
```


---

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 22.0.0
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/systemflow-e3-review-spam.git
cd systemflow-e3-review-spam

# Install dependencies
npm install
```

### Running Tests & Typechecks

```bash
# Run the complete test suite (includes race condition & concurrency tests)
npm test

# Build production TypeScript output
npm run build

# Run typechecker
npm run typecheck
```

---

## 🏛️ Pipeline DAG Architecture

All pipeline stages are type-safe and execute in ordered succession. If any stage throws a transient error, compensating saga rollbacks run in reverse order to ensure 100% data consistency.

```
src/
├── core/                  # Embedded zero-dependency Pipeline Engine & Saga Rollback
│   ├── pipeline.ts
│   ├── types.ts
│   ├── logger.ts
│   └── errors.ts
├── stages/                # Modular pipeline stages
├── pipeline.ts            # Stage assembly & DAG orchestrator
├── types.ts               # Domain interfaces & state contracts
└── index.ts               # Public library API export
```

---

## 🚀 GitHub Actions CI

Every commit and pull request runs automated build, typecheck, and vitest race condition tests via `.github/workflows/ci.yml`.

## 📄 License
MIT
