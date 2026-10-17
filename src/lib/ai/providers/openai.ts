import type {
  AIProvider,
  GenerateTextInput,
  GenerateTextResult,
  GenerateStructuredInput,
  GenerateStructuredResult,
  TokenUsage,
} from '../types';

export class OpenAIProvider implements AIProvider {
  readonly providerName = 'openai';
  readonly defaultModel: string;
  private readonly apiKey: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.defaultModel = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    if (!this.apiKey) {
      throw new Error('AI_CONFIG_MISSING: OpenAI API key is not configured.');
    }

    const timeoutMs = input.timeoutMs ?? 10000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const messages = [];
    if (input.systemPrompt) {
      messages.push({ role: 'system', content: input.systemPrompt });
    }
    messages.push({ role: 'user', content: input.prompt });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          temperature: input.temperature ?? 0.3,
          max_tokens: input.maxTokens ?? 1024,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('AI_RATE_LIMITED: OpenAI API rate limit exceeded. Please try again later.');
        }
        const errText = await response.text().catch(() => '');
        throw new Error(`AI_PROVIDER_ERROR: OpenAI API responded with status ${response.status}: ${errText}`);
      }

      const json = await response.json();
      const text = json.choices?.[0]?.message?.content || '';

      const tokenCount: TokenUsage | undefined = json.usage
        ? {
            promptTokens: json.usage.prompt_tokens ?? 0,
            completionTokens: json.usage.completion_tokens ?? 0,
            totalTokens: json.usage.total_tokens ?? 0,
          }
        : undefined;

      return {
        text,
        model: this.defaultModel,
        tokenCount,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`AI_TIMEOUT: OpenAI request timed out after ${timeoutMs}ms.`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async generateStructuredOutput<T>(
    input: GenerateStructuredInput<T>
  ): Promise<GenerateStructuredResult<T>> {
    if (!this.apiKey) {
      throw new Error('AI_CONFIG_MISSING: OpenAI API key is not configured.');
    }

    const timeoutMs = input.timeoutMs ?? 10000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const systemPromptWithSchema = `${input.systemPrompt || 'You are an expert English tutor.'}\n\nYou MUST respond with valid JSON matching the following schema description:\n${input.schemaDescription}`;

    const messages = [
      { role: 'system', content: systemPromptWithSchema },
      { role: 'user', content: input.prompt },
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          temperature: input.temperature ?? 0.2,
          max_tokens: input.maxTokens ?? 1500,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('AI_RATE_LIMITED: OpenAI API rate limit exceeded. Please try again later.');
        }
        const errText = await response.text().catch(() => '');
        throw new Error(`AI_PROVIDER_ERROR: OpenAI API responded with status ${response.status}: ${errText}`);
      }

      const json = await response.json();
      const rawText = json.choices?.[0]?.message?.content || '{}';

      const tokenCount: TokenUsage | undefined = json.usage
        ? {
            promptTokens: json.usage.prompt_tokens ?? 0,
            completionTokens: json.usage.completion_tokens ?? 0,
            totalTokens: json.usage.total_tokens ?? 0,
          }
        : undefined;

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        throw new Error(`AI_PARSE_ERROR: Failed to parse OpenAI response as JSON: ${rawText}`);
      }

      if (input.validator && !input.validator(parsed)) {
        throw new Error(`AI_OUTPUT_VALIDATION_ERROR: OpenAI JSON output did not satisfy the required schema.`);
      }

      return {
        data: parsed as T,
        rawText,
        model: this.defaultModel,
        tokenCount,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`AI_TIMEOUT: OpenAI request timed out after ${timeoutMs}ms.`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
