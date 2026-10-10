# Requirements — Vocabulary

**Module:** VOCABULARY  
**Version:** 1.0  
**Status:** Draft

## 1. Mục tiêu

Vocabulary giúp người học học, ghi nhớ, sử dụng và ôn lại từ vựng theo mục tiêu cá nhân.

```text
Discover → Learn → Practice → Recall → Review → Use
```

## 2. Vocabulary Item

Mỗi từ có thể gồm:

```text
word
part_of_speech
meaning
pronunciation
example
level
topic
synonyms
antonyms
collocations
```

## 3. Vocabulary Topics

```text
Daily Life
Education
Work
Business
Travel
Food
Technology
Shopping
Communication
```

TOEIC có thể có:

```text
Office
Meetings
Finance
Marketing
Transportation
Manufacturing
```

## 4. Learning Flow

```text
New Word
 ↓
Meaning + Example
 ↓
Recognition Practice
 ↓
Recall Practice
 ↓
Production / Usage
 ↓
Review
```

## 5. Mastery

Có thể phân biệt:

```text
Recognition
Recall
Usage
```

Ví dụ:

```text
Recognition: 0.9
Recall:      0.6
Usage:       0.4
```

## 6. Spaced Review

MVP:

```text
1 day
3 days
7 days
14 days
30 days
```

Sau này có thể tích hợp FSRS hoặc algorithm khác.

## 7. Evidence

Theo dõi:

```text
correct_count
incorrect_count
last_reviewed_at
response_time
review_count
usage_count
```

## 8. AI Role

AI có thể:

- Giải thích nghĩa theo context.
- Tạo example.
- Tạo personalized practice.
- Tạo conversation.
- Phân biệt từ dễ nhầm.

## 9. Adaptive Integration

```text
Low mastery
→ More frequent review

High recognition + low usage
→ Production practice

High mastery
→ Increase spacing
```

## 10. Acceptance Criteria

- [ ] Có vocabulary item.
- [ ] Có level/topic.
- [ ] Có example.
- [ ] Có practice.
- [ ] Có mastery.
- [ ] Có review scheduling.
- [ ] Có evidence.
- [ ] Có recognition/recall/usage nếu khả thi.
- [ ] AI hỗ trợ context/practice.
- [ ] Adaptive Engine điều chỉnh review.
