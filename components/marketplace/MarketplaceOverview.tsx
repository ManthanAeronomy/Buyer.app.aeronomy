'use client'

import { useState, useEffect } from 'react'
import { Plus, ArrowRight, TrendingUp, Handshake, Gavel } from 'lucide-react'
import Link from 'next/link'
import LotCard, { Lot } from './LotCard'
import BidCard from '../bids/BidCard'
import ContractCard from '../contracts/ContractCard'
import LotForm from './LotForm'
import { Bid } from '../bids/BidList'
import { Contract } from '../contracts/ContractList'

interface MarketplaceOverviewProps {
  organizationType: string
}

export default function MarketplaceOverview({ organizationType }: MarketplaceOverviewProps) {
  const [lots, setLots] = useState<Lot[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [showLotForm, setShowLotForm] = useState(false)

  const isBuyer = organizationType === 'airline'

  useEffect(() => {
    fetchAllData()
  }, [organizationType])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Parallel fetching
      const [lotsRes, bidsRes, contractsRes] = await Promise.all([
        fetch('/api/lots?mine=true&includeDrafts=true'), // My Listings
        fetch(isBuyer ? '/api/bids?type=sent' : '/api/bids'), // My Negotiations (Sent or Received)
        fetch('/api/contracts') // My Deals
      ])

      if (lotsRes.ok) {
        const data = await lotsRes.json()
        setLots(data.lots || [])
      }
      
      if (bidsRes.ok) {
        const data = await bidsRes.json()
        setBids(data.bids || [])
      }

      if (contractsRes.ok) {
        const data = await contractsRes.json()
        setContracts(data.contracts || [])
      }

    } catch (error) {
      console.error('Error fetching marketplace data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLotCreateSuccess = () => {
    setShowLotForm(false)
    fetchAllData()
  }

  // Calculate stats
  const activeBids = bids.filter(b => b.status === 'pending')
  const activeContracts = contracts.filter(c => c.status === 'active' || c.status === 'signed')
  const activeLots = lots.filter(l => l.status === 'published')

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketplace Dashboard</h1>
          <p className="text-slate-600">
            Overview of your {isBuyer ? 'procurement' : 'trading'} activity
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowLotForm(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post New {isBuyer ? 'Tender' : 'Lot'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Listings</p>
              <h3 className="text-2xl font-bold text-slate-900">{activeLots.length}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-orange-50 p-3 text-orange-600">
              <Gavel className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Negotiations</p>
              <h3 className="text-2xl font-bold text-slate-900">{activeBids.length}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <Handshake className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Deals</p>
              <h3 className="text-2xl font-bold text-slate-900">{activeContracts.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column: Listings & Deals */}
        <div className="space-y-8">
          {/* My Listings */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Listings</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {lots.length === 0 ? (
               <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                 No listings found. Post a new {isBuyer ? 'tender' : 'lot'} to get started.
               </div>
            ) : (
              <div className="space-y-4">
                {lots.slice(0, 3).map(lot => (
                  <div key={lot._id} className="transform scale-95 origin-top-left w-full mb-[-1rem]"> {/* Slight scaling to fit better */}
                      <LotCard lot={lot} showActions={false} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Deals */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Deals</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {contracts.length === 0 ? (
               <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                 No active deals yet.
               </div>
            ) : (
              <div className="space-y-4">
                {contracts.slice(0, 3).map(contract => (
                  <ContractCard key={contract._id} contract={contract} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Negotiations */}
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Active Negotiations</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
             {bids.length === 0 ? (
               <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                 No active negotiations.
               </div>
            ) : (
              <div className="space-y-4">
                {bids.slice(0, 5).map(bid => (
                  <BidCard 
                    key={bid._id} 
                    bid={bid} 
                    viewMode={isBuyer ? 'buyer' : 'seller'}
                    onStatusUpdate={() => {}} // Read-only summary in dashboard
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {showLotForm && (
        <LotForm
          onClose={() => setShowLotForm(false)}
          onSuccess={handleLotCreateSuccess}
        />
      )}
    </div>
  )
}




