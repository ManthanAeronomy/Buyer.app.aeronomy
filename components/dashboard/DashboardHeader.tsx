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
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll simulate checking for new bids/producers
      const bidsRes = await fetch('/api/bids?status=pending')
      const bidsData = await bidsRes.json()

      const producersRes = await fetch('/api/organizations/producers')
      const producersData = await producersRes.json()

      // Mock notifications based on data
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

      if (producersData.count > 5) { // Just an example condition
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

    // Simple routing based on search intent keywords
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
      // Default fallback to marketplace search
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
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-20 relative">
      <div className="flex items-center gap-8 flex-1">
        <h1 className="text-xl font-semibold text-slate-800 min-w-[200px]">
          {getPageTitle()}
        </h1>

        {/* Global Search - CRM Style */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lots, contracts, companies..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        <span className="text-xs text-slate-400">{notif.time}</span>
                      </div>
                      <p className="text-xs text-slate-500">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/dashboard/settings')}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1 rounded-full hover:bg-slate-50 pr-2 py-1 transition-colors"
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="h-8 w-8 rounded-full border border-slate-200" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => router.push('/dashboard?tab=organization')}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  User Profile
                </button>
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>

              <div className="border-t border-slate-100 py-1">
                <SignOutButton redirectUrl="/sign-in">
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
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




