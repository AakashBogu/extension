import { ProviderRequestError, ProviderResponseError } from '../../../error/ProviderErrors';

export interface HttpRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  providerId: string;
  requestId?: string;
}

export class HttpClient {
  static async request<T>(options: HttpRequestOptions): Promise<T> {
    const { url, method = 'GET', headers = {}, body, timeoutMs = 10000, providerId, requestId } = options;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (_err) {
          // Ignore error text read failure
        }
        const isRetryable = response.status === 429 || response.status >= 500;
        throw new ProviderRequestError(
          `Provider [${providerId}] HTTP ${response.status}: ${response.statusText}`,
          { providerId, requestId, retryable: isRetryable, details: { status: response.status, rawError: errorText.slice(0, 200) } }
        );
      }

      const json = await response.json().catch(err => {
        throw new ProviderResponseError(
          `Provider [${providerId}] returned malformed JSON: ${err.message}`,
          { providerId, requestId }
        );
      });

      return json as T;
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof ProviderRequestError || err instanceof ProviderResponseError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ProviderRequestError(
          `Provider [${providerId}] request timed out after ${timeoutMs}ms`,
          { providerId, requestId, retryable: true }
        );
      }
      throw new ProviderRequestError(
        `Provider [${providerId}] network request failed: ${err instanceof Error ? err.message : String(err)}`,
        { providerId, requestId, retryable: true }
      );
    }
  }
}
