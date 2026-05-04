import React, { createContext, useContext, useState, useCallback } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export type ToastVariant = 'default' | 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { ...opts, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map(t => (
          <ToastPrimitive.Root
            key={t.id}
            className={twMerge(
              'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-card-md transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
              t.variant === 'success' && 'border-sev-none-line bg-sev-none-bg',
              t.variant === 'error'   && 'border-sev-critical-line bg-sev-critical-bg',
              t.variant === 'info'    && 'border-accent-muted bg-accent-light',
              (!t.variant || t.variant === 'default') && 'border-line bg-canvas-raised'
            )}
          >
            <div className="mt-0.5 flex-shrink-0">
              {t.variant === 'success' && <CheckCircle className="h-4 w-4 text-sev-none-fg" />}
              {t.variant === 'error'   && <AlertCircle className="h-4 w-4 text-sev-critical-fg" />}
              {t.variant === 'info'    && <Info className="h-4 w-4 text-accent" />}
              {(!t.variant || t.variant === 'default') && <Info className="h-4 w-4 text-ink-muted" />}
            </div>
            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="text-sm font-semibold text-ink">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-1 text-xs text-ink-secondary">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="shrink-0 rounded-sm text-ink-muted opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent">
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 p-0" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
