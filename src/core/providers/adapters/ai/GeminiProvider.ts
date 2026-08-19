import { IAIProvider } from '../../ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderCapabilities, AIProviderHealth } from '../../ai/AIProviderTypes';
import { ProviderType } from '../../ProviderTypes';
import { GeminiConfig } from '../../config/ProviderConfiguration';
import { ProviderConfigurationValidator } from '../../config/ProviderConfigurationValidator';
import { ProviderCredentialManager } from '../../config/ProviderCredentialManager';
import { HttpClient } from '../http/HttpClient';
import { GeminiRequestPayload, GeminiResponsePayload } from './AIProviderAdapterTypes';
import { ProviderResponseError } from '../../../error/ProviderErrors';

export class GeminiProvider implements IAIProvider {
  public readonly id = 'ai.gemini';
  public readonly name = 'Google Gemini AI Adapter';
  public readonly type: ProviderType = 'AI';
  public readonly priority: number;
  public enabled: boolean;

  public readonly capabilities: AIProviderCapabilities = {
    providerId: this.id,
    operations: ['QUERY_GENERATION', 'CLAIM_ANALYSIS', 'SOURCE_ANALYSIS', 'EVIDENCE_SUMMARY'],
    maxContextTokens: 1000000,
    supportsStreaming: false,
    supportsStructuredOutput: true
  };

  private apiKey?: string;

  constructor(
    private config: GeminiConfig,
    private credentialManager?: ProviderCredentialManager
  ) {
    this.enabled = config.enabled;
    this.priority = config.priority;
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return;
    ProviderConfigurationValidator.validateGemini(this.config);
    if (this.credentialManager) {
      this.apiKey = await this.credentialManager.getCredential(this.id, this.config.credentialKey);
    }
  }

  async analyze(request: AIRequest): Promise<AIResponse> {
    if (!this.enabled) {
      throw new ProviderResponseError(`Provider [${this.id}] is disabled`, { providerId: this.id, requestId: request.requestId });
    }

    const apiKey = this.apiKey || (this.credentialManager ? await this.credentialManager.getCredential(this.id, this.config.credentialKey) : 'mock');
    const promptText = typeof request.input === 'string' ? request.input : JSON.stringify(request.input);

    const payload: GeminiRequestPayload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens
      }
    };

    const startTime = Date.now();
    const url = `${this.config.endpoint}/models/${this.config.model}:generateContent?key=${apiKey}`;

    const data = await HttpClient.request<GeminiResponsePayload>({
      url,
      method: 'POST',
      body: payload,
      timeoutMs: request.timeoutMs || this.config.timeoutMs,
      providerId: this.id,
      requestId: request.requestId
    });

    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0 || !parts[0].text) {
      throw new ProviderResponseError(`Provider [${this.id}] returned empty output content`, { providerId: this.id, requestId: request.requestId });
    }

    const content = parts[0].text;
    let structuredOutput: Record<string, unknown> | undefined;

    try {
      structuredOutput = JSON.parse(content);
    } catch (_err) {
      // Non-JSON output is valid text
    }

    return {
      requestId: request.requestId,
      correlationId: request.correlationId,
      providerId: this.id,
      operation: request.operation,
      content,
      structuredOutput,
      confidence: 0.9,
      modelName: this.config.model,
      tokenUsage: data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0
      } : undefined,
      latencyMs: Date.now() - startTime,
      createdAt: Date.now()
    };
  }

  async healthCheck(): Promise<AIProviderHealth> {
    return {
      providerId: this.id,
      status: this.enabled ? 'HEALTHY' : 'UNHEALTHY',
      lastCheckedAt: Date.now()
    };
  }

  destroy(): void {
    this.apiKey = undefined;
  }
}
