/**
 * Core types for server-side AI Provider Adapter layer.
 * Defined according to docs/architecture/AI_ARCHITECTURE.md.
 *
 * Rules:
 * - AI providers must only be invoked server-side.
 * - Deterministic validation ensures data integrity before storing into database.
 */

export interface GenerateTextInput {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateStructuredInput<T> {
  prompt: string;
  systemPrompt?: string;
  schemaDescription: string;
  temperature?: number;
  validator?: (data: unknown) => data is T;
}

export interface AIProvider {
  readonly providerName: string;
  generateText(input: GenerateTextInput): Promise<string>;
  generateStructuredOutput<T>(input: GenerateStructuredInput<T>): Promise<T>;
}

export interface AIUsageLog {
  feature: string;
  provider: string;
  model: string;
  promptVersion: string;
  status: 'success' | 'error' | 'fallback';
  latencyMs: number;
  tokenCount?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  errorCode?: string;
}
