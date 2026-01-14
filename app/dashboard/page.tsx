'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardSignOutButton from '@/components/DashboardSignOutButton'
import DashboardHome from '@/components/dashboard/DashboardHome'
import LotList from '@/components/marketplace/LotList'
import ProducerList from '@/components/marketplace/ProducerList'
import OrganizationMembers from '@/components/organization/OrganizationMembers'
import BidList from '@/components/bids/BidList'
import ContractList from '@/components/contracts/ContractList'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardFooter from '@/components/dashboard/DashboardFooter'
import MarketplaceOverview from '@/components/marketplace/MarketplaceOverview'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'home' | 'marketplace' | 'producers' | 'my-lots' | 'organization' | 'bids' | 'contracts'>('home')
  const [orgType, setOrgType] = useState<string | null>(null)

  useEffect(() => {
    // Fetch organization type
    fetch('/api/organization/profile')
      .then(res => res.json())
      .then(data => {
        if (data && data.type) {
          setOrgType(data.type)
        }
      })
      .catch(err => console.error('Failed to fetch org type', err))
  }, [])

  useEffect(() => {
    if (tabParam && ['home', 'marketplace', 'producers', 'my-lots', 'organization', 'bids', 'contracts'].includes(tabParam)) {
      setActiveTab(tabParam as any)
    }
  }, [tabParam])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} organizationType={orgType} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <DashboardHeader activeTab={activeTab} />

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col">
          <div className="p-6 mx-auto max-w-7xl w-full flex-1">
            {activeTab === 'home' ? (
              <DashboardHome />
            ) : activeTab === 'marketplace' ? (
              // For Airlines (Buyers), show the Trading Desk (Overview)
              // For others, show only their own lots
              orgType === 'airline' ? (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="p-6">
                    <MarketplaceOverview organizationType={orgType} />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="p-6">
                    <LotList
                      showCreateButton={true}
                      showMyLots={true}
                    />
                  </div>
                </div>
              )
            ) : activeTab === 'producers' ? (
              <div className="flex h-full flex-col">
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm flex-1 overflow-hidden flex flex-col">
                  <div className="p-6 overflow-y-auto">
                    <ProducerList />
                  </div>
                </div>
              </div>
            ) : activeTab === 'organization' ? (
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                  <OrganizationMembers />
                </div>
              </div>
            ) : activeTab === 'bids' ? (
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                  <BidList />
                </div>
              </div>
            ) : activeTab === 'contracts' ? (
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                  <ContractList />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                  <LotList
                    showCreateButton={true}
                    showMyLots={activeTab === 'my-lots'}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DashboardFooter />
        </main>
      </div>
    </div>
  )
}
