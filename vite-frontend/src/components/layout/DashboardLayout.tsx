import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { FloatingChat } from '@/components/chat/FloatingChat'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-overlay"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-56 z-50 flex flex-col shadow-card-lg animate-sidebar-mobile">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div key={location.pathname} className="animate-page-in">
            {children}
          </div>
        </main>
      </div>

      {user?.role === 'patient' && <FloatingChat />}
    </div>
  )
}
