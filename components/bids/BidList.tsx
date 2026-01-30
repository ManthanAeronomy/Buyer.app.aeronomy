'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Package, Calendar, MapPin, User, CheckCircle2, XCircle, Clock } from 'lucide-react'
import BidCard, { CounterOfferForm } from './BidCard'

export interface Bid {
  _id: string
  lotId: {
    _id: string
    title: string
    volume: { amount: number; unit: string }
    pricing: { currency: string }
    status: string
  }
  bidderId: string
  bidderName?: string
  bidderEmail?: string
  volume: {
    amount: number
    unit: string
  }
  pricing: {
    price: number
    currency: string
    pricePerUnit?: number
    paymentTerms?: string
  }
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  message?: string
  deliveryDate?: string
  deliveryLocation?: string
  createdAt: string
  respondedAt?: string
  counterOffer?: {
    price: number
    volume: { amount: number; unit: string }
    message?: string
  }
}

interface BidListProps {
  lotId?: string
}

export default function BidList({ lotId }: BidListProps) {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchBids = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (lotId) {
        params.append('lotId', lotId)
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/bids?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bids: ${response.statusText}`)
      }

      const data = await response.json()
      const fetchedBids = data.bids || []
      console.log(`✅ Fetched ${fetchedBids.length} bids from API`)
      setBids(fetchedBids)
    } catch (error) {
      console.error('Error fetching bids:', error)
      alert('Failed to load bids. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBids()
  }, [lotId, statusFilter])

  // Refresh bids every 5 seconds to catch new bids from Buyer Dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBids()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [lotId, statusFilter])

  const handleStatusUpdate = async (bidId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchBids() // Refresh list
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update bid status')
      }
    } catch (error) {
      console.error('Error updating bid:', error)
      alert('Failed to update bid status')
    }
  }

  const handleCounterOffer = async (bidId: string, data: CounterOfferForm) => {
    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          counterOffer: {
            price: data.price,
            volume: { amount: data.volumeAmount, unit: data.volumeUnit },
            message: data.message || undefined,
          },
        }),
      })

      if (response.ok) {
        fetchBids()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send counter-offer')
        throw new Error(error.error)
      }
    } catch (error) {
      console.error('Error sending counter-offer:', error)
      throw error
    }
  }

  const getStatusCounts = () => {
    const counts = {
      all: bids.length,
      pending: bids.filter((b) => b.status === 'pending').length,
      accepted: bids.filter((b) => b.status === 'accepted').length,
      rejected: bids.filter((b) => b.status === 'rejected').length,
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bids Received</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage bids received on your lots from buyers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All ({statusCounts.all})</option>
            <option value="pending">Pending ({statusCounts.pending})</option>
            <option value="accepted">Accepted ({statusCounts.accepted})</option>
            <option value="rejected">Rejected ({statusCounts.rejected})</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-slate-500">Loading bids...</div>
        </div>
      ) : bids.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-sm font-medium text-slate-600">No bids found</p>
          <p className="mt-1 text-xs text-slate-500">
            {statusFilter !== 'all'
              ? `No ${statusFilter} bids at the moment.`
              : "You haven't received any bids yet. Bids will appear here when buyers submit offers on your lots."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <BidCard
              key={bid._id}
              bid={bid}
              onStatusUpdate={handleStatusUpdate}
              onCounterOffer={handleCounterOffer}
            />
          ))}
        </div>
      )}
    </div>
  )
}

