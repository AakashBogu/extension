import { IAIProvider } from '../../ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderCapabilities, AIProviderHealth } from '../../ai/AIProviderTypes';
import { ProviderType } from '../../ProviderTypes';
import { OpenAIConfig } from '../../config/ProviderConfiguration';
import { ProviderConfigurationValidator } from '../../config/ProviderConfigurationValidator';
import { ProviderCredentialManager } from '../../config/ProviderCredentialManager';
import { HttpClient } from '../http/HttpClient';
import { OpenAIRequestPayload, OpenAIResponsePayload } from './AIProviderAdapterTypes';
import { ProviderResponseError } from '../../../error/ProviderErrors';

export class OpenAIProvider implements IAIProvider {
  public readonly id = 'ai.openai';
  public readonly name = 'OpenAI AI Adapter';
  public readonly type: ProviderType = 'AI';
  public readonly priority: number;
  public enabled: boolean;

  public readonly capabilities: AIProviderCapabilities = {
    providerId: this.id,
    operations: ['QUERY_GENERATION', 'CLAIM_ANALYSIS', 'SOURCE_ANALYSIS', 'EVIDENCE_SUMMARY'],
    maxContextTokens: 128000,
    supportsStreaming: false,
    supportsStructuredOutput: true
  };

  private apiKey?: string;

  constructor(
    private config: OpenAIConfig,
    private credentialManager?: ProviderCredentialManager
  ) {
    this.enabled = config.enabled;
    this.priority = config.priority;
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return;
    ProviderConfigurationValidator.validateOpenAI(this.config);
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
    const messages = [];
    if (request.systemInstructions) {
      messages.push({ role: 'system', content: request.systemInstructions });
    }
    messages.push({ role: 'user', content: promptText });

    const payload: OpenAIRequestPayload = {
      model: this.config.model,
      messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens
    };

    const startTime = Date.now();
    const data = await HttpClient.request<OpenAIResponsePayload>({
      url: `${this.config.endpoint}/chat/completions`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: payload,
      timeoutMs: request.timeoutMs || this.config.timeoutMs,
      providerId: this.id,
      requestId: request.requestId
    });

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      throw new ProviderResponseError(`Provider [${this.id}] returned empty output content`, { providerId: this.id, requestId: request.requestId });
    }

    const content = data.choices[0].message.content;
    let structuredOutput: Record<string, unknown> | undefined;

    try {
      structuredOutput = JSON.parse(content);
    } catch (_) {
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
      tokenUsage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
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
