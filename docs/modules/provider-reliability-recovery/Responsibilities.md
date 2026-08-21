# Provider Reliability / Recovery & Circuit-Breaker Integration - Responsibilities

Maintains circuit state machine per provider (CLOSED, OPEN, HALF_OPEN), blocks admission and routing when OPEN, controls single recovery probe during HALF_OPEN state, and applies exponential backoff on failed probes.
