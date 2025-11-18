import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    isFirstStep: boolean
    isLastStep: boolean
    saving: boolean
}

export default function Step1LegalEntity({ data, onNext, isFirstStep, saving }: StepProps) {
    const [formData, setFormData] = useState({
        legalName: data.legalEntity?.legalName || data.name || '',
        tradingName: data.legalEntity?.tradingName || '',
        registeredAddress: data.legalEntity?.registeredAddress || '',
        billingAddress: data.legalEntity?.billingAddress || '',
        cin: data.legalEntity?.identifiers?.cin || '',
        vat: data.legalEntity?.identifiers?.vat || '',
        lei: data.legalEntity?.identifiers?.lei || '',
        userRole: 'admin' // Default role for new users/org creators
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            legalEntity: {
                legalName: formData.legalName,
                tradingName: formData.tradingName,
                registeredAddress: formData.registeredAddress,
                billingAddress: formData.billingAddress,
                identifiers: {
                    cin: formData.cin,
                    vat: formData.vat,
                    lei: formData.lei,
                },
            },
            // Only pass userRole if it's likely a new creation or explicitly asked
            // But we can pass it always, backend will only use it if appropriate logic is there (which we added)
            userRole: formData.userRole 
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    2. Organization Profile
                </h2>

                {/* User Role Selection for New Organizations */}
                {isFirstStep && (
                    <div className="mb-6 rounded-lg bg-blue-50 p-4 ">
                        <h3 className="mb-2 font-medium text-blue-900 ">Your Role</h3>
                        <p className="mb-3 text-sm text-blue-700 ">
                            Select your role within the organization. As the creator of this profile, you will default to an Administrator unless specified otherwise.
                        </p>
                         <select
                            value={formData.userRole}
                            onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                        >
                            <option value="admin">Administrator (Full Control)</option>
                            <option value="buyer">Procurement User (RFQs, Bids)</option>
                            <option value="finance">Finance User (Invoices, Payments)</option>
                            <option value="compliance">Compliance User (Certificates, KYB)</option>
                            <option value="viewer">Read Only</option>
                        </select>
                    </div>
                )}

                <h3 className="text-lg font-medium text-slate-900 ">
                    2.1 Legal Entity Details
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            Legal Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.legalName}
                            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                            placeholder="Official registered name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            Trading Name
                        </label>
                        <input
                            type="text"
                            value={formData.tradingName}
                            onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                            placeholder="Doing business as..."
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            Registered Address *
                        </label>
                        <textarea
                            required
                            value={formData.registeredAddress}
                            onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
                            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                            rows={3}
                            placeholder="Full registered address"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            Billing Address *
                        </label>
                        <textarea
                            required
                            value={formData.billingAddress}
                            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                            rows={3}
                            placeholder="If different from registered address"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            Company Identification Number (CIN)
                        </label>
                        <input
                            type="text"
                            value={formData.cin}
                            onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            VAT / Tax ID
                        </label>
                        <input
                            type="text"
                            value={formData.vat}
                            onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            Legal Entity Identifier (LEI)
                        </label>
                        <input
                            type="text"
                            value={formData.lei}
                            onChange={(e) => setFormData({ ...formData, lei: e.target.value })}
                            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6">
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
