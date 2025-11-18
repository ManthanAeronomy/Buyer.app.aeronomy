import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step9Sustainability({ data, onNext, onBack, saving }: StepProps) {
    const [formData, setFormData] = useState({
        sustainability: {
            certificates: {
                handling: data.sustainability?.certificates?.handling || 'book-and-claim',
                applicationLevel: data.sustainability?.certificates?.applicationLevel || 'corporate',
                stackingAllowed: data.sustainability?.certificates?.stackingAllowed || false,
            },
            accounting: {
                frameworks: data.sustainability?.accounting?.frameworks || [],
                requiredOutputs: data.sustainability?.accounting?.requiredOutputs || [],
                granularity: data.sustainability?.accounting?.granularity || 'route',
            },
            audit: {
                accessList: data.sustainability?.audit?.accessList || [],
                retentionPeriod: data.sustainability?.audit?.retentionPeriod || 5,
            }
        }
    })

    const toggleFramework = (fw: string) => {
        const current = formData.sustainability.accounting.frameworks
        const updated = current.includes(fw)
            ? current.filter((f: string) => f !== fw)
            : [...current, fw]
        setFormData({ ...formData, sustainability: { ...formData.sustainability, accounting: { ...formData.sustainability.accounting, frameworks: updated } } })
    }

    const toggleOutput = (out: string) => {
        const current = formData.sustainability.accounting.requiredOutputs
        const updated = current.includes(out)
            ? current.filter((o: string) => o !== out)
            : [...current, out]
        setFormData({ ...formData, sustainability: { ...formData.sustainability, accounting: { ...formData.sustainability.accounting, requiredOutputs: updated } } })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            sustainability: formData.sustainability
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 8.1 Certificate Handling */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    8.1 Certificate Handling
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Handling Model</label>
                        <select
                            value={formData.sustainability.certificates.handling}
                            onChange={(e) => setFormData({ ...formData, sustainability: { ...formData.sustainability, certificates: { ...formData.sustainability.certificates, handling: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="book-and-claim">Book & Claim Only</option>
                            <option value="physical">Physical SAF</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Application Level</label>
                        <select
                            value={formData.sustainability.certificates.applicationLevel}
                            onChange={(e) => setFormData({ ...formData, sustainability: { ...formData.sustainability, certificates: { ...formData.sustainability.certificates, applicationLevel: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="route">Route Level</option>
                            <option value="network">Network Level</option>
                            <option value="corporate">Corporate Level</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={formData.sustainability.certificates.stackingAllowed}
                        onChange={(e) => setFormData({ ...formData, sustainability: { ...formData.sustainability, certificates: { ...formData.sustainability.certificates, stackingAllowed: e.target.checked } } })}
                        className="h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-900 ">Allow stacking with other schemes (LCFS, voluntary markets)</span>
                </div>
            </div>

            {/* 8.2 Accounting & Reporting */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    8.2 Accounting & Reporting
                </h2>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900 ">Emission Accounting Frameworks</label>
                    <div className="flex flex-wrap gap-3">
                        {['GHG Protocol', 'ICAO CORSIA', 'EU ETS', 'SBTi'].map((fw) => (
                            <button
                                key={fw}
                                type="button"
                                onClick={() => toggleFramework(fw)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${formData.sustainability.accounting.frameworks.includes(fw)
                                        ? 'bg-blue-100 text-blue-700  '
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200  '
                                    }`}
                            >
                                {fw}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900 ">Required Outputs</label>
                    <div className="flex flex-wrap gap-3">
                        {['CORSIA Report', 'EU ETS Report', 'ESG Dashboard', 'Raw Data Export'].map((out) => (
                            <button
                                key={out}
                                type="button"
                                onClick={() => toggleOutput(out)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${formData.sustainability.accounting.requiredOutputs.includes(out)
                                        ? 'bg-green-100 text-green-700  '
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200  '
                                    }`}
                            >
                                {out}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Reporting Granularity</label>
                    <select
                        value={formData.sustainability.accounting.granularity}
                        onChange={(e) => setFormData({ ...formData, sustainability: { ...formData.sustainability, accounting: { ...formData.sustainability.accounting, granularity: e.target.value } } })}
                        className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                    >
                        <option value="route">Per Route</option>
                        <option value="hub">Per Hub</option>
                        <option value="alliance">Per Alliance</option>
                        <option value="fleet">Per Fleet Type</option>
                    </select>
                </div>
            </div>

            {/* 8.3 Audit */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    8.3 Audit & Access
                </h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Default Retention Period (Years)</label>
                    <input
                        type="number"
                        value={formData.sustainability.audit.retentionPeriod}
                        onChange={(e) => setFormData({ ...formData, sustainability: { ...formData.sustainability, audit: { ...formData.sustainability.audit, retentionPeriod: parseInt(e.target.value) } } })}
                        className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                    />
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
