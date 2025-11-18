import { useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step11Governance({ data, onNext, onBack, saving }: StepProps) {
    const [formData, setFormData] = useState({
        governance: {
            approvalThresholds: data.governance?.approvalThresholds || [],
            segregationOfDuties: data.governance?.segregationOfDuties || false,
        }
    })

    const [newThreshold, setNewThreshold] = useState({ amount: '', currency: 'USD', approverRole: '' })

    const addThreshold = () => {
        if (newThreshold.amount && newThreshold.approverRole) {
            setFormData({
                ...formData,
                governance: {
                    ...formData.governance,
                    approvalThresholds: [...formData.governance.approvalThresholds, { ...newThreshold, amount: Number(newThreshold.amount) }]
                }
            })
            setNewThreshold({ amount: '', currency: 'USD', approverRole: '' })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            governance: formData.governance
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 9.2 Approval Workflows */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    9.2 Approval Workflows
                </h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Value Based Approval Thresholds</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Amount"
                            value={newThreshold.amount}
                            onChange={(e) => setNewThreshold({ ...newThreshold, amount: e.target.value })}
                            className="flex-1 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <select
                            value={newThreshold.currency}
                            onChange={(e) => setNewThreshold({ ...newThreshold, currency: e.target.value })}
                            className="w-24 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Required Role (e.g. VP)"
                            value={newThreshold.approverRole}
                            onChange={(e) => setNewThreshold({ ...newThreshold, approverRole: e.target.value })}
                            className="flex-1 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <button type="button" onClick={addThreshold} className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200  :bg-slate-700">
                            <Plus className="h-5 w-5 text-slate-600 " />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.governance.approvalThresholds.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm  ">
                                <span>Above <span className="font-semibold">{item.amount} {item.currency}</span> requires <span className="font-semibold">{item.approverRole}</span></span>
                                <button type="button" onClick={() => {
                                    const updated = formData.governance.approvalThresholds.filter((_, idx) => idx !== i)
                                    setFormData({ ...formData, governance: { ...formData.governance, approvalThresholds: updated } })
                                }} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 9.3 Segregation of Duties */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    9.3 Segregation of Duties
                </h2>

                <div className="flex items-start space-x-3 rounded-lg border border-slate-200 p-4 ">
                    <input
                        type="checkbox"
                        checked={formData.governance.segregationOfDuties}
                        onChange={(e) => setFormData({ ...formData, governance: { ...formData.governance, segregationOfDuties: e.target.checked } })}
                        className="mt-1 h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                        <span className="block text-sm font-medium text-slate-900 ">Enforce Segregation of Duties</span>
                        <span className="text-xs text-slate-500 ">
                            Ensure the same user cannot create an RFQ, evaluate bids, and approve the award alone. Mandatory 4-eye check for contract signing.
                        </span>
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
