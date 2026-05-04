import React from 'react'
import { twMerge } from 'tailwind-merge'

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={twMerge('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={twMerge('[&_tr]:border-b [&_tr]:border-line', className)} {...props} />
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={twMerge('[&_tr:last-child]:border-0', className)} {...props} />
  )
}

const rowUrgency = {
  critical: 'bg-sev-critical-bg border-l-2 border-l-sev-critical-fg hover:bg-sev-critical-bg',
  warning:  'bg-sev-high-bg border-l-2 border-l-sev-high-fg hover:bg-sev-high-bg',
  safe:     'bg-sev-none-bg hover:bg-sev-none-bg',
} as const

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  urgency?: keyof typeof rowUrgency
}

export function TableRow({ className, urgency, ...props }: TableRowProps) {
  return (
    <tr
      className={twMerge(
        'border-b border-line-subtle transition-colors hover:bg-canvas-subtle data-[state=selected]:bg-accent-light',
        urgency && rowUrgency[urgency],
        className
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={twMerge(
        'h-10 px-4 text-left align-middle font-medium text-ink-muted text-xs uppercase tracking-wide [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={twMerge('px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0 text-sm text-ink-secondary', className)}
      {...props}
    />
  )
}

export function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={twMerge('mt-4 text-sm text-ink-secondary', className)}
      {...props}
    />
  )
}
