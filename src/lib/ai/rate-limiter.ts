import { createAdminClient } from '@/lib/supabase/admin';
import type { RateLimitCheckResult } from './types';

// In-memory fallback bucket for development/testing when database RPC is unavailable
const memoryBuckets = new Map<string, { windowStartMs: number; count: number }>();

export interface RateLimiterOptions {
  windowSeconds?: number;
  maxRequests?: number;
}

const DEFAULT_WINDOW_SECONDS = 300; // 5 minutes
const DEFAULT_MAX_REQUESTS = 10;    // 10 requests per 5 minutes

/**
 * Server-side rate limiter for AI operations.
 * Scoped strictly to authenticated users.
 */
export async function checkAIRateLimit(
  userId: string,
  options?: RateLimiterOptions
): Promise<RateLimitCheckResult> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return {
      allowed: false,
      currentCount: 0,
      maxRequests: 0,
      retryAfterSeconds: 60,
    };
  }

  const cleanUserId = userId.trim();
  const windowSeconds = Math.max(1, options?.windowSeconds ?? DEFAULT_WINDOW_SECONDS);
  const maxRequests = Math.max(1, options?.maxRequests ?? DEFAULT_MAX_REQUESTS);

  const nowMs = Date.now();
  const windowMs = windowSeconds * 1000;
  const currentWindowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const windowStartIso = new Date(currentWindowStartMs).toISOString();

  // 1. Try atomic PostgreSQL RPC check_and_increment_ai_rate_limit
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.rpc('check_and_increment_ai_rate_limit', {
      p_user_id: cleanUserId,
      p_window_start: windowStartIso,
      p_max_requests: maxRequests,
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      const row = data[0];
      const count = Number(row.current_count) || 1;
      const allowed = Boolean(row.allowed);
      const retryAfterSeconds = allowed ? 0 : Math.ceil((currentWindowStartMs + windowMs - nowMs) / 1000);

      return {
        allowed,
        currentCount: count,
        maxRequests,
        retryAfterSeconds,
      };
    }

    if (error && process.env.NODE_ENV === 'development') {
      console.warn('[AI Rate Limiter Warning]: RPC check_and_increment_ai_rate_limit returned error, using fallback:', error.message);
    }
  } catch (rpcErr) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AI Rate Limiter Warning]: RPC invocation failed, falling back to in-memory bucket:', rpcErr);
    }
  }

  // 2. In-Memory fallback implementation (per-node protection)
  const bucket = memoryBuckets.get(cleanUserId);

  if (!bucket || bucket.windowStartMs !== currentWindowStartMs) {
    memoryBuckets.set(cleanUserId, {
      windowStartMs: currentWindowStartMs,
      count: 1,
    });
    return {
      allowed: true,
      currentCount: 1,
      maxRequests,
      retryAfterSeconds: 0,
    };
  }

  bucket.count += 1;
  const allowed = bucket.count <= maxRequests;
  const retryAfterSeconds = allowed ? 0 : Math.ceil((currentWindowStartMs + windowMs - nowMs) / 1000);

  return {
    allowed,
    currentCount: bucket.count,
    maxRequests,
    retryAfterSeconds,
  };
}

/**
 * Resets the in-memory rate limit bucket (useful for unit testing).
 */
export function resetInMemoryRateLimits(): void {
  memoryBuckets.clear();
}
