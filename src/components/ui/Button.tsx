import React from 'react';
import { Loader2, Check } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  isSuccess?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      isSuccess = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const base = 'inline-flex items-center justify-center font-ui text-[14px] font-medium transition-all duration-120 cursor-pointer select-none rounded-r2 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45';

    const variants = {
      primary: 'bg-primary text-elevated border-transparent hover:bg-primary-hover active:bg-primary-active active:translate-y-[1px]',
      secondary: 'bg-surface text-ink border-line-strong hover:bg-[#F2EFE8] active:bg-[#ECE8DF]',
      outline: 'bg-transparent text-primary border-primary hover:bg-primary-tint active:bg-primary-tint',
      ghost: 'bg-transparent text-ink border-transparent hover:bg-surface active:bg-[#ECE8DF]',
      danger: 'bg-error text-elevated border-transparent hover:bg-[#8E3B31] active:translate-y-[1px]',
      accent: 'bg-accent text-elevated border-transparent hover:bg-[#9E763D] active:translate-y-[1px]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-[13px] gap-1.5',
      md: 'h-9 px-4 text-[14px] gap-2',
      lg: 'h-11 px-5 text-[15px] gap-2.5',
      icon: 'h-8 w-8 p-0 text-[14px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>Loading...</span>
          </>
        ) : isSuccess ? (
          <>
            <Check className="w-4 h-4 text-current animate-in fade-in" />
            <span>Done</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
