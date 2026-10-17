import { createAdminClient } from '@/lib/supabase/admin';
import type { AIUsageLog } from './types';

/**
 * Persists AI usage and performance telemetry to public.ai_generations.
 *
 * Rules:
 * - Never log secret API keys, authorization headers, or full sensitive learner profiles.
 * - Failures in telemetry logging must never crash the application or fail the learner request.
 */
function sanitizeSecretString(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]')
    .replace(/sk-[0-9A-Za-z-_]{20,}/g, '[REDACTED_KEY]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED_TOKEN]');
}

export function sanitizeMetadataValue(val: unknown): unknown {
  if (typeof val === 'string') {
    return sanitizeSecretString(val);
  }
  if (Array.isArray(val)) {
    return val.map((v) => sanitizeMetadataValue(v));
  }
  if (val !== null && typeof val === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      const lowerKey = k.toLowerCase();
      if (
        lowerKey.includes('key') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('auth')
      ) {
        continue;
      }
      sanitizedObj[k] = sanitizeMetadataValue(v);
    }
    return sanitizedObj;
  }
  return val;
}

/**
 * Persists AI usage and performance telemetry to public.ai_generations.
 *
 * Rules:
 * - Never log secret API keys, authorization headers, or full sensitive learner profiles.
 * - Failures in telemetry logging must never crash the application or fail the learner request.
 */
export async function logAIUsage(log: AIUsageLog): Promise<void> {
  // Sanitize metadata to prevent accidental leaks of sensitive fields
  const safeMetadata: Record<string, unknown> = {};
  if (log.metadata) {
    for (const [key, val] of Object.entries(log.metadata)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('key') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('auth')
      ) {
        continue;
      }
      safeMetadata[key] = sanitizeMetadataValue(val);
    }
  }

  const safeErrorCode = log.errorCode ? sanitizeSecretString(log.errorCode) : null;

  try {
    const adminClient = createAdminClient();
    await adminClient.from('ai_generations').insert({
      user_id: log.userId,
      feature: log.feature,
      provider: log.provider,
      model: log.model,
      prompt_version: log.promptVersion,
      status: log.status,
      latency_ms: Math.max(0, Math.round(log.latencyMs)),
      prompt_tokens: log.tokenCount?.promptTokens ?? null,
      completion_tokens: log.tokenCount?.completionTokens ?? null,
      total_tokens: log.tokenCount?.totalTokens ?? null,
      error_code: safeErrorCode,
      metadata: safeMetadata,
    });
  } catch (err) {
    // Graceful degradation: Telemetry failure must never disrupt learning
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AI Usage Logger Warning]: Could not persist AI generation log to database:', err);
    }
  }
}
