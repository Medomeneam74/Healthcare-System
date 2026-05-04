import React from 'react'
import { twMerge } from 'tailwind-merge'

const urgencyStyles = {
  critical: 'border-l-[3px] border-l-sev-critical-fg',
  warning:  'border-l-[3px] border-l-sev-high-fg',
  safe:     'border-l-[3px] border-l-sev-none-fg',
} as const

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  urgency?: keyof typeof urgencyStyles
}

export function Card({ className, urgency, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        'rounded-lg border border-line bg-canvas-raised shadow-card',
        urgency && urgencyStyles[urgency],
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge('flex flex-col space-y-1.5 p-5 pb-3', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge('text-base font-semibold leading-none tracking-tight text-ink', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={twMerge('text-sm text-ink-secondary mt-1', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge('p-5 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge('flex items-center p-5 pt-0 gap-2', className)} {...props} />
  )
}
