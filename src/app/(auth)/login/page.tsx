'use client';

import React, { Suspense, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInAction } from '@/modules/auth/actions';

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
    <>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={isPending}
          style={{ marginTop: '0.75rem' }}
        >
          {isPending ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="auth-footer">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="auth-link">
          Đăng ký ngay
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="container">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Đăng nhập</h1>
          <p>Chào mừng trở lại với AI English Learning Platform</p>
        </div>

        <div className="card">
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>Đang tải form đăng nhập...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
