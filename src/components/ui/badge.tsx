import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary/15 text-primary border border-primary/25',
        secondary:
          'bg-secondary text-secondary-foreground border border-white/5',
        success:
          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        warning:
          'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        info:
          'bg-sky-500/15 text-sky-400 border border-sky-500/30',
        destructive:
          'bg-red-500/15 text-red-400 border border-red-500/30',
        outline:
          'border border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
