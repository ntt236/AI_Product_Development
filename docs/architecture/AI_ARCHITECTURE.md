# AI_ARCHITECTURE.md

## 1. Nguyên tắc
AI hỗ trợ giải thích, sinh bài tập, hội thoại, feedback và đề xuất. Backend vẫn sở hữu điểm số, quyền, trạng thái học và learner model. Không huấn luyện model riêng ở giai đoạn đầu; gọi AI APIs thông qua adapter phía server.

## 2. Luồng hệ thống
```text
Next.js UI
  -> Server Action / Route Handler
  -> Domain Service
  -> AI Orchestrator
       -> Context Builder
       -> Prompt Registry
       -> Provider Adapter
       -> Output Validator
       -> Usage Logger
  -> External AI API
```
Không gọi provider từ React component và không đưa API key ra client.

## 3. Thành phần
- **Provider Adapter:** giao diện chung để đổi nhà cung cấp mà không đổi domain logic.
- **Context Builder:** lấy đúng thông tin cần thiết: mục tiêu, trình độ ước lượng, bài hiện tại, câu trả lời và một phần lịch sử liên quan.
- **Prompt Registry:** prompt có ID/version; log `prompt_version` để theo dõi thay đổi.
- **Output Validator:** validate JSON bằng Zod; retry tối đa có giới hạn; có fallback nếu output sai.
- **Usage Logger:** lưu feature, provider, model, prompt version, status, latency, token usage/cost nếu có; không lưu secret.

## 4. AI use cases

### Giải thích câu sai
Backend cung cấp câu hỏi, đáp án chính thức và câu trả lời của learner. AI giải thích vì sao đúng/sai, quy tắc, ví dụ và bước luyện tiếp theo. AI không tự chấm đáp án khách quan.

### Learning Path proposal
Input: placement result, primary goal, thời gian học, strengths/weaknesses, nội dung có sẵn. Output: 2–3 phương án, milestones, thứ tự học, thời lượng, trade-offs và giả định. Backend kiểm tra content IDs/thời lượng trước khi lưu. Lộ trình ở trạng thái `proposed` cho đến khi người dùng chấp nhận. Khi user sửa, tạo version mới; không ghi đè âm thầm.

### Daily Plan
AI có thể đề xuất hoạt động, nhưng backend kiểm tra tổng thời lượng, mục tiêu ưu tiên, nội dung đã publish, hoạt động ôn đến hạn và mức lặp. Nếu AI lỗi, dùng rule-based fallback.

### Writing feedback
Trả nhận xét tổng quát, lỗi cụ thể, bản sửa kèm lý do, phiên bản tự nhiên hơn và 1–3 ưu tiên cải thiện. Khuyến khích learner viết lại, không chỉ sao chép bản mẫu.

### Speaking feedback
Transcript có thể hỗ trợ nhận xét ngữ pháp/từ vựng/nội dung. Chỉ đánh giá phát âm hoặc âm lượng/nhịp điệu nếu pipeline có audio và model phù hợp; không suy ra phát âm từ transcript thuần văn bản.

### AI Tutor
Có tutor trong bài học và chat tự do. Giải thích phù hợp trình độ, ưu tiên gợi mở; không tiết lộ đáp án bài kiểm tra đang diễn ra. AI chỉ đề xuất thay đổi learner model/path; domain service validate trước khi ghi dữ liệu.

## 5. TypeScript interfaces gợi ý
```ts
export interface AIProvider {
  generateText(input: GenerateTextInput): Promise<string>;
  generateStructuredOutput<T>(
    input: GenerateStructuredInput
  ): Promise<T>;
}
```
Thêm schema cụ thể cho từng feature thay vì dùng một JSON schema chung cho tất cả.

## 6. Cấu trúc thư mục
```text
src/lib/ai/
  provider.ts
  orchestrator.ts
  schemas.ts
  context-builder.ts
  prompt-registry.ts
  usage-logger.ts
  providers/
    openai-provider.ts
    gemini-provider.ts
```
Chỉ triển khai provider thực sự sử dụng. Tất cả API keys chỉ được đọc phía server.

## 7. Chất lượng, fallback và chi phí
- Có bộ ví dụ chuẩn để regression-test prompt.
- Đo output validity, usefulness, latency, failure rate và cost.
- Đặt timeout, token cap, rate limit và giới hạn retry.
- Khi provider lỗi, giữ lại kết quả học đã lưu và trả thông báo/fallback hữu ích.
- Không gửi dữ liệu cá nhân không liên quan; kiểm tra chính sách lưu trữ dữ liệu của provider.
- Cho phép phản hồi helpful/not helpful để cải thiện chất lượng.

## 8. Thứ tự triển khai
1. Giải thích bài tập.
2. Writing feedback.
3. Learning Path proposal.
4. Daily Plan có rule validation.
5. Speaking feedback khi có audio pipeline phù hợp.
6. Phân tích tiến độ và TOEIC nâng cao.
