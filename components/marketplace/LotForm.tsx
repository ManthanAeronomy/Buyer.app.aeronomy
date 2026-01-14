'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Lot } from './LotCard'

interface LotFormProps {
  lot?: Lot
  onClose: () => void
  onSuccess: () => void
}

export default function LotForm({ lot, onClose, onSuccess }: LotFormProps) {
  const [loading, setLoading] = useState(false)
  // Calculate pricePerUnit from existing lot data if editing
  const getInitialPricePerUnit = () => {
    if (lot?.pricing?.pricePerUnit) {
      return lot.pricing.pricePerUnit.toString()
    }
    if (lot?.pricing?.price && lot?.volume?.amount) {
      return (lot.pricing.price / lot.volume.amount).toFixed(2)
    }
    return ''
  }

  const [formData, setFormData] = useState({
    title: lot?.title || '',
    description: lot?.description || '',
    type: lot?.type || 'spot',
    status: lot?.status || 'draft',
    volumeAmount: lot?.volume?.amount?.toString() || '',
    volumeUnit: lot?.volume?.unit || 'gallons',
    pricePerUnit: getInitialPricePerUnit(),
    currency: lot?.pricing?.currency || 'USD',
    paymentTerms: (lot?.pricing as any)?.paymentTerms || '',
    deliveryDate: lot?.delivery?.deliveryDate ? new Date(lot.delivery.deliveryDate).toISOString().split('T')[0] : '',
    deliveryLocation: lot?.delivery?.deliveryLocation || '',
    deliveryMethod: (lot?.delivery as any)?.deliveryMethod || '',
    incoterms: (lot?.delivery as any)?.incoterms || '',
    standards: lot?.compliance?.standards?.join(', ') || '',
    ghgReduction: lot?.compliance?.ghgReduction?.toString() || '',
    tags: lot?.tags?.join(', ') || '',
    airlineName: lot?.airlineName || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const volumeAmount = parseFloat(formData.volumeAmount)
      const pricePerUnit = parseFloat(formData.pricePerUnit)

      // Calculate total price from price per unit
      const totalPrice = volumeAmount * pricePerUnit

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        volume: {
          amount: volumeAmount,
          unit: formData.volumeUnit,
        },
        pricing: {
          price: totalPrice,
          pricePerUnit: pricePerUnit, // Store price per unit explicitly
          currency: formData.currency,
          paymentTerms: formData.paymentTerms || undefined,
        },
        delivery: {
          deliveryDate: formData.deliveryDate || undefined,
          deliveryLocation: formData.deliveryLocation || undefined,
          deliveryMethod: formData.deliveryMethod || undefined,
          incoterms: formData.incoterms || undefined,
        },
        compliance: {
          standards: formData.standards ? formData.standards.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          ghgReduction: formData.ghgReduction ? parseFloat(formData.ghgReduction) : undefined,
        },
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        airlineName: formData.airlineName || undefined,
      }

      const url = lot ? `/api/lots/${lot._id}` : '/api/lots'
      const method = lot ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save lot')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error saving lot:', error)
      alert(error.message || 'Failed to save lot')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">{lot ? 'Edit Lot' : 'Post New Lot'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="lot-title" className="block text-sm font-medium text-slate-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="lot-title"
                type="text"
                required
                autoFocus
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="e.g., Premium SAF Lot - ISCC Certified"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="lot-description" className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                id="lot-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Describe the lot, specifications, and any relevant details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="spot" className="text-slate-900">Spot</option>
                <option value="forward" className="text-slate-900">Forward</option>
                <option value="contract" className="text-slate-900">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="draft" className="text-slate-900">Draft</option>
                <option value="published" className="text-slate-900">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Volume Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.volumeAmount}
                onChange={(e) => setFormData({ ...formData, volumeAmount: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Volume Unit <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.volumeUnit}
                onChange={(e) => setFormData({ ...formData, volumeUnit: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="gallons" className="text-slate-900">Gallons</option>
                <option value="liters" className="text-slate-900">Liters</option>
                <option value="metric-tons" className="text-slate-900">Metric Tons</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Price per {formData.volumeUnit} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="5.00"
                />
                {formData.pricePerUnit && formData.volumeAmount && (
                  <p className="mt-1 text-xs text-slate-500">
                    Total: {formData.currency} {(parseFloat(formData.pricePerUnit) * parseFloat(formData.volumeAmount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="USD" className="text-slate-900">USD</option>
                <option value="EUR" className="text-slate-900">EUR</option>
                <option value="GBP" className="text-slate-900">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Terms</label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="e.g., Net 30, Letter of Credit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Delivery Date</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Delivery Location</label>
              <input
                type="text"
                value={formData.deliveryLocation}
                onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="e.g., JFK Airport, New York"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Compliance Standards</label>
              <input
                type="text"
                value={formData.standards}
                onChange={(e) => setFormData({ ...formData, standards: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="e.g., ISCC, RSB, CORSIA (comma-separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">GHG Reduction (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.ghgReduction}
                onChange={(e) => setFormData({ ...formData, ghgReduction: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="e.g., 80"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Airline Name</label>
              <input
                type="text"
                value={formData.airlineName}
                onChange={(e) => setFormData({ ...formData, airlineName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="e.g., Aeronomy Airlines"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : lot ? 'Update Lot' : 'Post Lot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

