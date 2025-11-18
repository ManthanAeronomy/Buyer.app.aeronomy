import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step10Integrations({ data, onNext, onBack, saving }: StepProps) {
    const [formData, setFormData] = useState({
        integrations: {
            erpSystem: data.integrations?.erpSystem || '',
            fuelSystem: data.integrations?.fuelSystem || '',
            esgTool: data.integrations?.esgTool || '',
            dataExchange: {
                method: data.integrations?.dataExchange?.method || 'portal',
                frequency: data.integrations?.dataExchange?.frequency || 'daily',
            }
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            integrations: formData.integrations
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 10.1 Internal Systems */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    10.1 Internal Systems Integration
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">ERP / Finance System</label>
                        <input
                            type="text"
                            value={formData.integrations.erpSystem}
                            onChange={(e) => setFormData({ ...formData, integrations: { ...formData.integrations, erpSystem: e.target.value } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            placeholder="e.g. SAP, Oracle, NetSuite"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Fuel Management System</label>
                        <input
                            type="text"
                            value={formData.integrations.fuelSystem}
                            onChange={(e) => setFormData({ ...formData, integrations: { ...formData.integrations, fuelSystem: e.target.value } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            placeholder="e.g. FuelPlus, Skymetrix"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">ESG Reporting Tool</label>
                        <input
                            type="text"
                            value={formData.integrations.esgTool}
                            onChange={(e) => setFormData({ ...formData, integrations: { ...formData.integrations, esgTool: e.target.value } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                            placeholder="e.g. Salesforce Net Zero, Envizi"
                        />
                    </div>
                </div>
            </div>

            {/* 10.2 Data Exchange */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    10.2 Data Exchange Setup
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Preferred Method</label>
                        <select
                            value={formData.integrations.dataExchange.method}
                            onChange={(e) => setFormData({ ...formData, integrations: { ...formData.integrations, dataExchange: { ...formData.integrations.dataExchange, method: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="portal">Web Portal Only</option>
                            <option value="api">REST API</option>
                            <option value="sftp">SFTP / Batch</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 ">Sync Frequency</label>
                        <select
                            value={formData.integrations.dataExchange.frequency}
                            onChange={(e) => setFormData({ ...formData, integrations: { ...formData.integrations, dataExchange: { ...formData.integrations.dataExchange, frequency: e.target.value } } })}
                            className="w-full rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        >
                            <option value="real-time">Real-time</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
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
