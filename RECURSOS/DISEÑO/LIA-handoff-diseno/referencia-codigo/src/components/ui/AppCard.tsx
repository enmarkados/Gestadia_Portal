import React from 'react';
import { cn } from '../../lib/utils';

type AppCardProps = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
}>;

export function AppCard({ className, interactive = false, ...props }: AppCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-brand-blue-light bg-white shadow-sm',
        interactive && 'transition-colors hover:border-brand-gold hover:bg-white',
        className
      )}
      {...props}
    />
  );
}
