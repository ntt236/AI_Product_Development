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

    if (promptLower.includes('câu hỏi:') || promptLower.includes('bài tập')) {
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
