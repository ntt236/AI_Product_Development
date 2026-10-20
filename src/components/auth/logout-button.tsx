'use client';

import React, { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { signOutAction } from '@/modules/auth/actions';
import { Button } from '@/components/ui/button';

export function LogoutButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      size="sm"
      disabled={isPending}
      isLoading={isPending}
      type="button"
      className={className}
      title="Đăng xuất khỏi hệ thống"
    >
      {!isPending && <LogOut className="h-4 w-4 text-muted-foreground" />}
      <span>Đăng xuất</span>
    </Button>
  );
}
