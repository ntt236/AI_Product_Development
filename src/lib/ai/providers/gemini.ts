import type {
  AIProvider,
  GenerateTextInput,
  GenerateTextResult,
  GenerateStructuredInput,
  GenerateStructuredResult,
  TokenUsage,
} from '../types';

export class GeminiProvider implements AIProvider {
  readonly providerName = 'gemini';
  readonly defaultModel: string;
  private readonly apiKey: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.defaultModel = model || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    if (!this.apiKey) {
      throw new Error('AI_CONFIG_MISSING: Gemini API key is not configured.');
    }

    const timeoutMs = input.timeoutMs ?? 25000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.defaultModel}:generateContent?key=${this.apiKey}`;

    const body: Record<string, unknown> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: input.prompt }],
        },
      ],
      generationConfig: {
        temperature: input.temperature ?? 0.3,
        maxOutputTokens: input.maxTokens ?? 1024,
      },
    };

    if (input.systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: input.systemPrompt }],
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('AI_RATE_LIMITED: Gemini API rate limit exceeded. Please try again later.');
        }
        const errText = await response.text().catch(() => '');
        throw new Error(`AI_PROVIDER_ERROR: Gemini API responded with status ${response.status}: ${errText}`);
      }

      const json = await response.json();
      const candidate = json.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || '';

      const tokenCount: TokenUsage | undefined = json.usageMetadata
        ? {
            promptTokens: json.usageMetadata.promptTokenCount ?? 0,
            completionTokens: json.usageMetadata.candidatesTokenCount ?? 0,
            totalTokens: json.usageMetadata.totalTokenCount ?? 0,
          }
        : undefined;

      return {
        text,
        model: this.defaultModel,
        tokenCount,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`AI_TIMEOUT: Gemini request timed out after ${timeoutMs}ms.`);
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
      throw new Error('AI_CONFIG_MISSING: Gemini API key is not configured.');
    }

    const timeoutMs = input.timeoutMs ?? 25000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.defaultModel}:generateContent?key=${this.apiKey}`;

    const promptWithSchema = `${input.prompt}\n\nIMPORTANT: You MUST respond ONLY with valid JSON conforming to this schema:\n${input.schemaDescription}`;

    const body: Record<string, unknown> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: promptWithSchema }],
        },
      ],
      generationConfig: {
        temperature: input.temperature ?? 0.2,
        maxOutputTokens: input.maxTokens ?? 1500,
        responseMimeType: 'application/json',
      },
    };

    if (input.systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: input.systemPrompt }],
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('AI_RATE_LIMITED: Gemini API rate limit exceeded. Please try again later.');
        }
        const errText = await response.text().catch(() => '');
        throw new Error(`AI_PROVIDER_ERROR: Gemini API responded with status ${response.status}: ${errText}`);
      }

      const json = await response.json();
      const candidate = json.candidates?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text || '';

      const tokenCount: TokenUsage | undefined = json.usageMetadata
        ? {
            promptTokens: json.usageMetadata.promptTokenCount ?? 0,
            completionTokens: json.usageMetadata.candidatesTokenCount ?? 0,
            totalTokens: json.usageMetadata.totalTokenCount ?? 0,
          }
        : undefined;

      // Clean markdown code blocks if Gemini returns ```json ... ```
      let cleanedText = rawText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      // Robustly slice from first JSON open bracket/brace to last
      const firstBrace = cleanedText.indexOf('{');
      const firstBracket = cleanedText.indexOf('[');
      let startIdx = -1;
      let endIdx = -1;
      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        endIdx = cleanedText.lastIndexOf('}');
      } else if (firstBracket !== -1) {
        startIdx = firstBracket;
        endIdx = cleanedText.lastIndexOf(']');
      }
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleanedText = cleanedText.substring(startIdx, endIdx + 1);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleanedText);
      } catch {
        throw new Error(`AI_PARSE_ERROR: Failed to parse Gemini response as JSON: ${rawText}`);
      }

      if (input.validator && !input.validator(parsed)) {
        throw new Error(`AI_OUTPUT_VALIDATION_ERROR: Gemini JSON output did not satisfy the required schema.`);
      }

      return {
        data: parsed as T,
        rawText,
        model: this.defaultModel,
        tokenCount,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`AI_TIMEOUT: Gemini request timed out after ${timeoutMs}ms.`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
