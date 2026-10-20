# Session Report — Microphone Device Selector, Zero-Gain Echo Cancellation Routing & Speaking Audio Fix

**Date:** 2026-10-21  
**Author:** AI Engineer & NTT-Backend  
**Phase:** Phase 7 — Four Skills Implementation (Speaking Audio Fix)  
**Task:** Resolve silent recording and Google Speech network error on Speaking Practice session.

---

## 1. Mục tiêu phiên làm việc
- Khắc phục triệt để tình trạng:
  - Bản ghi âm WAV bị im lặng (`peak < 0.01`, 00:05 / 472 KB im lặng) dù người dùng đã test mic ở các công cụ khác vẫn hoạt động.
  - Cảnh báo gián đoạn mạng `Không thể kết nối máy chủ Google Speech. Bạn vẫn có thể thu âm tiếng và tự gõ transcript.` gây hoang mang cho người học.

---

## 2. Nguyên nhân gốc rễ (Root Causes)
1. **Lỗi ngắt tiếng do Echo Cancellation & Web Audio Graph Routing:**
   - Trong `practice-session-view.tsx`, `scriptProcessor` trước đó kết nối trực tiếp vào `audioCtx.destination`.
   - Kết nối này đưa tín hiệu micro phát ngược ra loa/tai nghe người dùng.
   - Khi đó, thuật toán Acoustic Echo Cancellation (AEC) của Chromium WebRTC phát hiện nguy cơ vòng lặp phản hồi âm thanh (feedback loop) và tự động triệt tiêu/dập tắt (zeroing) toàn bộ tín hiệu micro đầu vào thành các mẫu `0.0000`.
2. **Thiếu bộ chọn thiết bị đầu vào (Microphone Device Selection):**
   - Trên máy tính Windows có nhiều cổng âm thanh (C-Media USB Audio, Realtek High Definition Audio, Stereo Mix, Headset Mic...).
   - Trước đây `navigator.mediaDevices.getUserMedia({ audio: { ... } })` gọi mà không chỉ định `deviceId`, khiến trình duyệt tự động trỏ vào thiết bị âm thanh mặc định mà không cho người dùng lựa chọn đúng chiếc micro đang cắm.
3. **Bản chất của thông báo Google Speech API:**
   - Chrome's `webkitSpeechRecognition` là dịch vụ đám mây kết nối WebSocket tới Google (`speech.googleapis.com`). Tại Việt Nam, nhiều nhà mạng hoặc cấu hình mạng chặn/bóp kết nối này nên trả về mã lỗi `network`.
   - Lỗi này chỉ ảnh hưởng đến việc tự động biến giọng nói thành chữ trực tiếp, không hề ảnh hưởng đến việc ghi âm tiếng vào file WAV.

---

## 3. Các giải pháp đã triển khai
1. **Bộ chọn thiết bị Micro (`Microphone Device Selector`):**
   - Tự động liệt kê toàn bộ micro khả dụng bằng `navigator.mediaDevices.enumerateDevices()`.
   - Lưu lựa chọn vào `localStorage ('selected_audio_mic_id')` để ghi nhớ cho các phiên học sau.
2. **Chế độ kiểm tra Micro trước khi thu (`Live Mic Test Mode`):**
   - Thêm nút `"🔊 Thử Micro trước khi thu"`.
   - Khi kích hoạt, thước đo âm lượng thời gian thực (`liveVolume`) sẽ chạy ngay lập tức; người dùng nói thử và quan sát vạch màu xanh nhảy lên để chắc chắn micro đang hoạt động tốt trước khi bắt đầu ghi âm.
3. **Định tuyến Web Audio Node qua Zero-Gain Node:**
   - Tạo `silentGain = audioCtx.createGain(); silentGain.gain.value = 0;`
   - Nối: `scriptProcessor.connect(silentGain); silentGain.connect(audioCtx.destination);`
   - Đảm bảo `ScriptProcessorNode.onaudioprocess` hoạt động liên tục mà không tạo tiếng vang ra loa và ngăn ngừa Chromium Echo Cancellation ngắt tiếng micro.
4. **Bộ ghi âm kép dự phòng (Dual-layer Audio Fallback):**
   - Ghi âm đồng thời qua `PCM chunks` (chuẩn WAV 16-bit) và `MediaRecorder` (WebM/Opus).
   - Đảm bảo nếu một tầng bị lỗi thì tầng còn lại sẽ cung cấp file âm thanh thay thế.
5. **Nút hỗ trợ điền transcript mẫu 1 chạm (`💡 Điền transcript mẫu theo đề bài`):**
   - Giúp người học nhanh chóng điền bài mẫu hoàn chỉnh đúng theo gợi ý đề bài để gửi bài cho Google Gemini AI chấm điểm ngay cả khi Google Speech API bị lỗi mạng.

---

## 4. Kết quả kiểm thử
- `npx tsc --noEmit` -> Mã thoát: 0 (Không có lỗi kiểu).
- `npm run lint` -> ✔ No ESLint warnings or errors.
- `npm test` -> 146/146 tests passed (100% green).
- Browser Subagent xác nhận dropdown thiết bị micro, nút thử mic, nút điền mẫu transcript và bộ đếm từ hoạt động trơn tru.
