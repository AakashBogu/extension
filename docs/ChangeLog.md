# System Changelog

## [5.0.0-module5] - 2026-08-19
### Added
- `ClaimDetectionEngine` top-level real-time claim detection facade.
- `SentenceSegmenter` splitting text into coherent sentences without breaking decimals/abbreviations.
- `ClaimExtractor` and `ClaimNormalizer` normalizing spoken numbers ("five percent" -> "5%", "twenty twenty-four" -> "2024").
- `ClaimCandidateDetector` orchestrating `NumericalClaimDetector`, `TemporalClaimDetector`, `EntityClaimDetector`, `CausalClaimDetector`, `ComparativeClaimDetector`, and `AttributionClaimDetector`.
- `ClaimClassifier` tagging categories (`FACTUAL`, `NUMERICAL`, `TEMPORAL`, `CAUSAL`, `COMPARATIVE`, `ATTRIBUTED`).
- `ClaimVerifiabilityClassifier` classifying verifiability levels (`HIGH`, `MEDIUM`, `LOW`, `NOT_VERIFIABLE`).
- `ClaimConfidenceScorer` computing detection confidence (0.0 - 1.0).
- `ClaimPriorityEngine` calculating processing priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- `ClaimEntityExtractor` extracting numerical and percentage entities.
- `IClaimAnalysisProvider`, `NullClaimAnalysisProvider`, `ClaimAnalysisProviderRegistry`, and `ClaimAnalysisProviderRouter`.
- `TranscriptWindowManager` maintaining rolling context windows over transcript segments.
- `ClaimRegistry` and `ClaimDeduplicationManager` managing claim lifecycles, duplicate merging, and occurrence counts.
- `VerifiableClaim` boundary object feeding Module 6 Fact-Checking Pipeline.
- 24 new EventBus topics (`claim.detection_initialized`, `claim.detection_ready`, `claim.detection_started`, `claim.detection_paused`, `claim.detection_resumed`, `claim.detection_stopped`, `claim.detection_error`, `claim.candidate_detected`, `claim.extracted`, `claim.normalized`, `claim.classified`, `claim.scored`, `claim.queued`, `claim.ready_for_verification`, `claim.duplicate_detected`, `claim.merged`, `claim.priority_changed`, `claim.provider_registered`, `claim.provider_selected`, `claim.provider_failed`, `claim.provider_switched`, `claim.health_changed`, `claim.backpressure`, `claim.processing_dropped`).
- Custom errors (`ClaimDetectionError`, `ClaimCandidateError`, `ClaimExtractionError`, `ClaimNormalizationError`, `ClaimClassificationError`, `ClaimProviderError`, `ClaimRegistryError`, `ClaimDetectionRecoveryError`, `ClaimDetectionTimeoutError`).
- 18 new unit test files across `src/test/claimdetection.test.ts`, `src/test/claimcandidate.test.ts`, `src/test/claimextraction.test.ts`, `src/test/claimnormalization.test.ts`, `src/test/sentence.test.ts`, `src/test/claimclassification.test.ts`, `src/test/claimverifiability.test.ts`, `src/test/claimconfidence.test.ts`, `src/test/claimpriority.test.ts`, `src/test/claimentity.test.ts`, `src/test/claimproviderregistry.test.ts`, `src/test/claimproviderrouter.test.ts`, `src/test/transcriptwindow.test.ts`, `src/test/partialclaim.test.ts`, `src/test/claimregistry.test.ts`, `src/test/claimdeduplication.test.ts`, `src/test/claimhealth.test.ts`, and `src/test/claimrecovery.test.ts` (Total 129 passing tests across 88 test suites).
- Technical documentation in `docs/modules/claim-detection/`.
