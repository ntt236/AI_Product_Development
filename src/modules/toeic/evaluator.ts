import { getAIProvider } from '@/lib/ai';
import { ToeicPartScore, ToeicWeaknessAnalysis } from './types';
import { TOEIC_PART_NAMES } from './scoring';

export const TOEIC_EVAL_PROMPT_VERSION = 'toeic_weakness_v1';

/**
 * Fallback deterministic weakness analysis when AI is offline, rate-limited, or timing out.
 */
export function generateFallbackToeicAnalysis(params: {
  partScores: Record<string, ToeicPartScore>;
  estimatedListeningScore: number;
  estimatedReadingScore: number;
  estimatedTotalScore: number;
}): ToeicWeaknessAnalysis {
  const { partScores, estimatedListeningScore, estimatedReadingScore, estimatedTotalScore } = params;

  const partsArray = Object.values(partScores).sort((a, b) => b.accuracy - a.accuracy);
  const strongest = partsArray.filter(p => p.accuracy >= 65).map(p => p.partName);
  const weakest = partsArray.filter(p => p.accuracy < 65).map(p => p.partName);

  // If all high or all low, handle edge cases
  const strongestParts = strongest.length > 0 ? strongest.slice(0, 2) : [partsArray[0]?.partName || 'Part 1: Photographs'];
  const weakestParts = weakest.length > 0 ? weakest.slice(0, 2) : [partsArray[partsArray.length - 1]?.partName || 'Part 7: Reading Comprehension'];

  let diagnosis = `Bạn đạt tổng điểm ước tính ${estimatedTotalScore}/990 (Listening: ${estimatedListeningScore}, Reading: ${estimatedReadingScore}). `;
  if (estimatedListeningScore > estimatedReadingScore + 50) {
    diagnosis += 'Kỹ năng Nghe hiểu của bạn đang phát triển tốt hơn đáng kể so với Đọc hiểu. Hãy tập trung củng cố ngữ pháp và vốn từ vựng công sở để bứt phá phần Reading.';
  } else if (estimatedReadingScore > estimatedListeningScore + 50) {
    diagnosis += 'Kỹ năng Đọc hiểu của bạn đang vượt trội hơn Nghe hiểu. Bạn có nền tảng ngữ pháp tốt, cần tăng cường luyện nghe phản xạ và nắm bắt từ nối tự nhiên trong Part 2 và 3.';
  } else {
    diagnosis += 'Năng lực giữa hai kỹ năng Nghe và Đọc của bạn khá đồng đều. Hãy tập trung vá các lỗ hổng theo từng dạng bẫy phổ biến của các Part có độ chính xác thấp nhất.';
  }

  const targetedActionPlan: string[] = [];
  for (const weakName of weakestParts) {
    if (weakName.includes('Part 1') || weakName.includes('Part 2')) {
      targetedActionPlan.push('Luyện bắt từ khóa hành động (V-ing), thì hiện tại tiếp diễn và giới từ chỉ vị trí; tránh bẫy từ đồng âm trong Part 2.');
    } else if (weakName.includes('Part 3') || weakName.includes('Part 4')) {
      targetedActionPlan.push('Đọc trước câu hỏi và các phương án trước khi audio bắt đầu; rèn kỹ năng bắt ý chính (purpose) và yêu cầu hành động kế tiếp.');
    } else if (weakName.includes('Part 5') || weakName.includes('Part 6')) {
      targetedActionPlan.push('Hệ thống hóa từ loại (danh, động, tính, trạng) và các cụm liên từ/giới từ chỉ thời gian, nhượng bộ, nguyên nhân kết quả.');
    } else if (weakName.includes('Part 7')) {
      targetedActionPlan.push('Áp dụng triệt để kỹ thuật Skimming (đọc lướt tìm chủ đề) và Scanning (tìm từ khóa mốc thời gian, tên người, số liệu) để quản lý thời gian hiệu quả.');
    }
  }

  if (targetedActionPlan.length === 0) {
    targetedActionPlan.push('Duy trì làm bài tập phản xạ hàng ngày và bấm giờ mô phỏng áp lực phòng thi 120 phút.');
  }

  const recommendedGeneralEnglishTopics = [
    {
      title: 'Đọc hiểu Thông báo nội bộ & Kế hoạch công việc',
      skill: 'reading',
      href: '/skills'
    },
    {
      title: 'Luyện nghe Hội thoại chào hỏi và giới thiệu thông tin',
      skill: 'listening',
      href: '/skills'
    },
    {
      title: 'Sổ tay Từ vựng Công sở & Giao tiếp thiết yếu',
      skill: 'vocabulary',
      href: '/vocabulary'
    }
  ];

  return {
    strongestParts,
    weakestParts,
    overallDiagnosis: diagnosis,
    targetedActionPlan,
    recommendedGeneralEnglishTopics
  };
}

/**
 * Generates AI-assisted weakness analysis and learning path recommendations.
 */
export async function generateToeicWeaknessAnalysis(params: {
  partScores: Record<string, ToeicPartScore>;
  estimatedListeningScore: number;
  estimatedReadingScore: number;
  estimatedTotalScore: number;
}): Promise<ToeicWeaknessAnalysis> {
  const fallback = generateFallbackToeicAnalysis(params);

  try {
    const aiProvider = getAIProvider();
    const systemPrompt = `You are a certified senior TOEIC pedagogical coach for Vietnamese adult professionals.
Evaluate the student's test performance, pinpoint root causes for weak parts, and deliver concise, practical advice in Vietnamese.
Return strictly valid JSON matching this schema:
{
  "strongestParts": ["string"],
  "weakestParts": ["string"],
  "overallDiagnosis": "string in Vietnamese",
  "targetedActionPlan": ["string in Vietnamese (3-4 bullet action items)"],
  "recommendedGeneralEnglishTopics": [
    { "title": "string", "skill": "reading" | "listening" | "vocabulary" | "grammar", "href": "string" }
  ]
}`;

    const userPrompt = `Student test statistics:
- Total Scaled Score: ${params.estimatedTotalScore}/990
- Listening Score: ${params.estimatedListeningScore}/495
- Reading Score: ${params.estimatedReadingScore}/495
- Part Scores Breakdown:
${Object.values(params.partScores).map(p => `  * ${p.partName}: ${p.correct}/${p.total} (${p.accuracy}%)`).join('\n')}

Generate strategic pedagogical recommendations.`;

    const response = await aiProvider.generateText({
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      temperature: 0.3,
      maxTokens: 1200
    });

    if (!response || !response.text) {
      return fallback;
    }

    // Parse JSON safely
    const cleanJson = response.text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (
      Array.isArray(parsed.strongestParts) &&
      Array.isArray(parsed.weakestParts) &&
      typeof parsed.overallDiagnosis === 'string' &&
      Array.isArray(parsed.targetedActionPlan)
    ) {
      return {
        strongestParts: parsed.strongestParts.length > 0 ? parsed.strongestParts : fallback.strongestParts,
        weakestParts: parsed.weakestParts.length > 0 ? parsed.weakestParts : fallback.weakestParts,
        overallDiagnosis: parsed.overallDiagnosis.trim() || fallback.overallDiagnosis,
        targetedActionPlan: parsed.targetedActionPlan.length > 0 ? parsed.targetedActionPlan : fallback.targetedActionPlan,
        recommendedGeneralEnglishTopics: fallback.recommendedGeneralEnglishTopics
      };
    }

    return fallback;
  } catch (error) {
    console.warn('AI TOEIC Weakness Analysis failed or timed out, using fallback:', error);
    return fallback;
  }
}

/**
 * AI Tutor question explainer for detailed review.
 */
export async function explainToeicQuestionWithAi(params: {
  questionNumber: number;
  partNumber: number;
  prompt: string;
  contextText?: string | null;
  transcriptText?: string | null;
  options: { id: string; text: string }[];
  selectedOptionId: string | null;
  correctOptionId: string;
  officialExplanation: string;
  userPrompt: string;
}): Promise<string> {
  try {
    const aiProvider = getAIProvider();
    const prompt = `Bạn là Trợ lý AI Gia sư Luyện thi TOEIC chuyên nghiệp tại EngRise.
Hãy giải thích cặn kẽ câu hỏi sau cho học viên bằng tiếng Việt ngắn gọn, dễ hiểu và truyền cảm hứng.

Dữ liệu câu hỏi:
- Câu số: ${params.questionNumber} (${TOEIC_PART_NAMES[params.partNumber]?.name || `Part ${params.partNumber}`})
- Đề bài: ${params.prompt}
${params.contextText ? `- Đoạn văn bản/Context: ${params.contextText}` : ''}
${params.transcriptText ? `- Lời thoại Audio Transcript: ${params.transcriptText}` : ''}
- Các phương án: ${params.options.map(o => `${o.id}. ${o.text}`).join(' | ')}
- Đáp án học viên chọn: ${params.selectedOptionId || 'Chưa chọn'}
- Đáp án đúng chính thức: ${params.correctOptionId}
- Giải thích cơ bản: ${params.officialExplanation}

Câu hỏi của học viên: "${params.userPrompt}"

Yêu cầu câu trả lời:
1. Trả lời trực tiếp thắc mắc của học viên.
2. Chỉ ra bẫy thường gặp (distractor) trong câu này và lý do tại sao phương án khác lại sai.
3. Rút ra 1 mẹo (Tip) làm bài nhanh cho dạng câu này.
4. Giữ giọng văn thân thiện, chuẩn sư phạm.`;

    const response = await aiProvider.generateText({
      prompt,
      temperature: 0.3,
      maxTokens: 800
    });

    return response.text || params.officialExplanation;
  } catch (error) {
    console.warn('AI question explanation failed:', error);
    return `Gia sư AI hiện đang bận: ${params.officialExplanation}`;
  }
}
