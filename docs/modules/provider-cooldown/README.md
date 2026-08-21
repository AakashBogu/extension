# Provider Cooldown & Recovery Manager - Technical Overview

## Summary
In-memory metadata-only cooldown state manager evaluating provider failures, Retry-After headers, exponential backoff, and recovery scheduling.

## Components Implemented
- `ProviderCooldownManager`: Main facade managing provider cooldowns, failure classification, and recovery integration.
- `ProviderCooldownEvaluator`: Calculates exponential backoff durations and normalizes Retry-After headers.
- `ProviderCooldownPolicy`: Defines base/max durations, backoff factor, and error trigger flags.
- `ProviderCooldownRecoveryManager`: Manages recovery timers and checks when cooldown recovery is due.
- `ProviderCooldownState`: Data contract defining active cooldown state.
