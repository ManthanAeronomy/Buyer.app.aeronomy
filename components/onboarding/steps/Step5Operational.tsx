import { useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step5Operational({ data, onNext, onBack, saving }: StepProps) {
    const [formData, setFormData] = useState({
        operational: {
            hubAirports: data.operational?.hubAirports || [],
            regions: data.operational?.regions || [],
            fuelSuppliers: data.operational?.fuelSuppliers || [],
            logisticPartners: data.operational?.logisticPartners || [],
            fleet: {
                types: data.operational?.fleet?.types || [],
                annualBlockHours: data.operational?.fleet?.annualBlockHours || '',
            }
        }
    })

    const [newHub, setNewHub] = useState('')
    const [newFleet, setNewFleet] = useState('')
    const [newPartner, setNewPartner] = useState('')
    const [newSupplier, setNewSupplier] = useState({ airport: '', supplier: '' })

    const addHub = () => {
        if (newHub.trim()) {
            setFormData({
                ...formData,
                operational: { ...formData.operational, hubAirports: [...formData.operational.hubAirports, newHub.trim()] }
            })
            setNewHub('')
        }
    }

    const addFleet = () => {
        if (newFleet.trim()) {
            setFormData({
                ...formData,
                operational: {
                    ...formData.operational,
                    fleet: { ...formData.operational.fleet, types: [...formData.operational.fleet.types, newFleet.trim()] }
                }
            })
            setNewFleet('')
        }
    }

    const addPartner = () => {
        if (newPartner.trim()) {
            setFormData({
                ...formData,
                operational: { ...formData.operational, logisticPartners: [...formData.operational.logisticPartners, newPartner.trim()] }
            })
            setNewPartner('')
        }
    }

    const addSupplier = () => {
        if (newSupplier.airport.trim() && newSupplier.supplier.trim()) {
            setFormData({
                ...formData,
                operational: { ...formData.operational, fuelSuppliers: [...formData.operational.fuelSuppliers, newSupplier] }
            })
            setNewSupplier({ airport: '', supplier: '' })
        }
    }

    const toggleRegion = (region: string) => {
        const current = formData.operational.regions
        const updated = current.includes(region)
            ? current.filter((r: string) => r !== region)
            : [...current, region]
        setFormData({ ...formData, operational: { ...formData.operational, regions: updated } })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            operational: formData.operational
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 4.1 Network Mapping */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    4.1 Network Mapping
                </h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Hub & Focus Airports</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newHub}
                            onChange={(e) => setNewHub(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                            placeholder="e.g. LHR, JFK, DXB"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHub())}
                        />
                        <button type="button" onClick={addHub} className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200  :bg-slate-700">
                            <Plus className="h-5 w-5 text-slate-600 " />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.operational.hubAirports.map((hub: string, i: number) => (
                            <span key={i} className="flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-900  ">
                                {hub}
                                <button type="button" onClick={() => {
                                    const updated = formData.operational.hubAirports.filter((_: any, idx: number) => idx !== i)
                                    setFormData({ ...formData, operational: { ...formData.operational, hubAirports: updated } })
                                }} className="ml-2 hover:text-red-500"><X className="h-3 w-3" /></button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Operating Regions</label>
                    <div className="flex flex-wrap gap-3">
                        {['EU', 'North America', 'South America', 'APAC', 'MEA', 'Global'].map((region) => (
                            <button
                                key={region}
                                type="button"
                                onClick={() => toggleRegion(region)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${formData.operational.regions.includes(region)
                                    ? 'bg-blue-100 text-blue-700  '
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200  '
                                    }`}
                            >
                                {region}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4.2 Fuel Uplift Structure */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    4.2 Fuel Uplift Structure
                </h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Primary Fuel Suppliers (Optional)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Airport (e.g. LHR)"
                            value={newSupplier.airport}
                            onChange={(e) => setNewSupplier({ ...newSupplier, airport: e.target.value })}
                            className="w-1/3 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <input
                            type="text"
                            placeholder="Supplier Name"
                            value={newSupplier.supplier}
                            onChange={(e) => setNewSupplier({ ...newSupplier, supplier: e.target.value })}
                            className="flex-1 rounded-lg border border-slate-400 px-3 py-2 text-sm  "
                        />
                        <button type="button" onClick={addSupplier} className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200  :bg-slate-700">
                            <Plus className="h-5 w-5 text-slate-600 " />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.operational.fuelSuppliers.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm  ">
                                <span><span className="font-semibold">{item.airport}:</span> {item.supplier}</span>
                                <button type="button" onClick={() => {
                                    const updated = formData.operational.fuelSuppliers.filter((_: any, idx: number) => idx !== i)
                                    setFormData({ ...formData, operational: { ...formData.operational, fuelSuppliers: updated } })
                                }} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Logistic Partners</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newPartner}
                            onChange={(e) => setNewPartner(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                            placeholder="Into-plane, storage providers"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPartner())}
                        />
                        <button type="button" onClick={addPartner} className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200  :bg-slate-700">
                            <Plus className="h-5 w-5 text-slate-600 " />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.operational.logisticPartners.map((p: string, i: number) => (
                            <span key={i} className="flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-900  ">
                                {p}
                                <button type="button" onClick={() => {
                                    const updated = formData.operational.logisticPartners.filter((_: any, idx: number) => idx !== i)
                                    setFormData({ ...formData, operational: { ...formData.operational, logisticPartners: updated } })
                                }} className="ml-2 hover:text-red-500"><X className="h-3 w-3" /></button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4.3 Fleet Definition */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    4.3 Fleet Definition
                </h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Fleet Types</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newFleet}
                            onChange={(e) => setNewFleet(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                            placeholder="e.g. A320neo, 737 MAX, A350"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFleet())}
                        />
                        <button type="button" onClick={addFleet} className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200  :bg-slate-700">
                            <Plus className="h-5 w-5 text-slate-600 " />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.operational.fleet.types.map((f: string, i: number) => (
                            <span key={i} className="flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-900  ">
                                {f}
                                <button type="button" onClick={() => {
                                    const updated = formData.operational.fleet.types.filter((_: any, idx: number) => idx !== i)
                                    setFormData({ ...formData, operational: { ...formData.operational, fleet: { ...formData.operational.fleet, types: updated } } })
                                }} className="ml-2 hover:text-red-500"><X className="h-3 w-3" /></button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 ">Annual Block Hours (Optional)</label>
                    <input
                        type="number"
                        value={formData.operational.fleet.annualBlockHours}
                        onChange={(e) => setFormData({ ...formData, operational: { ...formData.operational, fleet: { ...formData.operational.fleet, annualBlockHours: e.target.value } } })}
                        className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500   "
                        placeholder="Total annual block hours"
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
