import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default:     'bg-accent text-accent-fg',
        secondary:   'bg-canvas-subtle text-ink-secondary border border-line',
        destructive: 'bg-danger-light text-danger',
        outline:     'border border-line text-ink-secondary',
        success:     'bg-sev-none-bg text-sev-none-fg border border-sev-none-line',
        // Urgency-aligned severity variants — map directly to sev design tokens
        critical:    'bg-sev-critical-bg text-sev-critical-fg border border-sev-critical-line font-semibold',
        warning:     'bg-sev-high-bg text-sev-high-fg border border-sev-high-line',
        safe:        'bg-sev-none-bg text-sev-none-fg border border-sev-none-line',
        moderate:    'bg-sev-moderate-bg text-sev-moderate-fg border border-sev-moderate-line',
        low:         'bg-sev-low-bg text-sev-low-fg border border-sev-low-line',
        unknown:     'bg-sev-unknown-bg text-sev-unknown-fg border border-sev-unknown-line',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type BadgeSeverity = 'critical' | 'warning' | 'safe' | 'moderate' | 'low' | 'unknown'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={twMerge(badgeVariants({ variant }), className)} {...props} />
}
