'use client';

import React, { Suspense, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { signInAction } from '@/modules/auth/actions';
import { AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    startTransition(async () => {
      const result = await signInAction({ email, password });
      if (!result.success) {
        setError(result.error || 'Đăng nhập không thành công.');
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5" htmlFor="email">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Email</span>
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
            <span>Mật khẩu</span>
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            required
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          isLoading={isPending}
          className="w-full font-bold shadow-lg shadow-cyan-500/20 mt-2"
        >
          <span>Đăng nhập</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
          <h1 className="text-2xl font-extrabold tracking-tight">Đăng nhập tài khoản</h1>
          <p className="text-xs text-muted-foreground">
            Chào mừng trở lại! Tiếp tục hành trình học tập cá nhân hóa của bạn.
          </p>
        </div>

        <Card className="shadow-2xl border-cyan-500/20">
          <CardContent className="p-6 sm:p-8">
            <Suspense fallback={<div className="text-center text-xs text-muted-foreground py-6">Đang tải biểu mẫu...</div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
