/**
 * AI Adapter Layer (Phase 5 — AI Tutor Foundation)
 *
 * Rules:
 * - Frontend components must NEVER call AI adapters directly.
 * - All AI operations run server-side only.
 * - Secret keys are never exposed to client bundles.
 */

import type { AIProvider } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { MockAIProvider } from './providers/mock';

export * from './types';
export * from './providers/gemini';
export * from './providers/openai';
export * from './providers/mock';
export * from './rate-limiter';
export * from './usage-logger';

/**
 * Returns an instance of the configured AI provider.
 * Falls back to MockAIProvider when in test mode or when no API keys are present.
 */
export function getAIProvider(preferredProvider?: string): AIProvider {
  const provider = preferredProvider || process.env.AI_PROVIDER || 'gemini';

  if (provider === 'mock' || process.env.NODE_ENV === 'test') {
    return new MockAIProvider();
  }

  if (provider === 'gemini') {
    if (process.env.GEMINI_API_KEY) {
      return new GeminiProvider();
    }
    // If Gemini key missing but OpenAI key exists, fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      return new OpenAIProvider();
    }
    // Otherwise fallback to Mock provider for local dev without crashing
    return new MockAIProvider();
  }

  if (provider === 'openai') {
    if (process.env.OPENAI_API_KEY) {
      return new OpenAIProvider();
    }
    // If OpenAI key missing but Gemini key exists, fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
      return new GeminiProvider();
    }
    return new MockAIProvider();
  }

  return new MockAIProvider();
}
