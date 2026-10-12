'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpAction } from '@/modules/auth/actions';

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
    <div className="container">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Tạo tài khoản</h1>
          <p>Bắt đầu hành trình học tiếng Anh cá nhân hóa cùng AI</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          {emailVerificationNotice ? (
            <div>
              <div className="alert alert-success">
                <strong>Đăng ký thành công!</strong>
                <p style={{ marginTop: '0.4rem' }}>
                  Hệ thống đã gửi liên kết xác nhận tới <strong>{email}</strong>.
                  Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) và nhấn vào liên kết xác minh để kích hoạt tài khoản.
                </p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link href="/login" className="btn btn-primary btn-full">
                  Chuyển tới Đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="displayName">
                  Tên hiển thị (Tùy chọn)
                </label>
                <input
                  id="displayName"
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Hoàng Anh"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isPending}
                  autoComplete="name"
                />
              </div>

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
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={isPending}
                style={{ marginTop: '0.75rem' }}
              >
                {isPending ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
              </button>
            </form>
          )}

          {!emailVerificationNotice && (
            <div className="auth-footer">
              Đã có tài khoản?{' '}
              <Link href="/login" className="auth-link">
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
