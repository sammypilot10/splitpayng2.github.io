import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-fintech-navy text-white hover:bg-fintech-navy/90',
      secondary: 'bg-fintech-gold text-fintech-navy hover:bg-fintech-gold/90',
      outline: 'border border-fintech-navy text-fintech-navy hover:bg-fintech-slate',
      ghost: 'hover:bg-fintech-slate text-fintech-navy',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-fintech-gold disabled:opacity-50',
          variants[variant],
          className
        )}
        {...props}
      >
        {isLoading ? <span className="mr-2 animate-spin">⏳</span> : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'