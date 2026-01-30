'use client'

import { FileText, DollarSign, Package, Calendar, MapPin, User, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Contract } from './ContractList'

interface ContractCardProps {
  contract: Contract
  onStatusUpdate?: (contractId: string, status: string) => void
  /** When false, hide Mark as Signed etc. (e.g. marketplace overview summary) */
  showActions?: boolean
}

export default function ContractCard({ contract, onStatusUpdate, showActions = true }: ContractCardProps) {
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
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'pending_signature':
        return 'bg-yellow-100 text-yellow-800'
      case 'signed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_signature':
        return <Clock className="h-4 w-4" />
      case 'signed':
      case 'active':
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const buyerName = contract.buyerName || contract.buyerOrgId?.name || 'Unknown Buyer'
  const canSign = contract.status === 'pending_signature'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900">{contract?.title ?? 'Untitled contract'}</h3>
            </div>
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(contract.status)}`}>
              {getStatusIcon(contract.status)}
              {contract.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Contract #{contract.contractNumber} • Created {formatDateTime(contract.createdAt)}
          </p>
        </div>

        {/* Description */}
        {contract.description && (
          <p className="mb-4 line-clamp-2 text-sm text-slate-600 break-words">{contract.description}</p>
        )}

        {/* Details - Vertical Stack */}
        <div className="mb-4 space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <User className="h-5 w-5 mt-0.5 text-slate-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 mb-1">Buyer</p>
              <p className="font-semibold text-slate-900 break-words">{buyerName}</p>
              <p className="text-xs text-slate-500 mt-1">From Lot: {contract.lotId?.title ?? 'Unknown lot'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <DollarSign className="h-5 w-5 mt-0.5 text-slate-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 mb-1">Price</p>
              {contract.pricing.pricePerUnit ? (
                <>
                  <p className="font-semibold text-slate-900 break-words">
                    {formatPricePerUnit(contract.pricing.pricePerUnit, contract.pricing.currency)}/{contract.volume.unit}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 break-words">
                    Total: {formatCurrency(contract.pricing.price, contract.pricing.currency)}
                  </p>
                </>
              ) : (
                <p className="font-semibold text-slate-900 break-words">
                  {formatCurrency(contract.pricing.price, contract.pricing.currency)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Package className="h-5 w-5 mt-0.5 text-slate-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 mb-1">Volume</p>
              <p className="font-semibold text-slate-900 break-words">
                {contract.volume.amount.toLocaleString()} {contract.volume.unit}
              </p>
            </div>
          </div>

          {contract.delivery?.deliveryDate && (
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="h-5 w-5 mt-0.5 text-slate-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 mb-1">Delivery Date</p>
                <p className="font-semibold text-slate-900 break-words">
                  {formatDate(contract.delivery.deliveryDate)}
                </p>
              </div>
            </div>
          )}

          {contract.delivery?.deliveryLocation && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-5 w-5 mt-0.5 text-slate-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 mb-1">Delivery Location</p>
                <p className="font-semibold text-slate-900 break-words">
                  {contract.delivery.deliveryLocation}
                </p>
              </div>
            </div>
          )}

          {contract.signedAt && (
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 mb-1">Signed On</p>
                <p className="font-semibold text-slate-900 break-words">
                  {formatDateTime(contract.signedAt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && canSign && (
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                if (confirm('Mark this contract as signed?')) {
                  onStatusUpdate?.(contract._id, 'signed')
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as Signed
            </button>
          </div>
        )}
      </div>
    </div>
  )
}



