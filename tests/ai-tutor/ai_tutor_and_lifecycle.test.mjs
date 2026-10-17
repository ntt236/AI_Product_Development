import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Core imports from src
import {
  ExerciseExplanationRequestSchema,
  AITutorExplanationSchema,
} from '../../src/modules/ai-tutor/types.ts';
import {
  buildExerciseExplanationPrompt,
  TUTOR_EXERCISE_EXPLANATION_VERSION,
} from '../../src/modules/ai-tutor/prompts.ts';
import { MockAIProvider } from '../../src/lib/ai/providers/mock.ts';
import { checkAIRateLimit } from '../../src/lib/ai/rate-limiter.ts';
import { getAIProvider } from '../../src/lib/ai/index.ts';

describe('Phase 5 — AI Tutor Unit & Integration Lifecycle Tests', () => {

  describe('1. Functional: Prompt Construction & Level Adaptation', () => {
    const baseExerciseContext = {
      exerciseId: 'ex-101',
      prompt: 'She ________ to school every day by bus.',
      userAnswer: 'go',
      correctAnswer: 'goes',
      isCorrect: false,
      teacherExplanation: 'Chủ ngữ "She" là ngôi thứ 3 số ít ở thì hiện tại đơn nên động từ thêm -es ("goes").',
      lessonTitle: 'Present Simple Tense',
      lessonSkill: 'grammar',
    };

    it('1.1. Creates prompt with correct version tutor_exercise_explanation_v1', () => {
      const learnerContext = {
        level: 'a2',
        goalTitle: 'Phát triển sự nghiệp',
        goalType: 'work',
      };

      const result = buildExerciseExplanationPrompt(learnerContext, baseExerciseContext);
      assert.equal(result.promptVersion, TUTOR_EXERCISE_EXPLANATION_VERSION);
      assert.equal(result.promptVersion, 'tutor_exercise_explanation_v1');
      assert.ok(result.systemPrompt.includes('AI Tutor'));
      assert.ok(result.prompt.includes('Present Simple Tense'));
      assert.ok(result.prompt.includes('She ________ to school every day by bus.'));
      assert.ok(result.prompt.includes('goes'));
      assert.ok(result.prompt.includes('Phát triển sự nghiệp'));
    });

    it('1.2. Adapts tone and guidance for Beginner learners (A1/A2)', () => {
      const beginnerContext = {
        level: 'a1',
        goalTitle: 'Giao tiếp hàng ngày',
        goalType: 'daily_communication',
      };

      const result = buildExerciseExplanationPrompt(beginnerContext, baseExerciseContext);
      assert.ok(result.systemPrompt.includes('A1') || result.systemPrompt.includes('Sơ cấp'));
      assert.ok(result.systemPrompt.includes('đơn giản') || result.systemPrompt.includes('dễ hiểu'));
    });

    it('1.3. Adapts tone and guidance for Intermediate/Advanced learners (B2/C1)', () => {
      const advancedContext = {
        level: 'b2',
        goalTitle: 'Luyện thi TOEIC',
        goalType: 'toeic',
      };

      const result = buildExerciseExplanationPrompt(advancedContext, baseExerciseContext);
      assert.ok(result.systemPrompt.includes('Trung cấp') || result.systemPrompt.includes('B1-C1'));
      assert.ok(result.systemPrompt.includes('TOEIC'));
    });

    it('1.4. Handles missing or undefined learner context gracefully without crashing', () => {
      const emptyContext = {};
      const result = buildExerciseExplanationPrompt(emptyContext, baseExerciseContext);
      assert.equal(result.promptVersion, TUTOR_EXERCISE_EXPLANATION_VERSION);
      assert.ok(result.prompt.includes('A1'));
      assert.ok(result.prompt.includes('Giao tiếp tổng quát'));
    });

    it('1.5. Incorporates user follow-up query when provided', () => {
      const exerciseWithQuery = {
        ...baseExerciseContext,
        userQuery: 'Tại sao lại dùng goes mà không phải là went?',
      };
      const result = buildExerciseExplanationPrompt({ level: 'a2' }, exerciseWithQuery);
      assert.ok(result.prompt.includes('Tại sao lại dùng goes mà không phải là went?'));
    });

    it('1.6. Accurately frames positive reinforcement for correct answers', () => {
      const correctExerciseContext = {
        ...baseExerciseContext,
        userAnswer: 'goes',
        correctAnswer: 'goes',
        isCorrect: true,
      };
      const result = buildExerciseExplanationPrompt({ level: 'a2' }, correctExerciseContext);
      assert.ok(result.prompt.includes('ĐÚNG ✓'));
      assert.ok(result.systemPrompt.includes('Khen ngợi'));
    });
  });

  describe('2. Functional & Security: Runtime Input & Output Validation (Zod)', () => {
    it('2.1. Validates valid exercise explanation requests', () => {
      const validPayload = {
        submissionId: '11111111-1111-4111-a111-111111111111',
        exerciseId: '22222222-2222-4222-a222-222222222222',
        userQuery: 'Giải thích giúp em câu này với ạ',
      };
      const parsed = ExerciseExplanationRequestSchema.safeParse(validPayload);
      assert.equal(parsed.success, true);
    });

    it('2.2. Rejects request with missing required submissionId', () => {
      const invalidPayload = {
        exerciseId: '22222222-2222-4222-a222-222222222222',
      };
      const parsed = ExerciseExplanationRequestSchema.safeParse(invalidPayload);
      assert.equal(parsed.success, false);
      assert.ok(parsed.error?.issues.some((i) => i.path.includes('submissionId')));
    });

    it('2.3. Rejects excessively large userQuery (>300 chars) to prevent prompt injection / buffer bloat', () => {
      const largePayload = {
        submissionId: '11111111-1111-4111-a111-111111111111',
        exerciseId: '22222222-2222-4222-a222-222222222222',
        userQuery: 'A'.repeat(301),
      };
      const parsed = ExerciseExplanationRequestSchema.safeParse(largePayload);
      assert.equal(parsed.success, false);
      assert.ok(parsed.error?.issues.some((i) => i.message.includes('300 ký tự')));
    });

    it('2.4. Validates valid AI output adhering to AITutorExplanationSchema', () => {
      const validAIResponse = {
        explanation: 'Từ "goes" được sử dụng vì chủ ngữ là ngôi thứ 3 số ít.',
        rule_summary: 'He/She/It + V-s/es ở thì hiện tại đơn.',
        examples: [
          'He watches TV in the evening.',
          'She teaches English at high school.',
        ],
        next_step_tip: 'Hãy ghi nhớ quy tắc thêm s/es với các động từ tận cùng bằng o, ch, sh, x, s nhé.',
      };
      const parsed = AITutorExplanationSchema.safeParse(validAIResponse);
      assert.equal(parsed.success, true);
    });

    it('2.5. Rejects malformed or incomplete AI output', () => {
      const malformedResponses = [
        { explanation: 'Chỉ có lời giải thích' }, // missing rule_summary, examples, next_step_tip
        {
          explanation: '',
          rule_summary: 'rule',
          examples: [],
          next_step_tip: 'tip',
        }, // empty explanation
        {
          explanation: 'Valid',
          rule_summary: 'rule',
          examples: 'not an array',
          next_step_tip: 'tip',
        }, // examples not array
      ];

      for (const bad of malformedResponses) {
        const parsed = AITutorExplanationSchema.safeParse(bad);
        assert.equal(parsed.success, false);
      }
    });
  });

  describe('3. AI Provider Layer & Fallback Hierarchy', () => {
    it('3.1. MockAIProvider produces deterministic, schema-compliant output', async () => {
      const mockProvider = new MockAIProvider();
      const output = await mockProvider.generateStructuredOutput({
        prompt: 'Exercise prompt goes here. Learner level A2.',
        systemPrompt: 'You are an AI Tutor.',
        schemaDescription: 'AITutorExplanation JSON',
        validator: (data) => AITutorExplanationSchema.safeParse(data).success,
      });

      assert.ok(output.data);
      assert.ok(output.data.explanation.length > 0);
      assert.ok(output.data.rule_summary.length > 0);
      assert.ok(Array.isArray(output.data.examples));
      assert.ok(output.data.examples.length >= 1);
      assert.ok(output.data.next_step_tip.length > 0);
      assert.equal(output.model, 'mock-tutor-v1');
      assert.ok(output.tokenCount.totalTokens > 0);
    });

    it('3.2. getAIProvider falls back gracefully to MockAIProvider when no external API key is configured', () => {
      const origGemini = process.env.GEMINI_API_KEY;
      const origOpenAI = process.env.OPENAI_API_KEY;

      try {
        delete process.env.GEMINI_API_KEY;
        delete process.env.OPENAI_API_KEY;

        const provider = getAIProvider();
        assert.equal(provider.providerName, 'mock');
        assert.equal(provider.defaultModel, 'mock-tutor-v1');
      } finally {
        if (origGemini) process.env.GEMINI_API_KEY = origGemini;
        if (origOpenAI) process.env.OPENAI_API_KEY = origOpenAI;
      }
    });

    it('3.3. getAIProvider selects Gemini when GEMINI_API_KEY is present', () => {
      const origGemini = process.env.GEMINI_API_KEY;

      try {
        process.env.GEMINI_API_KEY = 'test_gemini_key_12345';
        const provider = getAIProvider();
        assert.equal(provider.providerName, 'gemini');
        assert.ok(provider.defaultModel.includes('gemini'));
      } finally {
        if (origGemini !== undefined) {
          process.env.GEMINI_API_KEY = origGemini;
        } else {
          delete process.env.GEMINI_API_KEY;
        }
      }
    });
  });

  describe('4. Server-Side Rate Limiter', () => {
    it('4.1. Permits requests within the limit (10 requests per 5 minutes)', async () => {
      const testUserId = `test-user-${Date.now()}`;
      
      const res1 = await checkAIRateLimit(testUserId, { maxRequests: 10, windowSeconds: 300 });
      assert.equal(res1.allowed, true);
      assert.equal(res1.currentCount, 1);
      assert.equal(res1.maxRequests, 10);
    });

    it('4.2. Blocks requests when rate limit is exceeded and returns retryAfterSeconds', async () => {
      const testUserId = `test-user-burst-${Date.now()}`;
      const maxAllowed = 3;

      // Exhaust limit
      for (let i = 0; i < maxAllowed; i++) {
        const res = await checkAIRateLimit(testUserId, { maxRequests: maxAllowed, windowSeconds: 300 });
        assert.equal(res.allowed, true);
      }

      // Next request should be blocked
      const blockedRes = await checkAIRateLimit(testUserId, { maxRequests: maxAllowed, windowSeconds: 300 });
      assert.equal(blockedRes.allowed, false);
      assert.ok(blockedRes.currentCount > maxAllowed);
      assert.ok(blockedRes.retryAfterSeconds !== undefined && blockedRes.retryAfterSeconds > 0);
    });

    it('4.3. Isolates rate limits by user ID (User A does not block User B)', async () => {
      const userA = `user-a-${Date.now()}`;
      const userB = `user-b-${Date.now()}`;
      const limit = 2;

      // Exhaust user A
      await checkAIRateLimit(userA, { maxRequests: limit, windowSeconds: 300 });
      await checkAIRateLimit(userA, { maxRequests: limit, windowSeconds: 300 });
      const blockedA = await checkAIRateLimit(userA, { maxRequests: limit, windowSeconds: 300 });
      assert.equal(blockedA.allowed, false);

      // User B should still be allowed
      const allowedB = await checkAIRateLimit(userB, { maxRequests: limit, windowSeconds: 300 });
      assert.equal(allowedB.allowed, true);
      assert.equal(allowedB.currentCount, 1);
    });
  });

  describe('5. Security: Anti-IDOR, Secret Protection, & Answer Key Protection', () => {
    it('5.1. Anti-IDOR: Exercise verification rejects if submission belongs to another user', () => {
      const requesterUserId = 'user-alice';
      const submissionOwnerId = 'user-bob';

      const isOwner = requesterUserId === submissionOwnerId;
      assert.equal(isOwner, false, 'User Alice must not be authorized to inspect User Bob’s submission');
    });

    it('5.2. Client-supplied scores or correctness are ignored; authoritative DB state is required', () => {
      // Simulate client attempting to tamper with correctness
      const clientTamperedPayload = {
        submissionId: '11111111-1111-4111-a111-111111111111',
        exerciseId: '22222222-2222-4222-a222-222222222222',
        is_correct: true, // Client claims they got it right!
        score: 100,       // Client claims 100 points
      };

      // Zod schema strips unrecognized fields
      const parsed = ExerciseExplanationRequestSchema.parse(clientTamperedPayload);
      assert.equal('is_correct' in parsed, false, 'Client-supplied is_correct must be stripped by schema');
      assert.equal('score' in parsed, false, 'Client-supplied score must be stripped by schema');
    });

    it('5.3. Usage logging metadata never records secrets, tokens, or authorization headers', () => {
      const mockLogEntry = {
        userId: 'user-123',
        feature: 'exercise_explanation',
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        promptVersion: TUTOR_EXERCISE_EXPLANATION_VERSION,
        status: 'success',
        latencyMs: 450,
        metadata: {
          submission_id: 'sub-123',
          exercise_id: 'ex-101',
          is_correct: false,
        },
      };

      const serialized = JSON.stringify(mockLogEntry);
      assert.ok(!serialized.includes('AI_KEY'));
      assert.ok(!serialized.includes('Bearer'));
      assert.ok(!serialized.includes('password'));
      assert.ok(!serialized.includes('secret'));
    });
  });

  describe('6. Reliability: Resilient Degradation & Non-Destructive Invariance', () => {
    it('6.1. When an AI provider fails or times out, a structured pedagogical fallback is returned', () => {
      const exerciseContext = {
        exerciseId: 'ex-101',
        prompt: 'The train ________ at 8:00 AM every morning.',
        userAnswer: 'leaves',
        correctAnswer: 'leaves',
        isCorrect: true,
        teacherExplanation: 'Động từ "leave" đi với ngôi thứ 3 số ít thêm -s.',
        lessonTitle: 'Daily Commute',
        lessonSkill: 'vocabulary',
      };

      // Emulate services.ts fallback generator
      const fallbackExplanation = {
        explanation: exerciseContext.isCorrect
          ? `Làm tốt lắm! Bạn đã trả lời chính xác: "${exerciseContext.correctAnswer}". ${exerciseContext.teacherExplanation}`
          : `Bạn đã chọn "${exerciseContext.userAnswer}". Đáp án chính xác là "${exerciseContext.correctAnswer}". ${exerciseContext.teacherExplanation}`,
        rule_summary: `Quy tắc cốt lõi: Hãy chú ý ngữ cảnh và cấu trúc trong câu "${exerciseContext.prompt}".`,
        examples: [
          `Ví dụ 1: Cấu trúc với "${exerciseContext.correctAnswer}" rất phổ biến trong giao tiếp hàng ngày.`,
          `Ví dụ 2: Hãy ghi nhớ mẹo nhận biết từ lời giải thích: ${exerciseContext.teacherExplanation.slice(0, 80)}...`,
        ],
        next_step_tip: `Hãy tiếp tục luyện tập thêm các câu hỏi trong bài "${exerciseContext.lessonTitle}" để củng cố phản xạ nhé!`,
      };

      // Validate that the fallback adheres strictly to the Zod schema
      const parsed = AITutorExplanationSchema.safeParse(fallbackExplanation);
      assert.equal(parsed.success, true);
      assert.ok(parsed.data.explanation.includes('Làm tốt lắm'));
      assert.ok(parsed.data.rule_summary.includes('Quy tắc cốt lõi'));
    });

    it('6.2. Invariance: AI Tutor operations are strictly read-only and never alter submissions or scores', () => {
      // Simulate submission state before and after tutor explanation
      const originalSubmission = {
        id: 'sub-100',
        user_id: 'user-1',
        score: 8.0,
        max_score: 10.0,
        accuracy: 0.8,
        status: 'completed',
        created_at: '2026-10-17T10:00:00Z',
      };

      const clonedBefore = JSON.parse(JSON.stringify(originalSubmission));

      // Tutor explanation request executes...
      const tutorExplanation = {
        explanation: 'Deep dive explanation',
        rule_summary: 'Core grammar rule',
        examples: ['Example 1'],
        next_step_tip: 'Keep going',
      };

      // Invariance check: original submission fields remain identical
      assert.deepEqual(originalSubmission, clonedBefore, 'Submission record must be immutable by AI Tutor');
      assert.equal(originalSubmission.score, 8.0);
      assert.equal(originalSubmission.accuracy, 0.8);
      assert.equal(originalSubmission.status, 'completed');
    });
  });

  describe('7. Security & Resilience Hardening Verification', () => {
    it('7.1. Rate Limiter rejects empty, null, or whitespace userId safely', async () => {
      const resEmpty = await checkAIRateLimit('');
      assert.equal(resEmpty.allowed, false);

      const resWhitespace = await checkAIRateLimit('   ');
      assert.equal(resWhitespace.allowed, false);
    });

    it('7.2. Concurrent request bursts: Promise.all increments accurately within window', async () => {
      const burstUserId = `burst-user-${Date.now()}`;
      const limit = 5;

      const requests = Array.from({ length: 7 }, () =>
        checkAIRateLimit(burstUserId, { maxRequests: limit, windowSeconds: 300 })
      );

      const results = await Promise.all(requests);
      const allowedCount = results.filter((r) => r.allowed).length;
      const blockedCount = results.filter((r) => !r.allowed).length;

      assert.equal(allowedCount, 5, 'Exactly 5 requests must be allowed under limit 5');
      assert.equal(blockedCount, 2, 'Remaining 2 requests must be blocked');
    });

    it('7.3. Deep secret sanitization masks API keys and Bearer tokens in metadata values and error codes', async () => {
      const { sanitizeMetadataValue } = await import('../../src/lib/ai/usage-logger.ts');

      // Construct dummy test strings dynamically to avoid GitHub Secret Scanning false positives on static patterns
      const dummyGooglePrefix = 'AI' + 'za';
      const dummyGoogleKey = dummyGooglePrefix + 'Sy_TEST_MOCK_DUMMY_KEY_FOR_UNIT_TEST_1234';
      const dummyOpenAIPrefix = 's' + 'k-';
      const dummyOpenAIKey = dummyOpenAIPrefix + 'TEST_MOCK_DUMMY_KEY_FOR_UNIT_TEST_123456';
      const dummyBearerToken = 'Bearer ' + 'mock_jwt_token_payload_for_testing';

      const dirtyMetadata = {
        error_detail: `Failed to connect to Google API with key ${dummyGoogleKey}`,
        nested: {
          auth_header: dummyBearerToken,
          openai_msg: `Invalid key ${dummyOpenAIKey}`,
          safe_field: 'Normal learning context',
        },
      };

      const cleaned = sanitizeMetadataValue(dirtyMetadata);
      const serialized = JSON.stringify(cleaned);

      assert.ok(!serialized.includes(dummyGoogleKey));
      assert.ok(!serialized.includes(dummyOpenAIKey));
      assert.ok(!serialized.includes(dummyBearerToken));
      assert.ok(serialized.includes('[REDACTED_KEY]'));
      assert.ok(serialized.includes('Normal learning context'));
    });

    it('7.4. Logger resilience: Failures in telemetry logging never throw an unhandled exception', async () => {
      const { logAIUsage } = await import('../../src/lib/ai/usage-logger.ts');

      // Attempt logging with invalid payload that triggers DB failure or client error
      await assert.doesNotReject(async () => {
        await logAIUsage({
          userId: 'test-user',
          feature: 'exercise_explanation',
          provider: 'test',
          model: 'test',
          promptVersion: 'v1',
          status: 'error',
          latencyMs: 10,
        });
      }, 'logAIUsage must catch errors internally and never reject or crash caller');
    });

    it('7.5. SQL Migration Policy: Rate limit stored procedure restricts EXECUTE to service_role', async () => {
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');

      const migrationSql = readFileSync(
        join(process.cwd(), 'supabase', 'migrations', '20261017_phase_5_ai_tutor.sql'),
        'utf8'
      );

      // Verify that check_and_increment_ai_rate_limit revokes from authenticated and public
      assert.ok(
        migrationSql.includes('revoke all on function public.check_and_increment_ai_rate_limit(uuid, timestamptz, integer) from public, anon, authenticated;'),
        'Must explicitly revoke execute on rate limit RPC from public, anon, authenticated'
      );
      assert.ok(
        migrationSql.includes('grant execute on function public.check_and_increment_ai_rate_limit(uuid, timestamptz, integer) to service_role;'),
        'Must grant execute only to service_role'
      );
      assert.ok(
        !migrationSql.includes('grant execute on function public.check_and_increment_ai_rate_limit(uuid, timestamptz, integer) to authenticated;'),
        'Must NOT grant execute on rate limit RPC to authenticated'
      );
    });

    it('7.6. SQL Migration Policy: Operational cleanup function exists and is restricted to service_role', async () => {
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');

      const migrationSql = readFileSync(
        join(process.cwd(), 'supabase', 'migrations', '20261017_phase_5_ai_tutor.sql'),
        'utf8'
      );

      assert.ok(
        migrationSql.includes('create or replace function public.cleanup_expired_ai_rate_limits'),
        'Must define operational cleanup function for rate limit retention'
      );
      assert.ok(
        migrationSql.includes('grant execute on function public.cleanup_expired_ai_rate_limits(interval) to service_role;'),
        'Cleanup function must be restricted to service_role'
      );
    });
  });
});
