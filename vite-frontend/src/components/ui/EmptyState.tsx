import React from 'react'
import { twMerge } from 'tailwind-merge'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={twMerge('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      {icon && (
        <div className="mb-3 text-ink-faint">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-ink-muted max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}
