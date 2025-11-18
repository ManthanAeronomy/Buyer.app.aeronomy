import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step8Financial({ data, onNext, onBack, saving }: StepProps) {
    const [formData, setFormData] = useState({
        financial: {
            billing: {
                entityName: data.financial?.billing?.entityName || '',
                address: data.financial?.billing?.address || '',
                paymentTerms: data.financial?.billing?.paymentTerms || 'Net 30',
                invoicingPreference: data.financial?.billing?.invoicingPreference || 'shipment',
            },
            credit: {
                financialsUrl: data.financial?.credit?.financialsUrl || '',
                creditRating: data.financial?.credit?.creditRating || '',
            },
            payment: {
                methods: data.financial?.payment?.methods || [],
                bankDetails: {
                    bankName: data.financial?.payment?.bankDetails?.bankName || '',
                    accountNumber: data.financial?.payment?.bankDetails?.accountNumber || '',
                    swiftCode: data.financial?.payment?.bankDetails?.swiftCode || '',
                    currency: data.financial?.payment?.bankDetails?.currency || 'USD',
                }
            }
        }
    })

    const toggleMethod = (method: string) => {
        const current = formData.financial.payment.methods
        const updated = current.includes(method)
            ? current.filter((m: string) => m !== method)
            : [...current, method]
        setFormData({ ...formData, financial: { ...formData.financial, payment: { ...formData.financial.payment, methods: updated } } })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            financial: formData.financial
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 7.1 Billing Profile */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    7.1 Billing Profile
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Billing Entity Name</label>
                        <input
                            type="text"
                            value={formData.financial.billing.entityName}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, billing: { ...formData.financial.billing, entityName: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            placeholder="If different from legal name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Payment Terms</label>
                        <select
                            value={formData.financial.billing.paymentTerms}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, billing: { ...formData.financial.billing, paymentTerms: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="Net 15">Net 15</option>
                            <option value="Net 30">Net 30</option>
                            <option value="Net 45">Net 45</option>
                            <option value="Net 60">Net 60</option>
                        </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-900 ">Billing Address</label>
                        <textarea
                            value={formData.financial.billing.address}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, billing: { ...formData.financial.billing, address: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Invoicing Preference</label>
                        <select
                            value={formData.financial.billing.invoicingPreference}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, billing: { ...formData.financial.billing, invoicingPreference: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="shipment">Per Shipment</option>
                            <option value="monthly">Monthly Statement</option>
                            <option value="contract">Per Contract</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 7.2 Credit & Risk */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    7.2 Credit & Risk
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Financials / Credit Report URL</label>
                        <input
                            type="text"
                            value={formData.financial.credit.financialsUrl}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, credit: { ...formData.financial.credit, financialsUrl: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            placeholder="Link to document"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Credit Rating (Optional)</label>
                        <input
                            type="text"
                            value={formData.financial.credit.creditRating}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, credit: { ...formData.financial.credit, creditRating: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            placeholder="e.g. BBB+"
                        />
                    </div>
                </div>
            </div>

            {/* 7.3 Payment Rails */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    7.3 Payment Rails
                </h2>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900 ">Preferred Payment Methods</label>
                    <div className="flex flex-wrap gap-3">
                        {['Bank Transfer', 'Escrow', 'Letter of Credit', 'Direct Debit'].map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => toggleMethod(method)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${formData.financial.payment.methods.includes(method)
                                        ? 'bg-blue-100 text-blue-700  '
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200  '
                                    }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4  ">
                    <h3 className="mb-3 font-medium text-slate-900 ">Bank Account Details (For Refunds/Reconciliation)</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            type="text"
                            placeholder="Bank Name"
                            value={formData.financial.payment.bankDetails.bankName}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, payment: { ...formData.financial.payment, bankDetails: { ...formData.financial.payment.bankDetails, bankName: e.target.value } } } })}
                            className="rounded-md border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <input
                            type="text"
                            placeholder="Account Number / IBAN"
                            value={formData.financial.payment.bankDetails.accountNumber}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, payment: { ...formData.financial.payment, bankDetails: { ...formData.financial.payment.bankDetails, accountNumber: e.target.value } } } })}
                            className="rounded-md border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <input
                            type="text"
                            placeholder="SWIFT / BIC"
                            value={formData.financial.payment.bankDetails.swiftCode}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, payment: { ...formData.financial.payment, bankDetails: { ...formData.financial.payment.bankDetails, swiftCode: e.target.value } } } })}
                            className="rounded-md border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <input
                            type="text"
                            placeholder="Currency"
                            value={formData.financial.payment.bankDetails.currency}
                            onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, payment: { ...formData.financial.payment, bankDetails: { ...formData.financial.payment.bankDetails, currency: e.target.value } } } })}
                            className="rounded-md border border-slate-400 px-3 py-2 text-sm  "
                        />
                    </div>
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
