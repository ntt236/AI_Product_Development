import * as React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Inbox, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

/* -------------------------------------------------------------------------
   1. Loading State
   ------------------------------------------------------------------------- */
export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  description?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function LoadingState({
  message = 'Đang tải dữ liệu...',
  description,
  size = 'default',
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm',
        size === 'sm' && 'p-4 min-h-[140px]',
        size === 'default' && 'p-8 min-h-[220px]',
        size === 'lg' && 'p-12 min-h-[340px]',
        className
      )}
      {...props}
    >
      <div className="relative mb-3">
        <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-md animate-pulse" />
        <Loader2 className="relative h-8 w-8 animate-spin text-sky-400" />
      </div>
      <p className="text-sm font-semibold text-foreground">{message}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   2. Empty State
   ------------------------------------------------------------------------- */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return <Inbox className="h-7 w-7 text-sky-400/80" />;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="h-7 w-7 text-sky-400/80" />;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-dashed border-border/80 bg-card/30 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/80 border border-white/5 text-muted-foreground mb-4 shadow-inner">
        {renderIcon()}
      </div>
      <h4 className="text-base sm:text-lg font-bold text-foreground mb-1">{title}</h4>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mb-2">{action}</div>}
      {actionLabel && (onAction || actionHref) && (
        <div>
          {actionHref ? (
            <Button asChild variant="outline" size="sm">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button onClick={onAction} variant="outline" size="sm">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
   3. Error State
   ------------------------------------------------------------------------- */
export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Đã có lỗi xảy ra',
  message,
  onRetry,
  retryLabel = 'Thử lại',
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-xl border border-red-500/30 bg-red-950/20 text-red-200 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30 text-red-400 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="text-base font-bold text-red-300 mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-red-300/80 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="destructive"
          size="sm"
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   4. Success State
   ------------------------------------------------------------------------- */
export interface SuccessStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SuccessState({
  title,
  description,
  actionLabel,
  onAction,
  className,
  children,
  ...props
}: SuccessStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-200 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-3">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h4 className="text-base sm:text-lg font-bold text-emerald-300 mb-1">{title}</h4>
      {description && (
        <p className="text-xs sm:text-sm text-emerald-300/80 max-w-md mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="success" size="sm">
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
   5. Skeleton Placeholder
   ------------------------------------------------------------------------- */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-secondary/80 border border-white/5', className)}
      {...props}
    />
  );
}
