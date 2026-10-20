'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { signUpAction } from '@/modules/auth/actions';
import { AlertCircle, CheckCircle2, Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailVerificationNotice, setEmailVerificationNotice] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    startTransition(async () => {
      const result = await signUpAction({
        email,
        password,
        displayName: displayName || undefined,
      });

      if (!result.success) {
        setError(result.error || 'Đăng ký không thành công.');
      } else {
        if (result.requireEmailVerification) {
          setEmailVerificationNotice(true);
        } else {
          router.push('/onboarding');
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight">
            <span>🌱</span>
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              AI English Platform
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Tạo tài khoản mới</h1>
          <p className="text-xs text-muted-foreground">
            Bắt đầu hành trình học tiếng Anh cá nhân hóa cùng AI
          </p>
        </div>

        <Card className="shadow-2xl border-cyan-500/20">
          <CardContent className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {emailVerificationNotice ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Đăng ký thành công!</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Hệ thống đã gửi liên kết xác nhận tới <strong className="text-foreground">{email}</strong>.
                    Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) và nhấn vào liên kết xác minh để kích hoạt tài khoản.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/login">Chuyển tới Đăng nhập</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5" htmlFor="displayName">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Tên hiển thị (Tùy chọn)</span>
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Ví dụ: Hoàng Anh"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isPending}
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5" htmlFor="email">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Email <span className="text-rose-400">*</span></span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5" htmlFor="password">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Mật khẩu (Tối thiểu 6 ký tự) <span className="text-rose-400">*</span></span>
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={isPending}
                  className="w-full font-bold shadow-lg shadow-cyan-500/20 mt-2"
                >
                  <span>Tạo tài khoản</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            )}

            {!emailVerificationNotice && (
              <div className="text-center text-xs text-muted-foreground pt-2">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
                  Đăng nhập
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
