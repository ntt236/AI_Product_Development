'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from './schemas';
import { redirect } from 'next/navigation';

export interface AuthActionResult {
  success: boolean;
  error?: string;
  requireEmailVerification?: boolean;
}

/**
 * Handles user login with email and password via Supabase Auth.
 */
export async function signInAction(rawInput: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Thông tin đăng nhập không hợp lệ.',
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let friendlyMessage = 'Đăng nhập không thành công.';
    if (error.message.includes('Invalid login credentials')) {
      friendlyMessage = 'Email hoặc mật khẩu không chính xác.';
    } else if (error.message.includes('Email not confirmed')) {
      friendlyMessage = 'Email của bạn chưa được xác minh. Vui lòng kiểm tra hộp thư.';
    } else {
      friendlyMessage = error.message;
    }
    return { success: false, error: friendlyMessage };
  }

  return { success: true };
}

/**
 * Handles user registration with email, password, and display name.
 */
export async function signUpAction(rawInput: RegisterInput): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Thông tin đăng ký không hợp lệ.',
    };
  }

  const { email, password, displayName } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0],
      },
    },
  });

  if (error) {
    let friendlyMessage = 'Đăng ký không thành công.';
    if (error.message.includes('already registered')) {
      friendlyMessage = 'Email này đã được đăng ký trong hệ thống.';
    } else {
      friendlyMessage = error.message;
    }
    return { success: false, error: friendlyMessage };
  }

  // If Supabase has email confirmation enabled, user is created but session is null
  const requireEmailVerification = Boolean(data.user && !data.session);

  return {
    success: true,
    requireEmailVerification,
  };
}

/**
 * Signs the user out from Supabase Auth and redirects to login page.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
