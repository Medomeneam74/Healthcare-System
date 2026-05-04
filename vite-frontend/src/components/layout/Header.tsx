import React from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'

interface HeaderProps {
  onMenuClick: () => void
}

const ROUTE_TITLES: Record<string, string> = {
  '/patient/health-passport':  'Health Passport',
  '/doctor/dashboard':         'Clinical Dashboard',
  '/receptionist/dashboard':   'Receptionist Portal',
  '/admin-hospital/staff':     'Staff Management',
  '/admin/facilities':         'Facility Management',
  '/pharmacist/dashboard':     'Pharmacy',
  '/profile':                  'Profile',
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const title = ROUTE_TITLES[location.pathname] ?? 'NFC Healthcare'

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  const displayName = user?.name ?? (fullName || (user?.email ?? 'User'))
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="flex h-13 flex-shrink-0 items-center justify-between border-b border-line bg-canvas-raised px-4 lg:px-6" style={{ height: '52px' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-ink-muted hover:bg-canvas-subtle hover:text-ink transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded-md text-ink-muted hover:bg-canvas-subtle hover:text-ink transition-colors"
          aria-label="Notifications"
          onClick={() => toast({ title: 'No new notifications', variant: 'default' })}
        >
          <Bell className="h-4.5 w-4.5" style={{ width: '1.0625rem', height: '1.0625rem' }} />
        </button>

        <div className="ml-1 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-fg text-xs font-semibold">
            {initial}
          </div>
          <span className="hidden sm:block text-sm text-ink-secondary max-w-[120px] truncate">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  )
}
