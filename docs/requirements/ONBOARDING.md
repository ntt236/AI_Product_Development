# Requirements — Onboarding

**Module:** ONBOARDING  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Thu thập thông tin ban đầu để hệ thống hiểu mục tiêu, thời gian học và nhu cầu của người dùng trước khi thực hiện placement test.

## 2. Onboarding Flow

```text
Register
   ↓
Welcome
   ↓
Choose Goals
   ↓
Set Goal Priority
   ↓
Available Study Time
   ↓
Learning Preferences
   ↓
Placement Test
```

## 3. Functional Requirements

### ONBOARD-01 — Welcome

Sau khi đăng ký, user được giới thiệu ngắn gọn về cách hệ thống hoạt động.

Thông tin chính:

- Assessment
- Learner Profile
- Personalized Learning Path
- Daily Plan
- Adaptive Learning

### ONBOARD-02 — Choose Goals

User có thể chọn một hoặc nhiều mục tiêu:

```text
Daily Communication
General English
Improve Listening
Improve Speaking
Improve Reading
Improve Writing
Build Vocabulary
Strengthen Grammar
TOEIC
Other
```

### ONBOARD-03 — Primary Goal

Nếu user chọn nhiều mục tiêu, bắt buộc xác định một **Primary Goal**.

Các mục tiêu còn lại là **Secondary Goals**.

### ONBOARD-04 — Goal Priority

User có thể xác định mức ưu tiên.

Ví dụ:

```text
TOEIC              Primary
Communication      Secondary
Speaking           Secondary
```

### ONBOARD-05 — Goal Target

Tùy loại goal, user có thể nhập target.

Ví dụ:

```text
TOEIC → 750
Communication → Daily conversation
Speaking → Improve fluency
```

### ONBOARD-06 — Available Study Time

User chọn thời gian học dự kiến:

```text
15 min/day
30 min/day
45 min/day
60 min/day
90+ min/day
Custom
```

### ONBOARD-07 — Learning Frequency

User chọn số ngày muốn học trong tuần.

Ví dụ:

```text
3 days/week
5 days/week
7 days/week
```

### ONBOARD-08 — Learning Preferences

Có thể thu thập:

- Preferred topics
- Preferred learning activities
- Preferred study time

Các thông tin này là dữ liệu hỗ trợ recommendation, không phải điều kiện bắt buộc cho MVP.

### ONBOARD-09 — Placement Test Entry

Sau khi hoàn thành onboarding, user được chuyển tới placement test.

Nếu user bỏ dở onboarding:
- Lưu progress.
- Cho phép tiếp tục sau.
- Không tạo learner profile hoàn chỉnh trước khi có assessment cần thiết.

### ONBOARD-10 — Onboarding Completion

Sau khi hoàn thành các bước bắt buộc:

```text
onboarding_completed = true
```

Sau đó user chuyển sang Placement Test hoặc bước tiếp theo trong flow.

## 4. Validation

- User phải có ít nhất 1 goal.
- Phải có đúng 1 Primary Goal.
- Study time phải là giá trị hợp lệ.
- Không cho phép tạo duplicate goal không cần thiết.
- Target phải phù hợp với loại goal.

## 5. Acceptance Criteria

- [ ] User chọn được một hoặc nhiều goals.
- [ ] User xác định được Primary Goal.
- [ ] User thiết lập được priority.
- [ ] User thiết lập được available study time.
- [ ] Hệ thống lưu onboarding data.
- [ ] User có thể tiếp tục onboarding nếu thoát giữa chừng.
- [ ] User được chuyển tới placement test sau onboarding.
- [ ] `onboarding_completed` được cập nhật chính xác.
