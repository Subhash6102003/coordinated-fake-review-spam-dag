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
