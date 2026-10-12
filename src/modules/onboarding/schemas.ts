import { z } from 'zod';

export const onboardingSchema = z.object({
  primaryGoal: z.string().min(1, 'Vui lòng chọn mục tiêu chính.'),
  secondaryGoals: z.array(z.string()).default([]),
  targetToeicScore: z.number().int().min(10).max(990).optional().nullable(),
  dailyMinutes: z.number().int().min(5, 'Tối thiểu 5 phút/ngày').max(240, 'Tối đa 240 phút/ngày'),
  studyDays: z.array(z.number().int().min(1).max(7)).min(1, 'Chọn ít nhất 1 ngày học/tuần'),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
