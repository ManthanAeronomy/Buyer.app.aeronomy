'use client'

import { useState, useEffect } from 'react'
import ContractCard from './ContractCard'

export interface Contract {
  _id: string
  contractNumber: string
  title: string
  description?: string
  lotId: {
    _id: string
    title: string
  }
  bidId: {
    _id: string
    bidderName?: string
  }
  sellerOrgId: {
    _id: string
    name: string
  }
  buyerOrgId?: {
    _id: string
    name: string
  }
  buyerName?: string
  volume: {
    amount: number
    unit: string
  }
  pricing: {
    price: number
    currency: string
    pricePerUnit?: number
  }
  delivery?: {
    deliveryDate?: string
    deliveryLocation?: string
  }
  status: 'draft' | 'pending_signature' | 'signed' | 'active' | 'completed' | 'cancelled'
  signedAt?: string
  createdAt: string
  updatedAt: string
}

export default function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchContracts()
  }, [statusFilter])

  const fetchContracts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/contracts?${params.toString()}`)
      const data = await response.json()
      setContracts(data.contracts || [])
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (contractId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchContracts() // Refresh list
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update contract status')
      }
    } catch (error) {
      console.error('Error updating contract:', error)
      alert('Failed to update contract status')
    }
  }

  const getStatusCounts = () => {
    const counts = {
      all: contracts.length,
      pending_signature: contracts.filter((c) => c.status === 'pending_signature').length,
      signed: contracts.filter((c) => c.status === 'signed').length,
      active: contracts.filter((c) => c.status === 'active').length,
      completed: contracts.filter((c) => c.status === 'completed').length,
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contracts</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage contracts created from accepted bids
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All ({statusCounts.all})</option>
            <option value="pending_signature">Pending Signature ({statusCounts.pending_signature})</option>
            <option value="signed">Signed ({statusCounts.signed})</option>
            <option value="active">Active ({statusCounts.active})</option>
            <option value="completed">Completed ({statusCounts.completed})</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-slate-500">Loading contracts...</div>
        </div>
      ) : contracts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-sm font-medium text-slate-600">No contracts found</p>
          <p className="mt-1 text-xs text-slate-500">
            {statusFilter !== 'all'
              ? `No ${statusFilter.replace('_', ' ')} contracts at the moment.`
              : "You don't have any contracts yet. Contracts are created automatically when you accept a bid."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <ContractCard
              key={contract._id}
              contract={contract}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}



