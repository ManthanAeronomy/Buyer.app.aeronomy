import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

interface Contact {
    name: string
    email: string
    phone: string
    role: string
}

const ContactForm = ({ title, value, onChange }: { title: string, value: Contact, onChange: (val: Contact) => void }) => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4  ">
        <h3 className="mb-3 font-medium text-slate-900 ">{title}</h3>
        <div className="grid gap-4 md:grid-cols-2">
            <input
                type="text"
                placeholder="Name"
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                className="rounded-md border border-slate-400 px-3 py-2 text-sm  "
            />
            <input
                type="email"
                placeholder="Email"
                value={value.email}
                onChange={(e) => onChange({ ...value, email: e.target.value })}
                className="rounded-md border border-slate-400 px-3 py-2 text-sm  "
            />
            <input
                type="text"
                placeholder="Phone"
                value={value.phone}
                onChange={(e) => onChange({ ...value, phone: e.target.value })}
                className="rounded-md border border-slate-400 px-3 py-2 text-sm  "
            />
            <input
                type="text"
                placeholder="Job Title / Role"
                value={value.role}
                onChange={(e) => onChange({ ...value, role: e.target.value })}
                className="rounded-md border border-slate-400 px-3 py-2 text-sm  "
            />
        </div>
    </div>
)

export default function Step3ContactPoints({ data, onNext, onBack, saving }: StepProps) {
    const emptyContact = { name: '', email: '', phone: '', role: '' }

    const [formData, setFormData] = useState({
        primarySaf: data.contactPoints?.primarySaf || emptyContact,
        sustainability: data.contactPoints?.sustainability || emptyContact,
        finance: data.contactPoints?.finance || emptyContact,
        legal: data.contactPoints?.legal || emptyContact,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({
            contactPoints: formData
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 ">
                    2.3 Contact Points
                </h2>

                <div className="space-y-4">
                    <ContactForm
                        title="Primary SAF Contact"
                        value={formData.primarySaf}
                        onChange={(val) => setFormData({ ...formData, primarySaf: val })}
                    />
                    <ContactForm
                        title="Sustainability Contact"
                        value={formData.sustainability}
                        onChange={(val) => setFormData({ ...formData, sustainability: val })}
                    />
                    <ContactForm
                        title="Finance / AP Contact"
                        value={formData.finance}
                        onChange={(val) => setFormData({ ...formData, finance: val })}
                    />
                    <ContactForm
                        title="Legal / Contracts Contact"
                        value={formData.legal}
                        onChange={(val) => setFormData({ ...formData, legal: val })}
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
