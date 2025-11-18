'use client'

import { Plane, LayoutDashboard, Package, Building2, HandCoins, FileText } from 'lucide-react'
import Link from 'next/link'

interface DashboardSidebarProps {
  activeTab: 'marketplace' | 'my-lots' | 'organization' | 'bids' | 'contracts'
  onTabChange: (tab: 'marketplace' | 'my-lots' | 'organization' | 'bids' | 'contracts') => void
}

export default function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const menuItems = [
    {
      id: 'marketplace' as const,
      label: 'Marketplace',
      icon: LayoutDashboard,
    },
    {
      id: 'my-lots' as const,
      label: 'My Lots',
      icon: Package,
    },
    {
      id: 'organization' as const,
      label: 'Organization',
      icon: Building2,
    },
    {
      id: 'bids' as const,
      label: 'Bids Received',
      icon: HandCoins,
    },
    {
      id: 'contracts' as const,
      label: 'Contracts',
      icon: FileText,
    },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Plane className="h-7 w-7 text-primary-400" />
          <span className="text-xl font-bold">
            <span className="text-white">Aero</span>
            <span className="text-primary-400">nomy</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

