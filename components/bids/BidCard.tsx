'use client'

import { DollarSign, Package, Calendar, MapPin, User, Mail, MessageSquare, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Bid } from './BidList'

interface BidCardProps {
  bid: Bid
  onStatusUpdate: (bidId: string, status: 'accepted' | 'rejected') => void
}

export default function BidCard({ bid, onStatusUpdate }: BidCardProps) {
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {bid.lotId.title}
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
                {bid.bidderName || `Bidder ${bid.bidderId.slice(0, 8)}`}
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

          {/* Actions */}
          {isPending && (
            <div className="flex gap-2 pt-4 border-t border-slate-200">
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
            </div>
          )}

          {!isPending && bid.respondedAt && (
            <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
              Responded on {formatDateTime(bid.respondedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



