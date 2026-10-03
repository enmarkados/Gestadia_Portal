import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dangerSoft' | 'successSoft';
type AppButtonSize = 'sm' | 'md';

type AppButtonProps = React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  isLoading?: boolean;
  size?: AppButtonSize;
  variant?: AppButtonVariant;
}>;

const variantStyles: Record<AppButtonVariant, string> = {
  primary: 'border-transparent bg-brand-navy text-white shadow-sm hover:bg-brand-navy/90',
  secondary: 'border-brand-blue-light bg-white text-brand-navy hover:bg-brand-light',
  ghost: 'border-transparent bg-transparent text-brand-navy hover:bg-brand-light',
  dangerSoft: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  successSoft: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
};

const sizeStyles: Record<AppButtonSize, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
};

export function AppButton({
  children,
  className,
  disabled,
  icon,
  isLoading = false,
  size = 'md',
  type = 'button',
  variant = 'secondary',
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border py-2 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold/35 disabled:cursor-not-allowed disabled:opacity-60',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
