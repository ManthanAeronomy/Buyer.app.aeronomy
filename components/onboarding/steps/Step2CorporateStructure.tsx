import { useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step2CorporateStructure({ data, onNext, onBack, saving }: StepProps) {
    const [formData, setFormData] = useState({
        parentCompany: data.corporateStructure?.parentCompany || '',
        subsidiaries: data.corporateStructure?.subsidiaries || [],
        alliances: data.corporateStructure?.alliances || [],
    })

    const [newSubsidiary, setNewSubsidiary] = useState('')
    const [newAlliance, setNewAlliance] = useState('')

    const addSubsidiary = () => {
        if (newSubsidiary.trim()) {
            setFormData({ ...formData, subsidiaries: [...formData.subsidiaries, newSubsidiary.trim()] })
            setNewSubsidiary('')
        }
    }

    const removeSubsidiary = (index: number) => {
        setFormData({ ...formData, subsidiaries: formData.subsidiaries.filter((_: any, i: number) => i !== index) })
    }

    const addAlliance = () => {
        if (newAlliance.trim()) {
            setFormData({ ...formData, alliances: [...formData.alliances, newAlliance.trim()] })
            setNewAlliance('')
        }
    }

    const removeAlliance = (index: number) => {
        setFormData({ ...formData, alliances: formData.alliances.filter((_: any, i: number) => i !== index) })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            corporateStructure: formData
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    2.2 Corporate Structure
                </h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            Parent Company
                        </label>
                        <input
                            type="text"
                            value={formData.parentCompany}
                            onChange={(e) => setFormData({ ...formData, parentCompany: e.target.value })}
                            className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                            placeholder="If applicable"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            Subsidiaries
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubsidiary}
                                onChange={(e) => setNewSubsidiary(e.target.value)}
                                className="flex-1 rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                                placeholder="Add subsidiary"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubsidiary())}
                            />
                            <button
                                type="button"
                                onClick={addSubsidiary}
                                className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200   :bg-slate-700"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.subsidiaries.map((sub: string, index: number) => (
                                <span key={index} className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700  ">
                                    {sub}
                                    <button type="button" onClick={() => removeSubsidiary(index)} className="ml-2 hover:text-blue-900 :text-blue-100">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">
                            Airline Group Membership / Alliances
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newAlliance}
                                onChange={(e) => setNewAlliance(e.target.value)}
                                className="flex-1 rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                                placeholder="e.g. Star Alliance, Oneworld"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAlliance())}
                            />
                            <button
                                type="button"
                                onClick={addAlliance}
                                className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200   :bg-slate-700"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.alliances.map((alliance: string, index: number) => (
                                <span key={index} className="flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700  ">
                                    {alliance}
                                    <button type="button" onClick={() => removeAlliance(index)} className="ml-2 hover:text-purple-900 :text-purple-100">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
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
