# Báo Cáo Phiên Làm Việc: Triển Khai Toàn Bộ Phase 6 (Vocabulary Review)

**Ngày thực hiện:** 2026-10-19  
**Nhánh:** `phase-6`  
**Mục tiêu:** Triển khai toàn bộ Phase 6: Sổ từ vựng cá nhân & Ôn tập ngắt quãng (Vocabulary Notebook & Spaced Review Schedule) theo đúng phạm vi và Definition of Done trong `docs/product/DEVELOPMENT_ROADMAP.md`. Đây là một vertical slice hoàn chỉnh, tuyệt đối không mở rộng sang Phase 7.

---

## 1. Kết quả triển khai theo Vertical Slices

### Slice 6.1 — Database Migration, Curated Vocabulary Bank Seed & RLS Isolation
- **Tạo migration file**: [supabase/migrations/20261019_phase_6_vocabulary_review.sql](file:///d:/AI_Product_Development/supabase/migrations/20261019_phase_6_vocabulary_review.sql)
- **Các bảng cốt lõi**:
  - `public.vocabulary_items`: Kho từ vựng giáo trình chuẩn (`word`, `word_normalized`, `part_of_speech`, `ipa`, `meaning_vi`, `example`, `note`, `topic`, `level`, `is_published`).
  - `public.user_vocabulary`: Sổ từ vựng cá nhân của từng người học (`user_id`, `vocabulary_item_id`, `word`, `word_normalized`, `part_of_speech`, `ipa`, `meaning_vi`, `example`, `custom_notes`, `status`, `interval_days`, `consecutive_correct`, `review_count`, `last_reviewed_at`, `next_review_at`).
  - `public.vocabulary_review_logs`: Nhật ký lưu vết từng lượt trả lời trong phiên ôn tập (`user_id`, `user_vocab_id`, `review_session_id`, `result`, `interval_before`, `interval_after`, `reviewed_at`).
- **Nội dung giáo trình nền tảng thực tế (Curated Vocabulary Bank)**:
  - Tái sử dụng trọn vẹn bộ từ vựng `vocab-daily-routine` (6 từ: *wake up, have breakfast, commute, prepare, schedule, relax*).
  - Bổ sung bộ từ vựng công sở thiết yếu thứ 2 `vocab-office-communication` (6 từ: *colleague, deadline, presentation, feedback, collaborate, postpone*).
  - Seed 5 câu hỏi trắc nghiệm tương tác và 5 đáp án đúng bảo mật server-only vào database qua script [scripts/apply_phase_6_seed.mjs](file:///d:/AI_Product_Development/scripts/apply_phase_6_seed.mjs).
  - Toàn bộ 12 từ vựng có định dạng chuẩn mực sư phạm, đầy đủ phiên âm IPA, từ loại, dịch nghĩa tiếng Việt và câu ví dụ minh họa.
- **Bảo mật RLS & Least Privilege**:
  - Bật và ép buộc RLS (`ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`) trên toàn bộ các bảng.
  - Phân quyền nghiêm ngặt: Role `authenticated` chỉ có quyền SELECT/INSERT/UPDATE/DELETE trên các dòng của chính mình (`auth.uid() = user_id`).
  - Bảng `vocabulary_review_logs` thu hồi quyền UPDATE/DELETE khỏi `authenticated` để bảo vệ tính bất biến của lịch sử học tập.
  - Ràng buộc dữ liệu chống trùng lặp: `unique(user_id, word_normalized)` trên `user_vocabulary` và `unique(review_session_id, user_vocab_id)` trên `vocabulary_review_logs`.

### Slice 6.2 — Personal Vocabulary Notebook & Deduplication Engine
- **Mã nguồn**:
  - [src/modules/vocabulary/types.ts](file:///d:/AI_Product_Development/src/modules/vocabulary/types.ts): Định nghĩa kiểu dữ liệu `UserVocabularyItem`, `CuratedVocabularyItem`, `VocabularyStats`, và Zod validation schemas (`SaveWordInputSchema`, `SubmitReviewSessionSchema`).
  - [src/modules/vocabulary/schedule.ts](file:///d:/AI_Product_Development/src/modules/vocabulary/schedule.ts):
    - Hàm `normalizeWord(word)`: Chuẩn hóa `lower(trim(word))` loại bỏ khoảng trắng thừa và không phân biệt chữ hoa chữ thường.
    - Hàm `calculateNextReviewSchedule(consecutive, result, baseDate)`: Thuật toán tính lịch ôn tập xác định.
  - [src/modules/vocabulary/services.ts](file:///d:/AI_Product_Development/src/modules/vocabulary/services.ts):
    - `saveWordToNotebook(userId, input)`: Lưu từ vựng vào sổ cá nhân. Tự động kiểm tra trùng lặp theo `(userId, word_normalized)`. Nếu từ đã tồn tại, cập nhật `custom_notes` mà không làm reset chu kỳ ôn tập.
    - `deleteWordFromNotebook(userId, vocabId)`: Xóa từ vựng khỏi sổ, bắt buộc xác minh quyền sở hữu (`user_id = userId`).
    - `getUserVocabularyList(userId)`: Lấy toàn bộ danh sách từ vựng trong sổ cá nhân, sắp xếp theo thời gian thêm mới nhất.
    - `getVocabularyStats(userId)`: Thống kê số từ cần ôn hôm nay, tổng từ đã lưu, số từ đang học và số từ đã thuộc sâu.

### Slice 6.3 — Deterministic Review Schedule & Idempotency Guard
- **Quy tắc lịch ôn đơn giản & Xác định (Deterministic Schedule)**:
  - Khi người học đánh giá **"✅ Đã nhớ" (`remembered`)**:
    - Tăng chuỗi đúng liên tiếp (`consecutive_correct += 1`).
    - Thang chu kỳ ôn tập giãn cách:
      - Đúng 1 lần: Chu kỳ = 1 ngày, trạng thái `learning` (`next_review_at = now + 1 ngày`).
      - Đúng 2 lần: Chu kỳ = 3 ngày, trạng thái `learning` (`next_review_at = now + 3 ngày`).
      - Đúng 3 lần: Chu kỳ = 7 ngày, trạng thái `reviewing` (`next_review_at = now + 7 ngày`).
      - Đúng 4 lần: Chu kỳ = 14 ngày, trạng thái `reviewing` (`next_review_at = now + 14 ngày`).
      - Đúng 5+ lần: Chu kỳ = 30 ngày, trạng thái `mastered` (`next_review_at = now + 30 ngày`).
  - Khi người học đánh giá **"❌ Chưa nhớ" (`forgot`)**:
    - Đặt lại chuỗi đúng liên tiếp về 0 (`consecutive_correct = 0`).
    - Chu kỳ ôn tập đặt về 1 ngày (`interval_days = 1`).
    - Trạng thái quay về `learning` (`next_review_at = now + 1 ngày`).
- **Cơ chế chống gửi trùng lặp & tải lại trang (Idempotency Guard)**:
  - Mỗi phiên ôn tập được cấp một định danh duy nhất `reviewSessionId`.
  - Hàm `submitVocabularyReview()` kiểm tra xem `reviewSessionId` này đã được ghi nhận trong `vocabulary_review_logs` hay chưa.
  - Nếu request bị gửi lặp lại (do double click, tải lại trang, mất mạng gửi lại), hệ thống phát hiện `sessionAlreadyProcessed: true` và trả về ngay dữ liệu hiện tại, **tuyệt đối không cộng dồn chu kỳ hoặc tăng chuỗi đúng lần thứ 2**.
  - Ghi nhận bằng chứng học tập vào `public.learning_evidence` với `skill = 'vocabulary'` và `knowledge_type = 'spaced_repetition_review'`.

### Slice 6.4 — Giao Diện Người Dùng & Tích Hợp Hệ Thống
- **Mã nguồn**:
  - [src/components/layout/navbar.tsx](file:///d:/AI_Product_Development/src/components/layout/navbar.tsx): Thêm mục "📚 Sổ từ vựng" (`/vocabulary`) với trạng thái active trực quan.
  - [src/app/(app)/dashboard/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/dashboard/page.tsx): Thêm thẻ tiêu điểm Sổ từ vựng & Ôn tập hiển thị số từ cần ôn hôm nay, tổng từ đã lưu, số từ đang rèn luyện, số từ đã thuộc sâu và nút "🎯 Ôn tập ngay" dẫn thẳng vào phiên ôn.
  - [src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx](file:///d:/AI_Product_Development/src/app/(app)/daily-plan/practice/[taskId]/practice-session-view.tsx): Thêm nút "⭐ Lưu vào sổ từ" trên từng thẻ từ vựng trong bài học lý thuyết.
  - [src/app/(app)/vocabulary/page.tsx](file:///d:/AI_Product_Development/src/app/(app)/vocabulary/page.tsx) & [src/app/(app)/vocabulary/vocabulary-view.tsx](file:///d:/AI_Product_Development/src/app/(app)/vocabulary/vocabulary-view.tsx):
    - **Tab 1: Ôn tập đến hạn**:
      - Nếu không có từ đến hạn: Màn hình chúc mừng thân thiện, thông báo hệ thống tự động nhắc nhở khi đến hạn tiếp theo.
      - Nếu có từ đến hạn: Banner bắt đầu phiên ôn kèm danh sách từ xem trước.
      - Trình Flashcard phản xạ: Thẻ từ vựng mượt mà, mặt trước hiển thị từ, IPA, từ loại và mẹo phản xạ; bấm thẻ để lật mặt sau xem nghĩa tiếng Việt và ví dụ câu; 2 nút hành động "❌ Chưa nhớ" và "✅ Đã nhớ".
      - Màn hình tổng kết phiên ôn: Bảng đối chiếu kết quả từng từ, xem trước chu kỳ ôn mới và nút lưu kết quả an toàn.
    - **Tab 2: Sổ từ cá nhân**:
      - Thanh tìm kiếm từ khóa theo từ tiếng Anh hoặc nghĩa tiếng Việt.
      - Bộ lọc trạng thái: Tất cả, Đang học, Đang ôn, Đã thuộc.
      - Lưới thẻ từ vựng hiển thị đầy đủ thông tin, nhãn "Đến hạn ôn", chu kỳ ngày, chuỗi đúng và nút xóa từ.
    - **Tab 3: Từ vựng giáo trình**:
      - 12 từ vựng nền tảng chất lượng cao phân chia theo 2 chủ đề: "Sinh hoạt hàng ngày" và "Giao tiếp Nơi làm việc".
      - Nhận diện tức thì từ nào đã lưu (`✓ Đã lưu trong sổ từ`) và từ nào chưa lưu (`⭐ Lưu vào sổ từ`).
    - **Modal Thêm từ mới**:
      - Cho phép người học tự thêm bất kỳ từ vựng nào mình muốn lưu lại với các trường: Từ vựng (*bắt buộc*), Nghĩa tiếng Việt (*bắt buộc*), Từ loại, Phiên âm IPA, Câu ví dụ và Ghi chú cá nhân.

---

## 2. Kết quả kiểm thử & Kiểm chứng chất lượng

| Lệnh | Kết quả | Chi tiết |
|---|---|---|
| `npm test` | **PASS (126/126 tests)** | 10 test suites, 0 fail, 0 skip. Thêm 13 tests mới cho Phase 6 Vocabulary Lifecycle Suite. |
| `npx tsc --noEmit` | **PASS** | Exit code 0, TypeScript strict mode hoàn toàn sạch lỗi. |
| `npm run lint` | **PASS** | Exit code 0, "✔ No ESLint warnings or errors". |

### Chi tiết 13 bộ test mới trong Phase 6 (`tests/vocabulary/vocabulary_review_lifecycle.test.mjs`):
1. **Chuẩn hóa từ vựng (`normalizeWord`)**: Loại bỏ khoảng trắng thừa đầu cuối, chuyển chữ hoa thành chữ thường.
2. **Lưu và truy xuất sổ từ cá nhân**: Kiểm tra trường dữ liệu khởi tạo mặc định (`status = 'learning'`, `interval_days = 1`, `consecutive_correct = 0`).
3. **Ngăn chặn bản ghi trùng lặp**: Lưu hai lần cùng một từ với cách viết hoa/thường khác nhau chỉ tạo 1 bản ghi duy nhất và cập nhật ghi chú.
4. **Cô lập dữ liệu giữa hai người dùng (Anti-IDOR)**: Người dùng B không thấy từ của người dùng A và không thể xóa từ của người dùng A.
5. **Lọc chính xác từ đến hạn ôn**: Chỉ các từ có `next_review_at <= now` mới được đưa vào danh sách ôn tập.
6. **Lịch ôn xác định (Deterministic Progression)**: Kiểm tra chính xác bước nhảy chu kỳ: Quên -> 1d; Đúng 1 lần -> 1d; Đúng 2 lần -> 3d; Đúng 3 lần -> 7d; Đúng 4 lần -> 14d; Đúng 5+ lần -> 30d/mastered.
7. **Bảo vệ chống gửi trùng (Idempotency Guard)**: Gửi hai lần cùng một `reviewSessionId` không làm tăng chuỗi đúng hai lần.
8. **Thống kê sổ từ vựng**: Đếm chính xác số từ đến hạn, số từ đang học và số từ đã thuộc sâu.
9. **Zod Validation**: Từ chối từ vựng rỗng, nghĩa rỗng hoặc phiên ôn không có câu trả lời.
10. **Kiểm tra tính toàn vẹn của Curated Bank**: Đảm bảo đủ 12 từ vựng chuẩn mực với đầy đủ các trường thông tin.
11. **Chống giả mạo review log (Anti-IDOR)**: User A không thể cập nhật hoặc ghi log cho từ vựng của User B; từ chối toàn bộ phiên nếu có từ không hợp lệ (All-or-Nothing).
12. **Chống race condition & gửi trùng đồng thời**: Xử lý mượt mà khi có hai request cùng `review_session_id` chạy song song.
13. **Tính lũy đẳng (Idempotency) của logic Seed Data**: Chạy lặp lại seed mà không gây xung đột khóa ngoại.

---

## 3. Hướng dẫn kiểm thử thủ công trên trình duyệt

1. **Khởi chạy dev server**:
   ```bash
   npm run dev
   ```
2. **Truy cập ứng dụng**:
   - Mở trình duyệt tại `http://localhost:3000/dashboard`.
   - Quan sát thẻ tiêu điểm mới: **Sổ từ vựng & Ôn tập (Vocabulary Review)**.
3. **Truy cập trang Sổ từ vựng**:
   - Bấm vào mục "📚 Sổ từ vựng" trên thanh Navbar hoặc nút "Mở Sổ từ vựng" trên Dashboard để vào `/vocabulary`.
4. **Khám phá Từ vựng giáo trình & Lưu từ**:
   - Chuyển sang tab **"📖 Từ vựng giáo trình"**.
   - Bấm "⭐ Lưu vào sổ từ" cho một số từ (ví dụ: *colleague, deadline, commute*).
   - Nút chuyển trạng thái ngay thành "✓ Đã lưu trong sổ từ".
5. **Thêm từ mới thủ công**:
   - Bấm nút "+ Thêm từ mới" ở góc trên bên phải.
   - Nhập một từ tùy ý (ví dụ: `negotiate`, nghĩa: `đàm phán, thương lượng`).
   - Bấm "Lưu vào sổ". Từ vựng xuất hiện ngay trong tab "📒 Sổ từ cá nhân".
6. **Thực hiện một phiên ôn tập (Flashcard Review)**:
   - Chuyển sang tab **"🎯 Ôn tập đến hạn"**.
   - Bấm "🚀 Bắt đầu ôn tập".
   - Bấm vào thẻ để lật xem đáp án (mặt sau).
   - Bấm "✅ Đã nhớ" hoặc "❌ Chưa nhớ".
   - Ở màn hình tổng kết, kiểm tra xem trước chu kỳ mới và bấm "💾 Lưu & Hoàn thành phiên ôn".
   - Danh sách từ cần ôn được cập nhật, chu kỳ ngày ôn được kéo dài chính xác.
7. **Lưu từ trực tiếp từ bài học Daily Plan**:
   - Vào `/daily-plan`, mở bài học từ vựng (Daily Routine).
   - Trong Bước 1 (Nội dung bài học), bấm "⭐ Lưu vào sổ từ" trực tiếp trên từng thẻ từ vựng.

---

## 3.1. Bổ sung Audit & Hardening Kiến trúc Database (Bởi NTT-Backend)
1. **Khóa chặt Review Logs & Tối ưu RPC Nguyên Tử (`submit_vocabulary_review_session`)**:
   - Thu hồi hoàn toàn quyền `INSERT, UPDATE, DELETE` trên `public.vocabulary_review_logs` khỏi role `authenticated`.
   - Tạo RPC nguyên tử `public.submit_vocabulary_review_session` (`SECURITY DEFINER` với **`SET search_path = ''`** và schema-qualify toàn bộ hàm/bảng):
     - **Chống race condition & gửi trùng lặp đồng thời**: Dùng `pg_catalog.pg_advisory_xact_lock(...)` trên hash của cặp `(user_id, review_session_id)`. Mọi request đồng thời cùng session đều phải đợi request trước commit, rồi unblock đọc `v_log_count > 0` và trả về `session_already_processed: true` mượt mà, không gặp lỗi unique constraint abort.
     - **Sửa lỗi `interval_before`**: Lưu giá trị khoảng cách cũ (`v_user_vocab.interval_days`) vào biến `v_interval_before` *trước* khi chạy lệnh `UPDATE`, đảm bảo nhật ký `vocabulary_review_logs` lưu đúng khoảng cách cũ (`interval_before`) và khoảng cách mới (`interval_after`).
     - **Từ chối toàn bộ phiên (All-or-Nothing Rejection)**: Loại bỏ hoàn toàn nhánh `continue` khi duyệt danh sách từ. Nếu có bất kỳ từ nào không tồn tại hoặc không thuộc quyền sở hữu của `user_id`, ném ngoại lệ `UNAUTHORIZED_OR_NOT_FOUND` và rollback toàn bộ transaction; đồng thời chặn trùng lặp từ vựng trong cùng một payload (`INVALID_INPUT`).
     - Khóa dòng dữ liệu mục tiêu bằng `FOR UPDATE`.
2. **Sửa Seed Data Lũy Đẳng (Dynamic Foreign Key Resolution)**:
   - Thay thế toàn bộ hardcoded UUIDs bằng khối PL/pgSQL `DO $$` và script JavaScript phân giải ID thực tế qua các khóa tự nhiên (`slug` và `(content_item_id, position)`).
   - Bảo đảm chạy seed lặp lại nhiều lần trên database có sẵn không bao giờ gặp lỗi Foreign Key Constraint.
3. **Bổ sung 4 Foreign Key Indexes & Index phân trang**:
   - `vocabulary_items(content_item_id)`, `user_vocabulary(vocabulary_item_id)`, `vocabulary_review_logs(user_vocab_id)`, `vocabulary_review_logs(user_id, review_session_id)`.
   - `user_vocabulary(user_id, created_at desc)` giúp tăng tốc độ truy vấn sổ từ cá nhân.
4. **Triggers & Check Constraints**:
   - Gắn trigger `handle_updated_at()` tự động cập nhật thời gian sửa đổi cho cả 2 bảng.
   - Thêm ràng buộc chống chuỗi rỗng `char_length(trim(...)) > 0`, giới hạn cận an toàn cho chu kỳ ôn tập.
5. **Mở rộng Test Suite (126 tests)**:
   - Test 7: Kiểm tra `interval_before` và `interval_after` lưu đúng giá trị cũ/mới qua nhiều vòng ôn tập (1d -> 3d -> 7d).
   - Test 11: Kiểm tra Anti-IDOR và Tất cả hoặc không (All-or-Nothing Rejection khi gặp từ của người khác hoặc lặp từ trong payload).
   - Test 12: Chống race condition & gửi trùng lặp đồng thời (Concurrent submissions).
   - Test 13: Tính lũy đẳng của seed data khi chạy lặp lại.

---

## 4. Giới hạn còn lại & Phạm vi bàn giao
- **Giới hạn có chủ đích (In-scope Constraints)**:
  - Áp dụng lịch ôn giãn cách đơn giản, có tính xác định cao (Deterministic Ladder: 1d -> 3d -> 7d -> 14d -> 30d), không tích hợp các giải thuật ML/SuperMemo SM-2 phức tạp trong Phase này theo đúng yêu cầu đề bài.
  - Không xây dựng Admin CMS để thêm từ vựng hàng loạt từ bên ngoài.
- **Ranh giới kiểm chứng (Evidence Boundary)**:
  - **Đã kiểm chứng tự động (PASS)**: 126/126 automated unit/integration tests trên node test runner, TypeScript compiler và ESLint (0 errors, 0 warnings).
  - **Cần xác minh thủ công trên PostgreSQL/Supabase thật (Production Run)**: Chạy file migration [20261019_phase_6_vocabulary_review.sql](file:///d:/AI_Product_Development/supabase/migrations/20261019_phase_6_vocabulary_review.sql) trên Supabase SQL Editor khi deploy môi trường thực tế.
- **Tính tương thích**:
  - Không gây bất kỳ ảnh hưởng nào đến bài học Vocabulary, Grammar, Listening mẫu hoặc AI Tutor hiện có (100% 126 tests passed).
- **Trạng thái**: Hoàn tất 100% Definition of Done của Phase 6, sẵn sàng cho Phase 7.
