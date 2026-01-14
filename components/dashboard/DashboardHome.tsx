'use client'

import { useEffect, useState } from 'react'
import { Package, TrendingUp, FileCheck, Users, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic import for map to avoid SSR issues
const AirportMap = dynamic(() => import('./AirportMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] animate-pulse bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
      <p className="text-slate-400">Loading map...</p>
    </div>
  )
})

interface DashboardStats {
  totalLots: number
  totalBids: number
  totalContracts: number
  organizationMembers: number
}

export default function DashboardHome() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalLots: 0,
    totalBids: 0,
    totalContracts: 0,
    organizationMembers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch organization profile
      const orgRes = await fetch('/api/organization/profile')
      if (orgRes.ok) {
        const orgData = await orgRes.json()
        setOrganization(orgData)
      }

      // Fetch lots count
      const lotsRes = await fetch('/api/lots?mine=true')
      if (lotsRes.ok) {
        const lotsData = await lotsRes.json()
        setStats((prev) => ({ ...prev, totalLots: lotsData.count || 0 }))
      }

      // Fetch bids count
      const bidsRes = await fetch('/api/bids')
      if (bidsRes.ok) {
        const bidsData = await bidsRes.json()
        setStats((prev) => ({ ...prev, totalBids: bidsData.count || 0 }))
      }

      // Fetch contracts count
      const contractsRes = await fetch('/api/contracts')
      if (contractsRes.ok) {
        const contractsData = await contractsRes.json()
        setStats((prev) => ({ ...prev, totalContracts: contractsData.count || 0 }))
      }

      // Fetch members count
      const membersRes = await fetch('/api/organizations/members')
      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setStats((prev) => ({ ...prev, organizationMembers: membersData.members?.length || 0 }))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Active Lots',
      value: stats.totalLots,
      icon: Package,
      color: 'blue',
      description: 'SAF lots posted',
    },
    {
      title: 'Bids Received',
      value: stats.totalBids,
      icon: TrendingUp,
      color: 'green',
      description: 'Offers on your lots',
    },
    {
      title: 'Active Contracts',
      value: stats.totalContracts,
      icon: FileCheck,
      color: 'purple',
      description: 'Signed agreements',
    },
    {
      title: 'Team Members',
      value: stats.organizationMembers,
      icon: Users,
      color: 'orange',
      description: 'Organization users',
    },
  ]

  const quickActions = [
    {
      title: 'Browse SAF Lots',
      description: 'Explore available lots',
      action: () => router.push('/dashboard?tab=marketplace'),
      color: 'blue',
    },
    {
      title: 'Find Producers',
      description: 'Connect with suppliers',
      action: () => router.push('/dashboard?tab=producers'),
      color: 'green',
    },
    {
      title: 'Post New Lot',
      description: 'List SAF for sale',
      action: () => router.push('/dashboard?tab=my-lots'),
      color: 'purple',
    },
    {
      title: 'View Bids',
      description: 'Review received offers',
      action: () => router.push('/dashboard?tab=bids'),
      color: 'orange',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back{organization?.userName ? `, ${organization.userName}` : ''}!
        </h1>
        <div className="mt-2 flex items-center gap-2 text-slate-600">
          <span className="font-medium text-blue-700">{organization?.name || 'Your Organization'}</span>
          <span>•</span>
          <span className="capitalize">{organization?.organizationType || 'Marketplace Member'}</span>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-slate-500">
          Manage your SAF marketplace activities, view analytics, and connect with buyers and sellers.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
                </div>
                <div className={`rounded-xl bg-${stat.color}-50 p-3 ring-1 ring-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Global Airport Map */}
      <AirportMap />

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={action.action}
              className="group flex flex-col items-start rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md hover:translate-y-[-2px]"
            >
              <h3 className="font-bold text-slate-900 text-lg">{action.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{action.description}</p>
              <div className="mt-auto pt-4 w-full flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider text-${action.color}-600 bg-${action.color}-50 px-2 py-1 rounded`}>
                  Access
                </span>
                <ArrowRight className={`h-5 w-5 text-${action.color}-600 transition-transform group-hover:translate-x-1`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity or Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Organization Profile</h2>
          <button
            onClick={() => router.push('/dashboard?tab=organization')}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Edit Details
          </button>
        </div>
        <div className="grid gap-8 md:grid-cols-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Organization Type</p>
            <p className="font-bold text-slate-900 text-lg">
              {organization?.organizationType || 'Not specified'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Team Size</p>
            <p className="font-bold text-slate-900 text-lg">{organization?.teamSize || 'Not specified'}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Company Email</p>
            <p className="font-bold text-slate-900 text-lg truncate">
              {organization?.companyEmail || 'Not specified'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Volume Range</p>
            <p className="font-bold text-slate-900 text-lg">
              {organization?.volumeRange || 'Not specified'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

