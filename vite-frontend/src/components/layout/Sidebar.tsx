import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Heart,
  LayoutDashboard,
  FileText,
  Building2,
  UserPlus,
  Stethoscope,
  ClipboardList,
  AlertTriangle,
  LogOut,
  Activity,
  UserCog,
  Package,
  FlaskConical,
  CreditCard,
  BarChart2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  patient: [
    { label: 'Health Passport', to: '/patient/health-passport', icon: Heart },
  ],
  doctor: [
    { label: 'Dashboard', to: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'DDI Reports', to: '/doctor/dashboard#ddi-log', icon: AlertTriangle },
  ],
  receptionist: [
    { label: 'Queue Manager', to: '/receptionist/dashboard#queue', icon: ClipboardList },
    { label: 'Doctors', to: '/receptionist/dashboard#doctors', icon: Stethoscope },
  ],
  admin_hospital: [
    { label: 'Overview', to: '/admin-hospital/staff#overview', icon: LayoutDashboard },
    { label: 'Receptionists', to: '/admin-hospital/staff#receptionists', icon: UserCog },
    { label: 'Pharmacists', to: '/admin-hospital/staff#pharmacists', icon: FlaskConical },
    { label: 'Doctors', to: '/admin-hospital/staff#doctors', icon: Stethoscope },
    { label: 'Departments', to: '/admin-hospital/staff#departments', icon: Building2 },
  ],
  admin: [
    { label: 'Overview', to: '/admin/facilities#overview', icon: LayoutDashboard },
    { label: 'Hospitals', to: '/admin/facilities#hospitals', icon: Building2 },
    { label: 'Hospital Admins', to: '/admin/facilities#admins', icon: UserCog },
    { label: 'NFC Cards', to: '/admin/facilities#cards', icon: CreditCard },
  ],
  super_admin: [],
  pharmacist: [
    { label: 'Inventory', to: '/pharmacist/dashboard#inventory', icon: Package },
    { label: 'Dispense', to: '/pharmacist/dashboard#dispense', icon: ClipboardList },
    { label: 'History', to: '/pharmacist/dashboard#history', icon: FileText },
    { label: 'Reports', to: '/pharmacist/dashboard#reports', icon: BarChart2 },
  ],
}

const ROLE_LABELS: Record<Role, string> = {
  patient:        'Patient',
  doctor:         'Doctor',
  receptionist:   'Receptionist',
  admin_hospital: 'Hospital Admin',
  admin:          'Administrator',
  super_admin:    'Super Admin',
  pharmacist:     'Pharmacist',
}

const BASE_NAV =
  'relative w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]'

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname + location.hash
  const role = user?.role ?? 'patient'
  const items = NAV_ITEMS[role] ?? []

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  const displayName = user?.name ?? (fullName || (user?.email ?? 'User'))
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex h-full flex-col bg-sidebar">

      {/* Brand — animate in on mount */}
      <div
        className="flex items-center gap-3 px-5 py-5 animate-sidebar-item"
        style={{ animationDelay: '0ms' }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent flex-shrink-0">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-tight tracking-tight">NFC Healthcare</p>
          <p className="text-2xs text-sidebar-muted mt-0.5">Clinical System</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {items.map((item, i) => {
          const Icon = item.icon
          const isActive = item.to.includes('#')
            ? currentPath === item.to
            : location.pathname === item.to && !location.hash
          const delay = `${(i + 1) * 55}ms`

          return (
            <button
              key={item.to}
              onClick={() => {
                navigate(item.to)
                if (!item.to.includes('#')) {
                  document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' })
                }
                onClose?.()
              }}
              style={{ animationDelay: delay }}
              className={`${BASE_NAV} animate-sidebar-item overflow-hidden ${
                isActive
                  ? 'bg-sidebar-active text-white font-medium'
                  : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 inset-y-1.5 w-[3px] bg-white/80 rounded-r-full" />
              )}
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User section */}
      <div className="mx-4 h-px bg-sidebar-border" />
      <div className="p-3 space-y-0.5">
        <button
          onClick={() => { navigate('/profile'); onClose?.() }}
          style={{ animationDelay: `${(items.length + 1) * 55}ms` }}
          className={`${BASE_NAV} animate-sidebar-item text-left ${
            location.pathname === '/profile' ? 'bg-sidebar-active text-white font-medium' : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-white'
          }`}
        >
          {location.pathname === '/profile' && (
            <span className="absolute left-0 inset-y-1.5 w-[3px] bg-white/80 rounded-r-full" />
          )}
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-subtle text-white text-xs font-bold">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate leading-tight">{displayName}</p>
            <p className="text-2xs text-sidebar-muted mt-0.5">{ROLE_LABELS[role]}</p>
          </div>
        </button>
        <button
          onClick={logout}
          style={{ animationDelay: `${(items.length + 2) * 55}ms` }}
          className={`${BASE_NAV} animate-sidebar-item text-sidebar-muted hover:bg-sidebar-hover hover:text-white`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )
}
