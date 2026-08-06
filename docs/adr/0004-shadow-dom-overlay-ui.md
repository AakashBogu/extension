# ADR 0004: Shadow DOM Encapsulated Web Components for Overlay UI

## Status
Accepted

## Context
Manifest V3 architecture restrictions require explicit design trade-offs regarding memory, security, and execution lifecycle.

## Decision
We adopt Shadow DOM Encapsulated Web Components for Overlay UI to achieve optimal performance, security, and developer productivity.

## Consequences
- Clean separation of concerns.
- Well-defined error boundaries.
- Zero host page CSS/JS pollution.
