import { getAIProvider } from '@/lib/ai';
import { checkAIRateLimit } from '@/lib/ai/rate-limiter';
import { logAIUsage } from '@/lib/ai/usage-logger';
import type {
  WritingEvaluationResult,
  SpeakingEvaluationResult,
} from './types';

export const WRITING_EVAL_PROMPT_VERSION = 'writing_eval_v1';
export const SPEAKING_EVAL_PROMPT_VERSION = 'speaking_eval_v1';

/**
 * Counts words safely in a text block.
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Evaluates learner writing submission with AI, structured rubric, and resilient fallback.
 */
export async function evaluateWriting(input: {
  userId: string;
  promptScenario: string;
  learnerText: string;
  targetLevel?: string;
}): Promise<WritingEvaluationResult> {
  const wordCount = countWords(input.learnerText);
  const startTime = Date.now();

  // 1. Check rate limit
  const rateLimit = await checkAIRateLimit(input.userId, { maxRequests: 15, windowSeconds: 300 });
  if (!rateLimit.allowed) {
    return generateFallbackWritingEvaluation(input.learnerText, wordCount, 'Hệ thống đã chuyển sang chế độ đánh giá quy chuẩn do bạn đã đạt giới hạn yêu cầu AI trong giờ này.');
  }

  // 2. Prepare AI prompt
  const systemPrompt = `You are a certified, supportive English writing tutor evaluating an A1/A2 learner's short writing submission.
Provide pedagogical, constructive feedback in Vietnamese, with specific English quotes for corrections.
Always return JSON matching the schemaDescription. Never output markdown fences or extra commentary outside JSON.`;

  const userPrompt = `Đánh giá bài viết của học viên (Trình độ mục tiêu: ${input.targetLevel || 'A1-A2'}).

ĐỀ BÀI (PROMPT):
"${input.promptScenario}"

BÀI VIẾT CỦA HỌC VIÊN (${wordCount} từ):
"""
${input.learnerText}
"""

Hãy đánh giá theo Rubric chuẩn:
1. overall_feedback: Nhận xét tổng quan sư phạm (tiếng Việt), chỉ rõ điểm mạnh và hướng cải thiện.
2. rubric_scores:
   - task_achievement: (0-25 điểm) Trả lời đủ các ý của đề bài, độ dài phù hợp.
   - grammar_accuracy: (0-30 điểm) Chia động từ Hiện tại đơn, cấu trúc câu, giới từ.
   - lexical_resource: (0-25 điểm) Độ phù hợp và đa dạng của từ vựng.
   - coherence_organization: (0-20 điểm) Bố cục email, câu mở đầu và kết bài.
   - total_score: Tổng điểm từ 0 đến 100.
3. grammar_corrections: Danh sách các lỗi ngữ pháp cụ thể (nếu có):
   - error_quote: Câu hoặc cụm từ học viên viết sai.
   - correction: Cách sửa đúng chuẩn.
   - explanation: Giải thích ngắn gọn bằng tiếng Việt nguyên nhân vì sao sai.
4. vocabulary_enhancements: Danh sách 1-3 từ/cụm từ gợi ý nâng cấp giúp bài viết tự nhiên hơn:
   - original: Từ gốc của học viên.
   - suggestion: Cụm từ thay thế gợi ý.
   - reason: Lý do vì sao cụm từ này tự nhiên hơn.
5. improved_version:
   - text: Phiên bản hoàn thiện gợi ý (giữ nguyên giọng văn của học viên, sửa các lỗi và trau chuốt diễn đạt).
   - rationale: Giải thích ngắn gọn các điểm cải tiến cốt lõi trong phiên bản này.
6. next_steps: 2-3 bước hành động gợi ý để học viên luyện tập thêm.`;

  const schemaDescription = `{
    "overall_feedback": "string",
    "rubric_scores": {
      "task_achievement": "number",
      "grammar_accuracy": "number",
      "lexical_resource": "number",
      "coherence_organization": "number",
      "total_score": "number"
    },
    "grammar_corrections": [{"error_quote": "string", "correction": "string", "explanation": "string"}],
    "vocabulary_enhancements": [{"original": "string", "suggestion": "string", "reason": "string"}],
    "improved_version": {"text": "string", "rationale": "string"},
    "next_steps": ["string"]
  }`;

  try {
    const aiProvider = getAIProvider();
    const result = await aiProvider.generateStructuredOutput<WritingEvaluationResult>({
      prompt: userPrompt,
      systemPrompt,
      schemaDescription,
      temperature: 0.3,
      timeoutMs: 25000,
      validator: (data: unknown): data is WritingEvaluationResult => {
        if (!data || typeof data !== 'object') return false;
        const d = data as Record<string, unknown>;
        return (
          typeof d.overall_feedback === 'string' &&
          typeof d.rubric_scores === 'object' &&
          Array.isArray(d.grammar_corrections) &&
          Array.isArray(d.vocabulary_enhancements) &&
          typeof d.improved_version === 'object' &&
          Array.isArray(d.next_steps)
        );
      },
    });

    const latencyMs = Date.now() - startTime;
    await logAIUsage({
      userId: input.userId,
      feature: 'writing_evaluation',
      provider: aiProvider.providerName,
      model: result.model,
      promptVersion: WRITING_EVAL_PROMPT_VERSION,
      status: 'success',
      tokenCount: result.tokenCount || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      latencyMs,
    });

    return {
      ...result.data,
      word_count: wordCount,
      evaluation_source: 'ai_provider',
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    await logAIUsage({
      userId: input.userId,
      feature: 'writing_evaluation',
      provider: 'fallback',
      model: 'heuristic-rule-v1',
      promptVersion: WRITING_EVAL_PROMPT_VERSION,
      status: 'fallback',
      tokenCount: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      latencyMs,
      errorCode: err instanceof Error ? err.name : 'AI_ERROR',
    });

    return generateFallbackWritingEvaluation(input.learnerText, wordCount);
  }
}

/**
 * Fallback deterministic writing evaluator when AI is unavailable or rate-limited.
 */
export function generateFallbackWritingEvaluation(
  learnerText: string,
  wordCount: number,
  customNote?: string
): WritingEvaluationResult {
  const textLower = learnerText.toLowerCase();

  // Basic checks
  const hasGreeting = textLower.includes('dear') || textLower.includes('hi') || textLower.includes('hello');
  const hasSignOff = textLower.includes('regards') || textLower.includes('wishes') || textLower.includes('sincerely') || textLower.includes('looking forward');
  const hasSelfIntro = textLower.includes('my name') || textLower.includes('i am');
  const hasHobbies = textLower.includes('enjoy') || textLower.includes('like') || textLower.includes('free time') || textLower.includes('hobby');

  let taskScore = 18;
  if (hasGreeting) taskScore += 2;
  if (hasSignOff) taskScore += 2;
  if (hasSelfIntro && hasHobbies) taskScore += 3;
  taskScore = Math.min(25, taskScore);

  const grammarScore = 22;
  const lexicalScore = 20;
  const coherenceScore = hasGreeting && hasSignOff ? 18 : 14;

  if (wordCount < 30) {
    taskScore = Math.max(10, taskScore - 6);
  } else if (wordCount >= 50 && wordCount <= 130) {
    taskScore = Math.min(25, taskScore + 2);
  }

  const totalScore = taskScore + grammarScore + lexicalScore + coherenceScore;

  return {
    overall_feedback:
      (customNote ? `${customNote}\n\n` : '') +
      `Bài viết của bạn đạt ${wordCount} từ. Bạn đã nắm được bố cục cơ bản của một email giới thiệu bản thân. Các câu văn diễn đạt rõ ràng và truyền tải được thông tin cá nhân. Hãy tiếp tục củng cố việc dùng từ nối để các câu liên kết chặt chẽ hơn.`,
    word_count: wordCount,
    rubric_scores: {
      task_achievement: taskScore,
      grammar_accuracy: grammarScore,
      lexical_resource: lexicalScore,
      coherence_organization: coherenceScore,
      total_score: totalScore,
    },
    grammar_corrections: [
      {
        error_quote: 'Lưu ý thì Hiện tại đơn',
        correction: 'Kiểm tra chủ ngữ số ít / số nhiều và thêm -s/-es khi cần thiết',
        explanation: 'Trong email giới thiệu thói quen và sở thích, hãy đảm bảo động từ hòa hợp với chủ ngữ.',
      },
    ],
    vocabulary_enhancements: [
      {
        original: 'I like',
        suggestion: 'I really enjoy / I am interested in',
        reason: 'Sử dụng các cấu trúc thay thế giúp câu văn đa dạng và không bị lặp từ.',
      },
    ],
    improved_version: {
      text: learnerText,
      rationale:
        'Giữ nguyên nội dung và phong cách của bạn; hãy bổ sung thêm từ nối như "Furthermore", "In addition" và câu kết thư trang trọng.',
    },
    next_steps: [
      'Luyện tập chia động từ ngôi thứ ba số ít trong câu miêu tả thói quen.',
      'Sử dụng các từ nối thời gian: "In the morning", "After that", "On weekends".',
    ],
    evaluation_source: 'fallback_heuristic',
  };
}

/**
 * Evaluates learner speaking submission (text/transcript-first) with AI and resilient fallback.
 */
export async function evaluateSpeaking(input: {
  userId: string;
  speakingTopicPrompt: string;
  transcriptText: string;
  targetLevel?: string;
}): Promise<SpeakingEvaluationResult> {
  const wordCount = countWords(input.transcriptText);
  const startTime = Date.now();

  // 1. Check rate limit
  const rateLimit = await checkAIRateLimit(input.userId, { maxRequests: 15, windowSeconds: 300 });
  if (!rateLimit.allowed) {
    return generateFallbackSpeakingEvaluation(input.transcriptText, wordCount, 'Hệ thống đã chuyển sang chế độ đánh giá quy chuẩn do bạn đã đạt giới hạn yêu cầu AI trong giờ này.');
  }

  // 2. Prepare AI prompt
  const systemPrompt = `You are an expert spoken English coach evaluating an A1/A2 learner's speaking response transcript.
Analyze natural conversational flow, spoken grammar, and colloquial phrasing.
Always return JSON matching the schemaDescription. Never output markdown fences or extra commentary outside JSON.`;

  const userPrompt = `Đánh giá bản transcript câu trả lời nói của học viên (Trình độ: ${input.targetLevel || 'A1-A2'}).

CHỦ ĐỀ NÓI (TOPIC):
"${input.speakingTopicPrompt}"

TRANSCRIPT LỜI NÓI CỦA HỌC VIÊN (${wordCount} từ):
"""
${input.transcriptText}
"""

Hãy đánh giá theo Rubric chuẩn:
1. overall_feedback: Nhận xét tổng quan về phản xạ và độ tự nhiên trong văn nói (tiếng Việt).
2. relevance_and_fluency: Đánh giá độ phù hợp với câu hỏi và tính liên kết giữa các câu.
3. rubric_scores:
   - relevance_fluency: (0-25 điểm) Độ phù hợp đề bài và tính trôi chảy của ý tưởng.
   - spoken_grammar: (0-30 điểm) Ngữ pháp trong văn nói, chia động từ, câu đầy đủ.
   - conversational_vocab: (0-25 điểm) Từ vựng giao tiếp tự nhiên, cụm từ kết nối.
   - naturalness_sample: (0-20 điểm) Độ tự nhiên so với cách người bản xứ trò chuyện.
   - total_score: Tổng điểm từ 0 đến 100.
4. grammar_corrections: Danh sách lỗi ngữ pháp trong văn nói cần chú ý.
5. vocabulary_enhancements: Gợi ý các cụm từ đàm thoại bản xứ (collocations / idioms nhẹ nhàng).
6. sample_spoken_response:
   - text: Câu trả lời mẫu tự nhiên bằng tiếng Anh (dành cho người nói đàm thoại).
   - key_phrases: 3-4 cụm từ khóa đắt giá trong câu trả lời mẫu.
   - rationale: Giải thích vì sao câu trả lời mẫu này tự nhiên và dễ áp dụng.
7. next_steps: 2-3 gợi ý thực hành luyện phát âm hoặc nói phản xạ.`;

  const schemaDescription = `{
    "overall_feedback": "string",
    "relevance_and_fluency": "string",
    "rubric_scores": {
      "relevance_fluency": "number",
      "spoken_grammar": "number",
      "conversational_vocab": "number",
      "naturalness_sample": "number",
      "total_score": "number"
    },
    "grammar_corrections": [{"error_quote": "string", "correction": "string", "explanation": "string"}],
    "vocabulary_enhancements": [{"original": "string", "suggestion": "string", "reason": "string"}],
    "sample_spoken_response": {"text": "string", "key_phrases": ["string"], "rationale": "string"},
    "next_steps": ["string"]
  }`;

  try {
    const aiProvider = getAIProvider();
    const result = await aiProvider.generateStructuredOutput<SpeakingEvaluationResult>({
      prompt: userPrompt,
      systemPrompt,
      schemaDescription,
      temperature: 0.35,
      timeoutMs: 25000,
      validator: (data: unknown): data is SpeakingEvaluationResult => {
        if (!data || typeof data !== 'object') return false;
        const d = data as Record<string, unknown>;
        return (
          typeof d.overall_feedback === 'string' &&
          typeof d.relevance_and_fluency === 'string' &&
          typeof d.rubric_scores === 'object' &&
          Array.isArray(d.grammar_corrections) &&
          Array.isArray(d.vocabulary_enhancements) &&
          typeof d.sample_spoken_response === 'object' &&
          Array.isArray(d.next_steps)
        );
      },
    });

    const latencyMs = Date.now() - startTime;
    await logAIUsage({
      userId: input.userId,
      feature: 'speaking_evaluation',
      provider: aiProvider.providerName,
      model: result.model,
      promptVersion: SPEAKING_EVAL_PROMPT_VERSION,
      status: 'success',
      tokenCount: result.tokenCount || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      latencyMs,
    });

    return {
      ...result.data,
      word_count: wordCount,
      evaluation_source: 'ai_provider',
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    await logAIUsage({
      userId: input.userId,
      feature: 'speaking_evaluation',
      provider: 'fallback',
      model: 'heuristic-rule-v1',
      promptVersion: SPEAKING_EVAL_PROMPT_VERSION,
      status: 'fallback',
      tokenCount: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      latencyMs,
      errorCode: err instanceof Error ? err.name : 'AI_ERROR',
    });

    return generateFallbackSpeakingEvaluation(input.transcriptText, wordCount);
  }
}

/**
 * Fallback deterministic speaking evaluator when AI is unavailable or rate-limited.
 */
export function generateFallbackSpeakingEvaluation(
  transcriptText: string,
  wordCount: number,
  customNote?: string
): SpeakingEvaluationResult {
  const textLower = transcriptText.toLowerCase();

  const hasGreeting = textLower.includes('hi') || textLower.includes('hello') || textLower.includes('glad to');
  const hasConnectors = textLower.includes('because') || textLower.includes('and') || textLower.includes('usually') || textLower.includes('actually');

  let relevanceScore = 20;
  if (hasGreeting) relevanceScore += 2;
  if (hasConnectors) relevanceScore += 2;
  relevanceScore = Math.min(25, relevanceScore);

  const grammarScore = 24;
  const vocabScore = 22;
  const naturalnessScore = 18;

  if (wordCount < 25) {
    relevanceScore = Math.max(10, relevanceScore - 5);
  } else if (wordCount >= 40 && wordCount <= 120) {
    relevanceScore = Math.min(25, relevanceScore + 1);
  }

  const totalScore = relevanceScore + grammarScore + vocabScore + naturalnessScore;

  return {
    overall_feedback:
      (customNote ? `${customNote}\n\n` : '') +
      `Bản transcript câu trả lời của bạn đạt ${wordCount} từ. Bạn đã phản hồi trực tiếp vào chủ đề giới thiệu bản thân và thói quen sinh hoạt. Để lời nói tự nhiên và lôi cuốn hơn, hãy luyện tập sử dụng thêm các từ đệm và từ nối giao tiếp.`,
    relevance_and_fluency:
      'Ý tứ được trình bày mạch lạc, câu trả lời đi đúng trọng tâm và thể hiện được sự tự tin cơ bản trong giao tiếp.',
    word_count: wordCount,
    rubric_scores: {
      relevance_fluency: relevanceScore,
      spoken_grammar: grammarScore,
      conversational_vocab: vocabScore,
      naturalness_sample: naturalnessScore,
      total_score: totalScore,
    },
    grammar_corrections: [
      {
        error_quote: 'Lưu ý nối ý trong câu nói',
        correction: 'Dùng từ nối: "Usually, I...", "After work, I like to..."',
        explanation: 'Giúp câu nói có nhịp điệu tự nhiên, tránh cảm giác liệt kê thông tin rời rạc.',
      },
    ],
    vocabulary_enhancements: [
      {
        original: 'very happy',
        suggestion: 'really glad / excited',
        reason: 'Các từ này tạo cảm giác gần gũi và nhiệt tình hơn trong đàm thoại đời thường.',
      },
    ],
    sample_spoken_response: {
      text:
        'Hi there! It is great to introduce myself today. My name is Alex and I live in Hanoi. On a typical day, I wake up early and get ready for work. In my spare time, I really enjoy reading and listening to acoustic music. I look forward to chatting more with you!',
      key_phrases: ['It is great to introduce myself', 'On a typical day', 'In my spare time', 'I look forward to'],
      rationale:
        'Câu trả lời mẫu có đầy đủ lời chào tự nhiên, chia sẻ thói quen với từ nối mềm mại và lời kết đàm thoại thân thiện.',
    },
    next_steps: [
      'Đọc to câu trả lời mẫu 3 lần với ngữ điệu ngắt nghỉ theo từng cụm từ có nghĩa.',
      'Tập phản xạ nối câu với "To be honest" hoặc "Actually".',
    ],
    evaluation_source: 'fallback_heuristic',
  };
}
