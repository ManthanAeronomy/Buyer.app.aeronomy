// Updating LotList to use LotDetail
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import LotCard, { Lot } from './LotCard'
import LotForm from './LotForm'
import LotDetail from './LotDetail'

interface LotListProps {
  initialLots?: Lot[]
  showCreateButton?: boolean
  showMyLots?: boolean
}

export default function LotList({ initialLots = [], showCreateButton = true, showMyLots = false }: LotListProps) {
  const [lots, setLots] = useState<Lot[]>(initialLots)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingLot, setEditingLot] = useState<Lot | null>(null)
  
  // State for LotDetail view
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)

  useEffect(() => {
    fetchLots()
  }, [searchQuery, typeFilter, showMyLots])

  const fetchLots = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (showMyLots) {
        params.append('mine', 'true')
        params.append('includeDrafts', 'true')
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }

      const response = await fetch(`/api/lots?${params.toString()}`)
      const data = await response.json()
      const fetchedLots = data.lots || []
      setLots(fetchedLots)
    } catch (error) {
      console.error('Error fetching lots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingLot(null)
    setShowForm(true)
  }

  const handleEdit = (lot: Lot) => {
    setEditingLot(lot)
    setShowForm(true)
    setSelectedLot(null) // Close detail view if open
  }

  const handleDelete = async (lotId: string) => {
    try {
      const response = await fetch(`/api/lots/${lotId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setLots(lots.filter((lot) => lot._id !== lotId))
        setSelectedLot(null) // Close detail view if open
      }
    } catch (error) {
      console.error('Error deleting lot:', error)
      alert('Failed to delete lot')
    }
  }

  const handleFormClose = (_savedLot?: { _id: string; status?: string }) => {
    setShowForm(false)
    setEditingLot(null)
    fetchLots()
  }

  const handleLotClick = (lot: Lot) => {
    setSelectedLot(lot)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search lots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Types</option>
              <option value="spot">Spot</option>
              <option value="forward">Forward</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>

        {showCreateButton && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post New Lot
          </button>
        )}
      </div>

      {showForm && (
        <LotForm
          lot={editingLot || undefined}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {/* Detail View Slide-over */}
      {selectedLot && (
        <LotDetail
          lot={selectedLot}
          onClose={() => setSelectedLot(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={showMyLots}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
      ) : lots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-sm font-medium text-slate-600">No lots found</p>
          <p className="mt-1 text-xs text-slate-500">
            {showMyLots ? "You haven't posted any lots yet." : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500 px-1">
            <p>
              Showing <span className="font-semibold text-slate-900">{lots.length}</span> lot{lots.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {lots.map((lot) => (
              <div key={lot._id} onClick={() => handleLotClick(lot)} className="cursor-pointer transition-transform hover:scale-[1.01]">
                <LotCard
                  lot={lot}
                  showActions={false} // Disable actions on card to prevent conflict with click
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
