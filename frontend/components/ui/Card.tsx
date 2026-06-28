import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white border border-border rounded-lg transition-shadow duration-300 hover:shadow-md",
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'
