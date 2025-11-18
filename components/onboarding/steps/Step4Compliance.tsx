import { useState } from 'react'
import { ChevronRight, ChevronLeft, CheckSquare, Square } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step4Compliance({ data, onNext, onBack, saving }: StepProps) {
    const [formData, setFormData] = useState({
        kyb: {
            documents: {
                incorporation: data.compliance?.kyb?.documents?.incorporation || '',
                taxRegistration: data.compliance?.kyb?.documents?.taxRegistration || '',
                operatingCertificate: data.compliance?.kyb?.documents?.operatingCertificate || '',
            },
            sanctionsScreening: data.compliance?.kyb?.sanctionsScreening || false,
            pepChecks: data.compliance?.kyb?.pepChecks || false,
        },
        regulatory: {
            jurisdictions: data.compliance?.regulatory?.jurisdictions || [],
            regimes: data.compliance?.regulatory?.regimes || [],
        },
        policies: {
            termsAccepted: data.compliance?.policies?.termsAccepted || false,
            dataSharingAccepted: data.compliance?.policies?.dataSharingAccepted || false,
            documentationRetentionAccepted: data.compliance?.policies?.documentationRetentionAccepted || false,
        }
    })

    const toggleJurisdiction = (jur: string) => {
        const current = formData.regulatory.jurisdictions
        const updated = current.includes(jur)
            ? current.filter((j: string) => j !== jur)
            : [...current, jur]
        setFormData({ ...formData, regulatory: { ...formData.regulatory, jurisdictions: updated } })
    }

    const toggleRegime = (reg: string) => {
        const current = formData.regulatory.regimes
        const updated = current.includes(reg)
            ? current.filter((r: string) => r !== reg)
            : [...current, reg]
        setFormData({ ...formData, regulatory: { ...formData.regulatory, regimes: updated } })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            compliance: formData
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 3.1 KYB */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    3.1 KYB (Know Your Business)
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {['incorporation', 'taxRegistration', 'operatingCertificate'].map((doc) => (
                        <div key={doc} className="rounded-lg border border-dashed border-slate-400 p-6 text-center ">
                            <div className="mb-2 text-sm font-medium capitalize text-slate-900 ">
                                {doc.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <input
                                type="text"
                                placeholder="Paste Document URL"
                                value={(formData.kyb.documents as any)[doc]}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    kyb: {
                                        ...formData.kyb,
                                        documents: { ...formData.kyb.documents, [doc]: e.target.value }
                                    }
                                })}
                                className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs  "
                            />
                        </div>
                    ))}
                </div>
                <div className="flex gap-6">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.kyb.sanctionsScreening}
                            onChange={(e) => setFormData({ ...formData, kyb: { ...formData.kyb, sanctionsScreening: e.target.checked } })}
                            className="h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-900 ">Sanctions Screening Completed</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.kyb.pepChecks}
                            onChange={(e) => setFormData({ ...formData, kyb: { ...formData.kyb, pepChecks: e.target.checked } })}
                            className="h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-900 ">PEP / Blacklist Checks Completed</span>
                    </label>
                </div>
            </div>

            {/* 3.2 Regulatory Alignment */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    3.2 Regulatory Alignment
                </h2>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900 ">Jurisdictions</label>
                    <div className="flex flex-wrap gap-3">
                        {['EU', 'UK', 'US', 'ICAO', 'APAC', 'MEA'].map((jur) => (
                            <button
                                key={jur}
                                type="button"
                                onClick={() => toggleJurisdiction(jur)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${formData.regulatory.jurisdictions.includes(jur)
                                        ? 'bg-blue-100 text-blue-700  '
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200  '
                                    }`}
                            >
                                {jur}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900 ">Regimes</label>
                    <div className="flex flex-wrap gap-3">
                        {['CORSIA', 'EU ETS', 'ReFuelEU', 'UK RTFO', 'LCFS', 'Voluntary'].map((reg) => (
                            <button
                                key={reg}
                                type="button"
                                onClick={() => toggleRegime(reg)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${formData.regulatory.regimes.includes(reg)
                                        ? 'bg-green-100 text-green-700  '
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200  '
                                    }`}
                            >
                                {reg}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3.3 Policy Acknowledgements */}
            <div className="space-y-4 rounded-lg bg-slate-50 p-4 ">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    3.3 Policy Acknowledgements
                </h2>
                <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            required
                            checked={formData.policies.termsAccepted}
                            onChange={(e) => setFormData({ ...formData, policies: { ...formData.policies, termsAccepted: e.target.checked } })}
                            className="mt-1 h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600 ">
                            I accept the <a href="#" className="text-blue-600 hover:underline">Aeronomy Platform Terms</a>.
                        </span>
                    </label>
                    <label className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            required
                            checked={formData.policies.dataSharingAccepted}
                            onChange={(e) => setFormData({ ...formData, policies: { ...formData.policies, dataSharingAccepted: e.target.checked } })}
                            className="mt-1 h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600 ">
                            I accept the data sharing and audit clauses.
                        </span>
                    </label>
                    <label className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            required
                            checked={formData.policies.documentationRetentionAccepted}
                            onChange={(e) => setFormData({ ...formData, policies: { ...formData.policies, documentationRetentionAccepted: e.target.checked } })}
                            className="mt-1 h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600 ">
                            I accept the documentation retention rules.
                        </span>
                    </label>
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
