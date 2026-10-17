/**
 * Core types for server-side AI Provider Adapter layer.
 * Defined according to docs/architecture/AI_ARCHITECTURE.md.
 *
 * Rules:
 * - AI providers must only be invoked server-side.
 * - Secret API keys must never be leaked to client or logged.
 * - Deterministic validation ensures data integrity before storing into database.
 */

export interface GenerateTextInput {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface GenerateStructuredInput<T> {
  prompt: string;
  systemPrompt?: string;
  schemaDescription: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  validator?: (data: unknown) => data is T;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GenerateTextResult {
  text: string;
  model: string;
  tokenCount?: TokenUsage;
}

export interface GenerateStructuredResult<T> {
  data: T;
  rawText: string;
  model: string;
  tokenCount?: TokenUsage;
}

export interface AIProvider {
  readonly providerName: string;
  readonly defaultModel: string;
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  generateStructuredOutput<T>(input: GenerateStructuredInput<T>): Promise<GenerateStructuredResult<T>>;
}

export interface AIUsageLog {
  userId: string;
  feature: string;
  provider: string;
  model: string;
  promptVersion: string;
  status: 'success' | 'error' | 'fallback';
  latencyMs: number;
  tokenCount?: TokenUsage;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  maxRequests: number;
  retryAfterSeconds?: number;
}
