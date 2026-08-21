export interface ProviderRoutingDecision {
  readonly providerId: string;
  readonly requestType: 'AI' | 'SEARCH';
  readonly routingScore: number;
  readonly healthScore: number;
  readonly priority: number;
  readonly latencyScore: number;
  readonly reliabilityScore: number;
  readonly quotaScore: number;
  readonly rateLimitScore: number;
  readonly cooldownPenalty: number;
  readonly explorationBonus: number;
  readonly adaptiveAdjustment: number;
  readonly stickinessBonus: number;
  readonly finalScore: number;
  readonly decisionReason: string;
  readonly timestamp: number;
}
