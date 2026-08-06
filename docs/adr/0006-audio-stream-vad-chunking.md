# ADR 0006: Voice Activity Detection (VAD) Audio Chunking

## Status
Accepted

## Context
Manifest V3 architecture restrictions require explicit design trade-offs regarding memory, security, and execution lifecycle.

## Decision
We adopt Voice Activity Detection (VAD) Audio Chunking to achieve optimal performance, security, and developer productivity.

## Consequences
- Clean separation of concerns.
- Well-defined error boundaries.
- Zero host page CSS/JS pollution.
