import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step7Procurement({ data, onNext, onBack, saving }: StepProps) {
    const [formData, setFormData] = useState({
        procurement: {
            model: {
                strategy: data.procurement?.model?.strategy || 'blended',
                delivery: data.procurement?.model?.delivery || 'book-and-claim',
                contracting: data.procurement?.model?.contracting || 'direct',
            },
            tendering: {
                horizon: data.procurement?.tendering?.horizon || 'yearly',
                minDuration: data.procurement?.tendering?.minDuration || '',
                lotSize: {
                    min: data.procurement?.tendering?.lotSize?.min || '',
                    max: data.procurement?.tendering?.lotSize?.max || '',
                    unit: data.procurement?.tendering?.lotSize?.unit || 'gallons',
                }
            },
            risk: {
                pricingModel: data.procurement?.risk?.pricingModel || 'fixed',
                allowedCurrencies: data.procurement?.risk?.allowedCurrencies || ['USD'],
                priceEscalatorsAccepted: data.procurement?.risk?.priceEscalatorsAccepted || false,
            }
        }
    })

    const toggleCurrency = (curr: string) => {
        const current = formData.procurement.risk.allowedCurrencies
        const updated = current.includes(curr)
            ? current.filter((c: string) => c !== curr)
            : [...current, curr]
        setFormData({ ...formData, procurement: { ...formData.procurement, risk: { ...formData.procurement.risk, allowedCurrencies: updated } } })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            procurement: formData.procurement
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 6.1 Procurement Model */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    6.1 Procurement Model
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Strategy</label>
                        <select
                            value={formData.procurement.model.strategy}
                            onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, model: { ...formData.procurement.model, strategy: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="spot">Spot Bidding</option>
                            <option value="long-term">Long Term Offtake</option>
                            <option value="blended">Blended Strategy</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Delivery Model</label>
                        <select
                            value={formData.procurement.model.delivery}
                            onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, model: { ...formData.procurement.model, delivery: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="book-and-claim">Book & Claim</option>
                            <option value="physical">Physical Delivery</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Contracting</label>
                        <select
                            value={formData.procurement.model.contracting}
                            onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, model: { ...formData.procurement.model, contracting: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="direct">Direct Contracts</option>
                            <option value="trader">Via Traders</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 6.2 Tendering Preferences */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    6.2 Tendering Preferences
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Tender Horizon</label>
                        <select
                            value={formData.procurement.tendering.horizon}
                            onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, tendering: { ...formData.procurement.tendering, horizon: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                            <option value="multi-year">Multi-Year</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Min Contract Duration (Years)</label>
                        <input
                            type="number"
                            value={formData.procurement.tendering.minDuration}
                            onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, tendering: { ...formData.procurement.tendering, minDuration: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            placeholder="e.g. 1"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Lot Size Constraints</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={formData.procurement.tendering.lotSize.min}
                            onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, tendering: { ...formData.procurement.tendering, lotSize: { ...formData.procurement.tendering.lotSize, min: e.target.value } } } })}
                            className="flex-1 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={formData.procurement.tendering.lotSize.max}
                            onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, tendering: { ...formData.procurement.tendering, lotSize: { ...formData.procurement.tendering.lotSize, max: e.target.value } } } })}
                            className="flex-1 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <select
                            value={formData.procurement.tendering.lotSize.unit}
                            onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, tendering: { ...formData.procurement.tendering, lotSize: { ...formData.procurement.tendering.lotSize, unit: e.target.value } } } })}
                            className="w-24 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="gallons">Gallons</option>
                            <option value="liters">Liters</option>
                            <option value="metric-tons">MT</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 6.3 Risk / Pricing */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    6.3 Risk & Pricing
                </h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Preferred Pricing Model</label>
                    <select
                        value={formData.procurement.risk.pricingModel}
                        onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, risk: { ...formData.procurement.risk, pricingModel: e.target.value } } })}
                        className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                    >
                        <option value="fixed">Fixed Price</option>
                        <option value="index-linked">Index Linked</option>
                        <option value="hybrid">Hybrid</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Allowed Currencies</label>
                    <div className="flex flex-wrap gap-3">
                        {['USD', 'EUR', 'GBP', 'SGD', 'JPY'].map((curr) => (
                            <button
                                key={curr}
                                type="button"
                                onClick={() => toggleCurrency(curr)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${formData.procurement.risk.allowedCurrencies.includes(curr)
                                    ? 'bg-blue-100 text-blue-700  '
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200  '
                                    }`}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.procurement.risk.priceEscalatorsAccepted}
                        onChange={(e) => setFormData({ ...formData, procurement: { ...formData.procurement, risk: { ...formData.procurement.risk, priceEscalatorsAccepted: e.target.checked } } })}
                        className="h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-900 ">Willingness for price escalators / take-or-pay</span>
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100  :bg-slate-800"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    Next Step
                    <ChevronRight className="ml-2 h-4 w-4" />
                </button>
            </div>
        </form>
    )
}
