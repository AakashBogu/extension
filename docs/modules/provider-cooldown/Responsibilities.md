# Provider Cooldown & Recovery Manager - Responsibilities

Maintains provider cooldown states, derives cooldowns from errors and Retry-After headers, applies exponential backoff, filters candidate providers in routers, and blocks admission during active cooldowns.
