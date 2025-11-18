import { Check, ChevronLeft, Loader2 } from 'lucide-react'

interface StepProps {
    data: any
    onNext: (data: any) => void
    onBack: () => void
    saving: boolean
}

export default function Step12Review({ data, onNext, onBack, saving }: StepProps) {
    const handleSubmit = () => {
        onNext({})
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ">
                    <Check className="h-8 w-8 text-green-600 " />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 ">Review & Submit</h2>
                <p className="mt-2 text-slate-600 ">
                    Please review your organization profile before submitting. You can update these details later from the settings.
                </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6  ">
                <h3 className="mb-4 font-semibold text-slate-900 ">Summary</h3>
                <dl className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-slate-500 ">Organization Name</dt>
                        <dd className="mt-1 text-sm text-slate-900 ">{data.legalEntity?.legalName || data.name}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 ">Registered Address</dt>
                        <dd className="mt-1 text-sm text-slate-900 ">{data.legalEntity?.registeredAddress || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 ">Primary Contact</dt>
                        <dd className="mt-1 text-sm text-slate-900 ">{data.contactPoints?.primarySaf?.name || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 ">SAF Target</dt>
                        <dd className="mt-1 text-sm text-slate-900 ">
                            {data.safDemand?.targets?.adoptionTarget ? `${data.safDemand.targets.adoptionTarget}% by ${data.safDemand.targets.targetYear}` : '-'}
                        </dd>
                    </div>
                </dl>
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
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center rounded-lg bg-green-600 px-8 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                    Complete Onboarding
                </button>
            </div>
        </div>
    )
}
