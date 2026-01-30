'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ArrowRight, TrendingUp, Handshake, Gavel } from 'lucide-react'
import LotCard, { Lot } from './LotCard'
import BidCard from '../bids/BidCard'
import ContractCard from '../contracts/ContractCard'
import LotForm from './LotForm'
import LotDetail from './LotDetail'
import { Bid } from '../bids/BidList'
import { Contract } from '../contracts/ContractList'

interface MarketplaceOverviewProps {
  organizationType: string
}

export default function MarketplaceOverview({ organizationType }: MarketplaceOverviewProps) {
  const router = useRouter()
  const [lots, setLots] = useState<Lot[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [showLotForm, setShowLotForm] = useState(false)
  const [showPublishedBanner, setShowPublishedBanner] = useState(false)
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  const [editingLot, setEditingLot] = useState<Lot | null>(null)

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

  const handleLotCreateSuccess = (savedLot?: { _id: string; status?: string }) => {
    setShowLotForm(false)
    setEditingLot(null)
    fetchAllData()
    if (savedLot?.status === 'published') {
      setShowPublishedBanner(true)
    }
  }

  const handleLotDelete = async (lotId: string) => {
    try {
      const res = await fetch(`/api/lots/${lotId}`, { method: 'DELETE' })
      if (res.ok) {
        setSelectedLot(null)
        fetchAllData()
      } else {
        const data = await res.json()
        alert(data?.error || 'Failed to delete lot')
      }
    } catch (e) {
      console.error('Delete lot error:', e)
      alert('Failed to delete lot')
    }
  }

  // Calculate stats
  const activeBids = bids.filter(b => b.status === 'pending')
  const activeContracts = contracts.filter(c => c.status === 'active' || c.status === 'signed')
  const activeLots = lots.filter(l => l.status === 'published')

  return (
    <div className="space-y-8">
      {showPublishedBanner && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          <p className="text-sm font-medium">
            Your lot is now visible to producers on the platform.
          </p>
          <button
            onClick={() => setShowPublishedBanner(false)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            Dismiss
          </button>
        </div>
      )}

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
            onClick={() => {
              setEditingLot(null)
              setShowLotForm(true)
            }}
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
              <button
                onClick={() => router.push('/dashboard?tab=my-lots')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
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
                  <div
                    key={lot._id}
                    onClick={() => setSelectedLot(lot)}
                    className="transform scale-95 origin-top-left w-full mb-[-1rem] cursor-pointer transition-transform hover:scale-[0.98]"
                  >
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
              <button
                onClick={() => router.push('/dashboard?tab=contracts')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
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
                  <ContractCard key={contract._id} contract={contract} showActions={false} />
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
              <button
                onClick={() => router.push('/dashboard?tab=bids')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
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
                    onStatusUpdate={() => {}}
                    summary
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedLot && (
        <LotDetail
          lot={selectedLot}
          onClose={() => setSelectedLot(null)}
          onEdit={(lot) => {
            setEditingLot(lot)
            setSelectedLot(null)
            setShowLotForm(true)
          }}
          onDelete={handleLotDelete}
          showActions={true}
        />
      )}

      {showLotForm && (
        <LotForm
          lot={editingLot ?? undefined}
          onClose={() => {
            setShowLotForm(false)
            setEditingLot(null)
          }}
          onSuccess={handleLotCreateSuccess}
        />
      )}
    </div>
  )
}




