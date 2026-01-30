'use client'

import { useState } from 'react'
import { DollarSign, Package, Calendar, MapPin, User, Mail, MessageSquare, CheckCircle2, XCircle, Clock, Send } from 'lucide-react'
import { Bid } from './BidList'

export interface CounterOfferForm {
  price: number
  volumeAmount: number
  volumeUnit: string
  message?: string
}

interface BidCardProps {
  bid: Bid
  onStatusUpdate: (bidId: string, status: 'accepted' | 'rejected') => void
  onCounterOffer?: (bidId: string, data: CounterOfferForm) => void | Promise<void>
  viewMode?: 'seller' | 'buyer'
  /** When true, hide Accept/Reject/Counter actions (e.g. marketplace overview summary) */
  summary?: boolean
}

export default function BidCard({ bid, onStatusUpdate, onCounterOffer, viewMode = 'seller', summary = false }: BidCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPricePerUnit = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800'
      case 'expired':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const isPending = bid.status === 'pending'
  const [showCounterForm, setShowCounterForm] = useState(false)
  const [counterPrice, setCounterPrice] = useState('')
  const [counterVolume, setCounterVolume] = useState('')
  const [counterUnit, setCounterUnit] = useState(bid.volume?.unit || 'gallons')
  const [counterMessage, setCounterMessage] = useState('')
  const [counterSubmitting, setCounterSubmitting] = useState(false)

  const hasCounterOffer = !!bid.counterOffer

  const handleCounterSubmit = () => {
    const price = parseFloat(counterPrice)
    const vol = parseFloat(counterVolume)
    if (isNaN(price) || price < 0 || isNaN(vol) || vol <= 0 || !onCounterOffer) return
    setCounterSubmitting(true)
    onCounterOffer(bid._id, {
      price,
      volumeAmount: vol,
      volumeUnit: counterUnit,
      message: counterMessage || undefined,
    })
    setShowCounterForm(false)
    setCounterPrice('')
    setCounterVolume('')
    setCounterMessage('')
    setCounterSubmitting(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {bid.lotId?.title ?? 'Unknown lot'}
                </h3>
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(bid.status)}`}>
                  {getStatusIcon(bid.status)}
                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Bid received on {formatDateTime(bid.createdAt)}
              </p>
            </div>
          </div>

          {/* Bidder Info */}
          <div className="mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-900">
                {bid.bidderName || (typeof bid.bidderId === 'string' ? `Bidder ${bid.bidderId.slice(0, 8)}` : 'Bidder')}
              </span>
            </div>
            {bid.bidderEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <a
                  href={`mailto:${bid.bidderEmail}`}
                  className="text-slate-600 hover:text-primary-600"
                >
                  {bid.bidderEmail}
                </a>
              </div>
            )}
          </div>

          {/* Bid Details Grid */}
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <div>
                {bid.pricing.pricePerUnit ? (
                  <>
                    <p className="font-semibold text-slate-900">
                      {formatPricePerUnit(bid.pricing.pricePerUnit, bid.pricing.currency)}/{bid.volume.unit}
                    </p>
                    <p className="text-xs text-slate-500">
                      Total: {formatCurrency(bid.pricing.price, bid.pricing.currency)}
                    </p>
                  </>
                ) : (
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(bid.pricing.price, bid.pricing.currency)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-slate-400" />
              <div>
                <p className="font-semibold text-slate-900">
                  {bid.volume.amount.toLocaleString()} {bid.volume.unit}
                </p>
                <p className="text-xs text-slate-500">Volume</p>
              </div>
            </div>

            {bid.deliveryDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-900">{formatDate(bid.deliveryDate)}</p>
                  <p className="text-xs text-slate-500">Delivery</p>
                </div>
              </div>
            )}

            {bid.deliveryLocation && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-900 truncate">{bid.deliveryLocation}</p>
                  <p className="text-xs text-slate-500">Location</p>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {bid.message && (
            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-700">
                <MessageSquare className="h-3 w-3" />
                Message from bidder
              </div>
              <p className="text-sm text-slate-600">{bid.message}</p>
            </div>
          )}

          {/* Payment Terms */}
          {bid.pricing.paymentTerms && (
            <div className="mb-4 text-sm">
              <span className="font-medium text-slate-700">Payment Terms: </span>
              <span className="text-slate-600">{bid.pricing.paymentTerms}</span>
            </div>
          )}

          {/* Counter-offer sent */}
          {!summary && hasCounterOffer && viewMode === 'seller' && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Counter-offer sent</p>
              <p className="mt-1">
                {formatCurrency(bid.counterOffer!.price, bid.pricing.currency)} · {bid.counterOffer!.volume.amount.toLocaleString()} {bid.counterOffer!.volume.unit}
                {bid.counterOffer!.message && ` · ${bid.counterOffer!.message}`}
              </p>
            </div>
          )}

          {/* Actions */}
          {!summary && isPending && viewMode === 'seller' && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to accept this bid?')) {
                    onStatusUpdate(bid._id, 'accepted')
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Accept Bid
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reject this bid?')) {
                    onStatusUpdate(bid._id, 'rejected')
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <XCircle className="h-4 w-4" />
                Reject Bid
              </button>
              {!hasCounterOffer && onCounterOffer && (
                <button
                  onClick={() => setShowCounterForm(!showCounterForm)}
                  className="flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200"
                >
                  <Send className="h-4 w-4" />
                  Counter offer
                </button>
              )}
            </div>
          )}

          {!summary && showCounterForm && onCounterOffer && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
              <p className="text-sm font-medium text-amber-900">Send counter-offer</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Total price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="e.g. 240000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Volume</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={counterVolume}
                    onChange={(e) => setCounterVolume(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
                  <select
                    value={counterUnit}
                    onChange={(e) => setCounterUnit(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value="gallons">Gallons</option>
                    <option value="liters">Liters</option>
                    <option value="metric-tons">Metric tons</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Message (optional)</label>
                <input
                  type="text"
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  placeholder="e.g. Can deliver by March 2026"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCounterSubmit}
                  disabled={counterSubmitting || !counterPrice || !counterVolume || parseFloat(counterPrice) < 0 || parseFloat(counterVolume) <= 0}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Send counter-offer
                </button>
                <button
                  onClick={() => { setShowCounterForm(false); setCounterPrice(''); setCounterVolume(''); setCounterMessage(''); }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!summary && isPending && viewMode === 'buyer' && (
             <div className="pt-4 border-t border-slate-200 text-sm text-slate-500 italic">
                Waiting for seller response...
             </div>
          )}

          {!summary && !isPending && bid.respondedAt && (
            <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
              Responded on {formatDateTime(bid.respondedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



