import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Email không đúng định dạng.'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự.')
    .max(72, 'Mật khẩu không được vượt quá 72 ký tự.'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự.')
    .max(50, 'Tên hiển thị không được vượt quá 50 ký tự.')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email không đúng định dạng.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
