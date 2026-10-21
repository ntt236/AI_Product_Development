import type {
  AIProvider,
  GenerateTextInput,
  GenerateTextResult,
  GenerateStructuredInput,
  GenerateStructuredResult,
} from '../types';

export class MockAIProvider implements AIProvider {
  readonly providerName = 'mock';
  readonly defaultModel = 'mock-tutor-v1';

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    return {
      text: `[Mock AI Tutor]: Đây là phản hồi mô phỏng cho yêu cầu: "${input.prompt.slice(0, 50)}...". Hãy tiếp tục luyện tập đều đặn nhé!`,
      model: this.defaultModel,
      tokenCount: {
        promptTokens: 25,
        completionTokens: 30,
        totalTokens: 55,
      },
    };
  }

  async generateStructuredOutput<T>(
    input: GenerateStructuredInput<T>
  ): Promise<GenerateStructuredResult<T>> {
    // Check if the prompt is for tutor exercise explanation
    const promptLower = input.prompt.toLowerCase();

    let mockData: Record<string, unknown>;

    if (promptLower.includes('writing') || promptLower.includes('viết') || promptLower.includes('essay')) {
      mockData = {
        overall_feedback:
          'Bài viết của bạn có cấu trúc rõ ràng, truyền đạt đầy đủ các thông tin cần thiết theo yêu cầu. Để email trở nên tự nhiên hơn, hãy chú ý liên kết giữa các câu và chia động từ Hiện tại đơn chính xác.',
        rubric_scores: {
          task_achievement: 22,
          grammar_accuracy: 25,
          lexical_resource: 22,
          coherence_organization: 18,
          total_score: 87,
        },
        grammar_corrections: [
          {
            error_quote: 'I live here since two years',
            correction: 'I have lived here for two years / I moved here two years ago',
            explanation: 'Dùng "for" khi nói về khoảng thời gian kéo dài, hoặc dùng Quá khứ đơn với "ago" khi chỉ mốc thời gian chuyển đến.',
          },
        ],
        vocabulary_enhancements: [
          {
            original: 'I like play guitar',
            suggestion: 'I really enjoy playing acoustic guitar',
            reason: 'Sau "enjoy" dùng V-ing và thêm tính từ "acoustic" giúp câu văn sinh động, cụ thể hơn.',
          },
        ],
        improved_version: {
          text:
            'Dear Team, My name is Minh and I am currently living in Hanoi. I work as a junior frontend developer. In my free time, I really enjoy playing guitar and reading books. I am excited to practice English with everyone and improve my speaking fluency. Looking forward to our sessions!',
          rationale:
            'Phiên bản này sửa lỗi ngữ pháp thì Hiện tại đơn, chuẩn hóa lời chào và lời kết email giao tiếp công sở tự nhiên.',
        },
        next_steps: [
          'Luyện tập thêm cấu trúc câu ghép với "and", "but", "because".',
          'Ôn lại quy tắc dùng giới từ "in", "on", "at" cho thời gian và địa điểm.',
        ],
      };
    } else if (promptLower.includes('speaking') || promptLower.includes('nói') || promptLower.includes('transcript')) {
      mockData = {
        overall_feedback:
          'Phần nói của bạn khá lưu loát và đi thẳng vào trọng tâm câu hỏi giới thiệu bản thân. Các ý được trình bày tự nhiên, có sử dụng từ nối cơ bản.',
        relevance_and_fluency:
          'Trả lời đúng câu hỏi về tên tuổi, nghề nghiệp và thói quen hàng ngày. Tốc độ nói và cách ngắt câu phù hợp với trình độ A1-A2.',
        rubric_scores: {
          relevance_fluency: 23,
          spoken_grammar: 26,
          conversational_vocab: 22,
          naturalness_sample: 18,
          total_score: 89,
        },
        grammar_corrections: [
          {
            error_quote: 'Every day I am go to work at 8 AM',
            correction: 'Every day I go to work at 8 AM',
            explanation: 'Với thói quen lặp lại hàng ngày, dùng thì Hiện tại đơn (go), không dùng "am go".',
          },
        ],
        vocabulary_enhancements: [
          {
            original: 'very good',
            suggestion: 'quite exciting / wonderful',
            reason: 'Thay thế từ vựng thông dụng bằng tính từ gợi cảm xúc giúp câu nói tự nhiên hơn.',
          },
        ],
        sample_spoken_response: {
          text:
            'Hello everyone! To be honest, I am really glad to be here today. My name is Alex, and I currently live in New York. On weekdays, I usually start my morning with a cup of coffee before heading to the office. In my spare time, I love cooking and playing guitar. It is great meeting all of you!',
          key_phrases: ['To be honest', 'On weekdays', 'In my spare time', 'It is great meeting all of you'],
          rationale:
            'Câu trả lời mẫu sử dụng các cụm từ mở đầu tự nhiên của người bản xứ và giữ nhịp điệu đàm thoại gần gũi.',
        },
        next_steps: [
          'Thực hành ghi âm lại đoạn nói mẫu 2 lần để rèn luyện ngữ điệu nối âm.',
          'Sử dụng nhiều hơn các từ nối: "Actually", "Besides that", "To tell the truth".',
        ],
      };
    } else if (promptLower.includes('câu hỏi:') || promptLower.includes('bài tập')) {
      mockData = {
        explanation:
          'Trong câu này, chủ ngữ là ngôi thứ ba số ít hoặc diễn đạt thói quen hàng ngày. Lựa chọn của bạn cần chú ý đến sự hòa hợp giữa chủ ngữ và động từ cũng như ngữ cảnh câu.',
        rule_summary:
          'Nguyên tắc: Với thì Hiện tại đơn, chủ ngữ số ít (He/She/It/Danh từ số ít) động từ thêm -s hoặc -es; chủ ngữ số nhiều (I/You/We/They) động từ giữ nguyên thể.',
        examples: [
          'She wakes up early at 6:00 AM every day.',
          'They commute to work by bus every morning.',
        ],
        next_step_tip:
          'Hãy làm thêm 2-3 câu bài tập về chia động từ ngôi thứ ba số ít để nắm chắc quy tắc này nhé!',
      };
    } else {
      mockData = {
        explanation:
          'Khái niệm này rất quan trọng trong tiếng Anh giao tiếp và ngữ pháp cơ bản.',
        rule_summary: 'Hãy ghi nhớ cấu trúc cốt lõi và luyện đặt câu thực tế hàng ngày.',
        examples: [
          'I usually read books in the evening.',
          'He doesn\'t like drinking coffee.',
        ],
        next_step_tip: 'Hãy thực hành áp dụng từ này vào một câu kể về thói quen của bạn.',
      };
    }

    if (input.validator && !input.validator(mockData)) {
      throw new Error('AI_OUTPUT_VALIDATION_ERROR: Mock output failed custom validator.');
    }

    return {
      data: mockData as T,
      rawText: JSON.stringify(mockData),
      model: this.defaultModel,
      tokenCount: {
        promptTokens: 40,
        completionTokens: 60,
        totalTokens: 100,
      },
    };
  }
}
