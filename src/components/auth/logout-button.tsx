'use client';

import React, { useTransition } from 'react';
import { signOutAction } from '@/modules/auth/actions';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="btn btn-secondary btn-sm"
      disabled={isPending}
      type="button"
    >
      {isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
    </button>
  );
}
