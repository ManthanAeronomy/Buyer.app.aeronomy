'use client'

import { Plane, LayoutDashboard, Package, Building2, HandCoins, FileText } from 'lucide-react'
import Link from 'next/link'

interface DashboardNavbarProps {
  activeTab: 'marketplace' | 'my-lots' | 'organization' | 'bids' | 'contracts'
  onTabChange: (tab: 'marketplace' | 'my-lots' | 'organization' | 'bids' | 'contracts') => void
}

export default function DashboardNavbar({ activeTab, onTabChange }: DashboardNavbarProps) {
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
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Plane className="h-7 w-7 text-primary-600" />
            <span className="text-xl font-bold">
              <span className="text-slate-900">Aero</span>
              <span className="text-primary-600">nomy</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}



