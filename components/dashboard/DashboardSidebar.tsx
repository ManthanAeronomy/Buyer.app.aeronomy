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

  // Filter menu items based on organization type
  const menuItems = allMenuItems.filter(item => {
    return true
  })

  return (
    <aside 
      className={`relative flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`relative flex h-16 items-center justify-between border-b border-slate-800 ${collapsed ? 'px-0' : 'px-6'}`}>
        <Link href="/" className={`flex items-center gap-2 ${collapsed ? 'mx-auto' : ''}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Plane className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold">
              <span className="text-white">Aero</span>
              <span className="text-blue-400">nomy</span>
            </span>
          )}
        </Link>
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white shadow-md z-20 transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-900/50 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} 
              />
              {!collapsed && <span>{item.label}</span>}
              
              {!collapsed && isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer / User Profile Area */}
      <div className="border-t border-slate-800 p-3">
        <SignOutButton redirectUrl="/sign-in">
          <button
            className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
