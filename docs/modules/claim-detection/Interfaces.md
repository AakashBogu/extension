# Real-Time Claim Detection & Extraction Engine - Interfaces & Type Contracts

```typescript
export interface VerifiableClaim {
  claimId: string;
  text: string;
  normalizedText: string;
  classification: ClaimTypeCategory[];
  verifiability: ClaimVerifiabilityLevel;
  confidence: number;
  priority: ClaimPriorityLevel;
  entities: ClaimEntity[];
  provenance: ClaimProvenance;
  timestamps: {
    startTime: number;
    endTime: number;
  };
  occurrenceCount: number;
}
```
