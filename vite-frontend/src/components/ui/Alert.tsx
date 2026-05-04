import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const alertVariants = cva(
  'relative w-full rounded-lg border border-l-4 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
  {
    variants: {
      variant: {
        default:     'bg-canvas-raised border-line border-l-line text-ink',
        destructive: 'border-sev-critical-line border-l-sev-critical-fg bg-sev-critical-bg text-sev-critical-fg [&>svg]:text-sev-critical-fg',
        warning:     'border-sev-high-line border-l-sev-high-fg bg-sev-high-bg text-sev-high-fg [&>svg]:text-sev-high-fg',
        success:     'border-sev-none-line border-l-sev-none-fg bg-sev-none-bg text-sev-none-fg [&>svg]:text-sev-none-fg',
        info:        'border-accent-muted border-l-accent bg-accent-light text-accent [&>svg]:text-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      aria-live={variant === 'destructive' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={twMerge(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={twMerge('mb-1 font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={twMerge('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}
