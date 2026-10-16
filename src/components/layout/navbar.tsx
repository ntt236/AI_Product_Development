import React from 'react';
import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';

export interface NavbarProps {
  displayName?: string;
  email?: string;
  activePath?: 'dashboard' | 'learning-path' | 'assessment';
}

export function Navbar({ displayName, email, activePath }: NavbarProps) {
  const userName = displayName || (email ? email.split('@')[0] : 'Học viên');

  return (
    <header className="navbar" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <span>🌱</span>
          <span style={{ fontWeight: 700 }}>AI English Platform</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/dashboard"
            style={{
              color: activePath === 'dashboard' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: activePath === 'dashboard' ? 600 : 400,
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: activePath === 'dashboard' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            📊 Dashboard
          </Link>
          <Link
            href="/learning-path"
            style={{
              color: activePath === 'learning-path' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: activePath === 'learning-path' ? 600 : 400,
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: activePath === 'learning-path' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            🗺️ Lộ trình học
          </Link>
          <Link
            href="/assessment"
            style={{
              color: activePath === 'assessment' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: activePath === 'assessment' ? 600 : 400,
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: activePath === 'assessment' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            🎯 Đánh giá đầu vào
          </Link>
        </nav>
      </div>

      <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Xin chào, <strong>{userName}</strong>
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
