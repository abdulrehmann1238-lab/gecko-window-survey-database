import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[12px] font-semibold uppercase tracking-wider text-ink-2 mb-1.5 font-ui">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-ink-3 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-elevated text-ink font-ui text-[14px] px-3 py-1.5 h-9 rounded-r2 border transition-colors duration-120
              ${leftIcon ? 'pl-9' : ''}
              ${rightIcon ? 'pr-9' : ''}
              ${error ? 'border-error focus:border-error focus:ring-1 focus:ring-error' : 'border-line-strong hover:border-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1'}
              disabled:bg-[#F2EFE8] disabled:text-ink-3 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-ink-3 pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-[12px] text-error font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-[12px] text-ink-3">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
