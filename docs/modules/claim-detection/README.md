# Real-Time Claim Detection & Extraction Engine - Technical Overview

## Summary
Real-time claim detection and extraction engine consuming Module 4 transcript segments, segmenting sentences, detecting factual claim candidates vs questions/opinions, normalizing spoken numbers/percentages/dates, classifying claim types & verifiability, scoring confidence and priority, extracting entities, deduplicating, and building VerifiableClaim objects for Module 6.

## Components Implemented
- `ClaimDetectionEngine`: Top-level engine orchestrating window manager, detectors, extractor, normalizer, classifiers, priority engine, deduplication, and registry.
- `SentenceSegmenter`: Splits transcript text into sentences preserving decimal numbers and abbreviations.
- `ClaimCandidateDetector`: Specialized signal detectors (`NumericalClaimDetector`, `TemporalClaimDetector`, `EntityClaimDetector`, `CausalClaimDetector`, `ComparativeClaimDetector`, `AttributionClaimDetector`).
- `ClaimExtractor` & `ClaimNormalizer`: Proposition extraction and spoken number/date normalization ("five percent" -> "5%").
- `ClaimClassifier` & `ClaimVerifiabilityClassifier`: Claim category tagging (`FACTUAL`, `NUMERICAL`, `ATTRIBUTED`, etc.) and verifiability level estimation (`HIGH`, `MEDIUM`, `LOW`, `NOT_VERIFIABLE`).
- `ClaimConfidenceScorer` & `ClaimPriorityEngine`: Detection confidence scoring (`0.0` -> `1.0`) and priority ranking (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- `ClaimEntityExtractor`: Extracts numbers, percentages, dates, and currency entities.
- `IClaimAnalysisProvider` & `NullClaimAnalysisProvider`: Pluggable NLP/LLM analysis provider abstraction.
- `ClaimRegistry` & `ClaimDeduplicationManager`: Lifecycle registry and claim deduplication / occurrence tracking.
- `ClaimDetectionHealthMonitor` & `ClaimDetectionRecoveryManager`: Subsystem health monitoring and exponential backoff recovery.
