'use client'

import { useState } from 'react'
import DashboardSignOutButton from '@/components/DashboardSignOutButton'
import LotList from '@/components/marketplace/LotList'
import SetupTestOrgButton from '@/components/marketplace/SetupTestOrgButton'
import OrganizationMembers from '@/components/organization/OrganizationMembers'
import BidList from '@/components/bids/BidList'
import ContractList from '@/components/contracts/ContractList'
import DashboardNavbar from '@/components/dashboard/DashboardNavbar'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-lots' | 'organization' | 'bids' | 'contracts'>('marketplace')

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top Navigation */}
      <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {activeTab === 'marketplace' && 'Marketplace'}
                  {activeTab === 'my-lots' && 'My Lots'}
                  {activeTab === 'organization' && 'Organization'}
                  {activeTab === 'bids' && 'Bids Received'}
                  {activeTab === 'contracts' && 'Contracts'}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {activeTab === 'marketplace' && 'Browse available SAF lots from airlines'}
                  {activeTab === 'my-lots' && 'Manage your posted lots'}
                  {activeTab === 'organization' && 'Manage organization members and settings'}
                  {activeTab === 'bids' && 'View and manage bids on your lots'}
                  {activeTab === 'contracts' && 'View and manage contracts from accepted bids'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <SetupTestOrgButton />
                <DashboardSignOutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-6">
            {activeTab === 'organization' ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <OrganizationMembers />
              </div>
            ) : activeTab === 'bids' ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <BidList />
              </div>
            ) : activeTab === 'contracts' ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <ContractList />
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <LotList
                  showCreateButton={true}
                  showMyLots={activeTab === 'my-lots'}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
