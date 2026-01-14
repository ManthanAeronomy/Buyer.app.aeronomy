import { useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step6SafDemand({ data, onNext, onBack, saving }: StepProps) {
    const [formData, setFormData] = useState({
        safDemand: {
            targets: {
                adoptionTarget: data.safDemand?.targets?.adoptionTarget || '',
                targetYear: data.safDemand?.targets?.targetYear || '',
                driver: data.safDemand?.targets?.driver || 'voluntary',
            },
            volume: {
                requirements: data.safDemand?.volume?.requirements || [],
                minVolume: data.safDemand?.volume?.minVolume || '',
                maxVolume: data.safDemand?.volume?.maxVolume || '',
                spotRatio: data.safDemand?.volume?.spotRatio || 50,
                longTermRatio: data.safDemand?.volume?.longTermRatio || 50,
            },
            quality: {
                pathways: data.safDemand?.quality?.pathways || [],
                feedstockExclusions: data.safDemand?.quality?.feedstockExclusions || [],
                minGhgReduction: data.safDemand?.quality?.minGhgReduction || '',
            }
        }
    })

    const [newRequirement, setNewRequirement] = useState({ year: '', amount: '', unit: 'gallons' })

    const addRequirement = () => {
        if (newRequirement.year && newRequirement.amount) {
            setFormData({
                ...formData,
                safDemand: {
                    ...formData.safDemand,
                    volume: {
                        ...formData.safDemand.volume,
                        requirements: [...formData.safDemand.volume.requirements, newRequirement]
                    }
                }
            })
            setNewRequirement({ year: '', amount: '', unit: 'gallons' })
        }
    }

    const togglePathway = (pathway: string) => {
        const current = formData.safDemand.quality.pathways
        const updated = current.includes(pathway)
            ? current.filter((p: string) => p !== pathway)
            : [...current, pathway]
        setFormData({ ...formData, safDemand: { ...formData.safDemand, quality: { ...formData.safDemand.quality, pathways: updated } } })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            safDemand: formData.safDemand
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 5.1 SAF Targets */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    5.1 SAF Targets & Mandates
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Adoption Target (%)</label>
                        <input
                            type="number"
                            value={formData.safDemand.targets.adoptionTarget}
                            onChange={(e) => setFormData({ ...formData, safDemand: { ...formData.safDemand, targets: { ...formData.safDemand.targets, adoptionTarget: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            placeholder="e.g. 10"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Target Year</label>
                        <input
                            type="number"
                            value={formData.safDemand.targets.targetYear}
                            onChange={(e) => setFormData({ ...formData, safDemand: { ...formData.safDemand, targets: { ...formData.safDemand.targets, targetYear: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            placeholder="e.g. 2030"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Primary Driver</label>
                        <select
                            value={formData.safDemand.targets.driver}
                            onChange={(e) => setFormData({ ...formData, safDemand: { ...formData.safDemand, targets: { ...formData.safDemand.targets, driver: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="voluntary">Voluntary / ESG</option>
                            <option value="mandate">Mandate Compliance</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 5.2 Volume Needs */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    5.2 Volume Needs
                </h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Annual Requirements</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Year"
                            value={newRequirement.year}
                            onChange={(e) => setNewRequirement({ ...newRequirement, year: e.target.value })}
                            className="w-24 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={newRequirement.amount}
                            onChange={(e) => setNewRequirement({ ...newRequirement, amount: e.target.value })}
                            className="flex-1 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <select
                            value={newRequirement.unit}
                            onChange={(e) => setNewRequirement({ ...newRequirement, unit: e.target.value })}
                            className="w-24 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="gallons">Gallons</option>
                            <option value="liters">Liters</option>
                            <option value="metric-tons">MT</option>
                        </select>
                        <button type="button" onClick={addRequirement} className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200  :bg-slate-700">
                            <Plus className="h-5 w-5 text-slate-600 " />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.safDemand.volume.requirements.map((req: any, i: number) => (
                            <div key={i} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm  ">
                                <span><span className="font-semibold">{req.year}:</span> {req.amount} {req.unit}</span>
                                <button type="button" onClick={() => {
                                    const updated = formData.safDemand.volume.requirements.filter((_: any, idx: number) => idx !== i)
                                    setFormData({ ...formData, safDemand: { ...formData.safDemand, volume: { ...formData.safDemand.volume, requirements: updated } } })
                                }} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Spot vs Long Term Ratio ({formData.safDemand.volume.spotRatio}% Spot)</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.safDemand.volume.spotRatio}
                        onChange={(e) => {
                            const val = parseInt(e.target.value)
                            setFormData({
                                ...formData,
                                safDemand: {
                                    ...formData.safDemand,
                                    volume: {
                                        ...formData.safDemand.volume,
                                        spotRatio: val,
                                        longTermRatio: 100 - val
                                    }
                                }
                            })
                        }}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 "
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>100% Long Term</span>
                        <span>100% Spot</span>
                    </div>
                </div>
            </div>

            {/* 5.3 Quality */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    5.3 Quality & Pathways
                </h2>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900 ">Preferred Pathways</label>
                    <div className="flex flex-wrap gap-3">
                        {['HEFA', 'ATJ', 'FT', 'PtL', 'SIP'].map((path) => (
                            <button
                                key={path}
                                type="button"
                                onClick={() => togglePathway(path)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${formData.safDemand.quality.pathways.includes(path)
                                    ? 'bg-blue-100 text-blue-700  '
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200  '
                                    }`}
                            >
                                {path}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Minimum GHG Reduction (%)</label>
                    <input
                        type="number"
                        value={formData.safDemand.quality.minGhgReduction}
                        onChange={(e) => setFormData({ ...formData, safDemand: { ...formData.safDemand, quality: { ...formData.safDemand.quality, minGhgReduction: e.target.value } } })}
                        className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        placeholder="e.g. 70"
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
