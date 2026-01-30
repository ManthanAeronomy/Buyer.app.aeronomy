'use client'

import { Plane, LayoutDashboard, Package, Building2, HandCoins, FileText, Home, Factory, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { SignOutButton } from '@clerk/nextjs'

interface DashboardSidebarProps {
  activeTab: 'home' | 'marketplace' | 'producers' | 'my-lots' | 'organization' | 'bids' | 'contracts'
  onTabChange: (tab: 'home' | 'marketplace' | 'producers' | 'my-lots' | 'organization' | 'bids' | 'contracts') => void
  organizationType?: string | null
}

export default function DashboardSidebar({ activeTab, onTabChange, organizationType }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const allMenuItems = [
    { id: 'home' as const, label: 'Dashboard', icon: Home },
    { id: 'marketplace' as const, label: 'SAF Marketplace', icon: Package },
    { id: 'producers' as const, label: 'Producers', icon: Factory },
    { id: 'my-lots' as const, label: 'My Listings', icon: LayoutDashboard },
    { id: 'bids' as const, label: 'Bids Received', icon: HandCoins },
    { id: 'contracts' as const, label: 'Contracts', icon: FileText },
    { id: 'organization' as const, label: 'Organization', icon: Building2 },
  ]

  const menuItems = allMenuItems.filter(item => {
    return true
  })

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-blue-100 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Logo Section */}
      <div className={`flex h-16 items-center border-b border-blue-900/20 bg-[#1e3a5f] ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Plane className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="text-xl font-semibold tracking-tight">
              <span className="text-white">Aero</span>
              <span className="text-blue-400">nomy</span>
            </span>
          )}
        </Link>

        {/* Collapse Toggle - Inside sidebar, always visible */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed - shown below logo */}
      {collapsed && (
        <div className="flex justify-center py-3 border-b border-blue-100">
          <button
            onClick={() => setCollapsed(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer / Sign Out */}
      <div className="border-t border-blue-100 p-3">
        <SignOutButton redirectUrl="/sign-in">
          <button
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors ${collapsed ? 'justify-center' : ''
              }`}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
