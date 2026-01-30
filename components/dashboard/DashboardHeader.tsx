'use client'

import { Bell, Search, Settings, HelpCircle, LogOut, User, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { SignOutButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  activeTab: string
}

export default function DashboardHeader({ activeTab }: DashboardHeaderProps) {
  const { user } = useUser()
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Poll for notifications
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const bidsRes = await fetch('/api/bids?status=pending')
      const bidsData = await bidsRes.json()

      const producersRes = await fetch('/api/organizations/producers')
      const producersData = await producersRes.json()

      const newNotifications = []

      if (bidsData.count > 0) {
        newNotifications.push({
          id: 'bid-1',
          type: 'bid',
          title: 'New Bids Received',
          message: `You have ${bidsData.count} pending bids on your lots`,
          time: 'Just now',
          read: false
        })
      }

      if (producersData.count > 5) {
        newNotifications.push({
          id: 'prod-1',
          type: 'producer',
          title: 'New Producers Joined',
          message: 'Check out new SAF producers in the marketplace',
          time: '2 hours ago',
          read: false
        })
      }

      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const term = searchQuery.toLowerCase()
    if (term.includes('bid') || term.includes('offer')) {
      router.push('/dashboard?tab=bids')
    } else if (term.includes('contract') || term.includes('agreement')) {
      router.push('/dashboard?tab=contracts')
    } else if (term.includes('producer') || term.includes('supplier')) {
      router.push('/dashboard?tab=producers')
    } else if (term.includes('lot') || term.includes('fuel') || term.includes('saf')) {
      router.push('/dashboard?tab=marketplace')
    } else {
      router.push(`/dashboard?tab=marketplace&search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return 'Dashboard'
      case 'marketplace': return 'SAF Marketplace'
      case 'producers': return 'Producers Directory'
      case 'my-lots': return 'My Listings'
      case 'organization': return 'Organization Settings'
      case 'bids': return 'Bids Management'
      case 'contracts': return 'Contracts'
      default: return 'Dashboard'
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-blue-100 bg-white px-6">
      <div className="flex items-center gap-8 flex-1">
        <h1 className="text-xl font-semibold text-slate-800 min-w-[180px]">
          {getPageTitle()}
        </h1>

        {/* Global Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lots, contracts, companies..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-1">
        {/* Help */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-blue-50 border-b border-slate-50 last:border-0 cursor-pointer transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-slate-800">{notif.title}</p>
                        <span className="text-xs text-slate-400">{notif.time}</span>
                      </div>
                      <p className="text-xs text-slate-500">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-slate-400 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">Mark all as read</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => router.push('/dashboard/settings')}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg hover:bg-blue-50 px-2 py-1.5 transition-colors"
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="h-8 w-8 rounded-full border-2 border-blue-100" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800 truncate">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    router.push('/dashboard?tab=organization')
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"
                >
                  <User className="h-4 w-4" />
                  User Profile
                </button>
                <button
                  onClick={() => {
                    router.push('/dashboard/settings')
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>

              <div className="border-t border-slate-100 py-1">
                <SignOutButton redirectUrl="/sign-in">
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
