import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2.5 text-sm",
          variant === 'primary'
            ? "bg-brand text-white hover:opacity-90 active:scale-[0.98] rounded-sm"
            : "bg-white border-[1.5px] border-border text-ink hover:bg-surface active:scale-[0.98] rounded-sm",
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
