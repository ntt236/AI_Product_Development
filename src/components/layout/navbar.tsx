'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarCheck,
  Compass,
  Headphones,
  BookMarked,
  Target,
  Award,
  Flame,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';
import { cn } from '@/lib/utils';

export interface NavbarProps {
  displayName?: string;
  email?: string;
  activePath?: 'dashboard' | 'daily-plan' | 'learning-path' | 'assessment' | 'vocabulary' | 'skills' | 'toeic';
  streak?: {
    currentStreak: number;
    hasStudiedToday: boolean;
  };
}

export function Navbar({ displayName, email, activePath, streak }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userName = displayName || (email ? email.split('@')[0] : 'Học viên');
  const userInitial = userName.charAt(0).toUpperCase();

  const navItems = [
    {
      id: 'dashboard',
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'daily-plan',
      href: '/daily-plan',
      label: 'Kế hoạch ngày',
      icon: CalendarCheck,
    },
    {
      id: 'learning-path',
      href: '/learning-path',
      label: 'Lộ trình học',
      icon: Compass,
    },
    {
      id: 'skills',
      href: '/skills',
      label: '4 Kỹ năng',
      icon: Headphones,
    },
    {
      id: 'toeic',
      href: '/toeic',
      label: 'Luyện thi TOEIC',
      icon: Award,
    },
    {
      id: 'vocabulary',
      href: '/vocabulary',
      label: 'Sổ từ vựng',
      icon: BookMarked,
    },
    {
      id: 'assessment',
      href: '/assessment',
      label: 'Đánh giá đầu vào',
      icon: Target,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl transition-all">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 shadow-md shadow-sky-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AI English
              </span>
              <span className="text-[10px] -mt-1 font-semibold uppercase tracking-wider text-sky-400">
                Adaptive LMS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs lg:text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 font-semibold shadow-sm shadow-sky-500/10'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-sky-400' : 'text-muted-foreground')} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Right Section */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Streak Badge */}
          {streak !== undefined && (
            <Link
              href="/dashboard"
              title={
                streak.hasStudiedToday
                  ? `Chuỗi ${streak.currentStreak} ngày học liên tiếp (Đã học hôm nay)`
                  : `Chuỗi ${streak.currentStreak} ngày học liên tiếp (Chưa học hôm nay)`
              }
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 hover:scale-105',
                streak.hasStudiedToday
                  ? 'border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/20'
                  : 'border border-border/80 bg-secondary/60 text-muted-foreground hover:border-amber-500/30'
              )}
            >
              <Flame
                className={cn(
                  'h-4 w-4',
                  streak.hasStudiedToday ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-muted-foreground'
                )}
              />
              <span>{streak.currentStreak} ngày</span>
            </Link>
          )}

          {/* Desktop User Info & Logout */}
          <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-border/60">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500/20 to-blue-500/30 border border-sky-500/30 text-sky-300 font-bold text-xs shadow-inner">
                {userInitial}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-tight max-w-[120px] truncate">
                  {userName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">Học viên</span>
              </div>
            </div>
            <LogoutButton />
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-secondary/50 text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/80 bg-background/95 backdrop-blur-2xl px-4 py-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500/20 to-blue-500/30 border border-sky-500/30 text-sky-300 font-bold text-sm">
              {userInitial}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{userName}</span>
              <span className="text-xs text-muted-foreground">{email || 'Tài khoản người học'}</span>
            </div>
          </div>

          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 font-semibold'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-sky-400' : 'text-muted-foreground')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Phiên làm việc</span>
            <LogoutButton className="w-full sm:w-auto" />
          </div>
        </div>
      )}
    </header>
  );
}
