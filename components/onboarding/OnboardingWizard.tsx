'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, Circle } from 'lucide-react'

// We will import step components here as we create them
import Step1LegalEntity from './steps/Step1LegalEntity'
import Step2CorporateStructure from './steps/Step2CorporateStructure'
import Step3ContactPoints from './steps/Step3ContactPoints'
import Step4Compliance from './steps/Step4Compliance'
import Step5Operational from './steps/Step5Operational'
import Step6SafDemand from './steps/Step6SafDemand'
import Step7Procurement from './steps/Step7Procurement'
import Step8Financial from './steps/Step8Financial'
import Step9Sustainability from './steps/Step9Sustainability'
import Step10Integrations from './steps/Step10Integrations'
import Step11Governance from './steps/Step11Governance'
import Step12Review from './steps/Step12Review'

export default function OnboardingWizard() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/organization/profile')
            if (res.ok) {
                const data = await res.json()
                // If isNew flag is returned, we start with empty data
                if (data.isNew) {
                    setFormData({})
                } else {
                    setFormData(data)
                }
            }
        } catch (error) {
            console.error('Failed to load profile', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (stepData: any) => {
        setSaving(true)
        try {
            // Optimistic update
            const updatedData = { ...formData, ...stepData }
            setFormData(updatedData)

            const res = await fetch('/api/organization/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stepData),
            })

            if (!res.ok) throw new Error('Failed to save')
        } catch (error) {
            console.error('Save error', error)
        } finally {
            setSaving(false)
        }
    }

    const nextStep = async (stepData?: any) => {
        if (stepData) {
            await handleSave(stepData)
        }

        if (currentStep === TOTAL_STEPS) {
            await completeOnboarding()
        } else {
            setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
            // Scroll main content to top
            const mainContent = document.getElementById('main-content')
            if (mainContent) mainContent.scrollTop = 0
        }
    }

    const completeOnboarding = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/organization/onboarding/complete', {
                method: 'POST'
            })
            if (res.ok) {
                router.push('/dashboard')
            }
        } catch (error) {
            console.error('Completion error', error)
        } finally {
            setSaving(false)
        }
    }

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
        const mainContent = document.getElementById('main-content')
        if (mainContent) mainContent.scrollTop = 0
    }

    const TOTAL_STEPS = 12

    const steps = [
        { id: 1, title: 'Legal Entity', component: Step1LegalEntity },
        { id: 2, title: 'Corporate Structure', component: Step2CorporateStructure },
        { id: 3, title: 'Contact Points', component: Step3ContactPoints },
        { id: 4, title: 'Compliance & KYB', component: Step4Compliance },
        { id: 5, title: 'Operational Footprint', component: Step5Operational },
        { id: 6, title: 'SAF Demand', component: Step6SafDemand },
        { id: 7, title: 'Procurement', component: Step7Procurement },
        { id: 8, title: 'Financial', component: Step8Financial },
        { id: 9, title: 'Sustainability', component: Step9Sustainability },
        { id: 10, title: 'Integrations', component: Step10Integrations },
        { id: 11, title: 'Governance', component: Step11Governance },
        { id: 12, title: 'Review & Submit', component: Step12Review },
    ]

    const CurrentStepComponent = steps[currentStep - 1].component

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 bg-[url('/images/onboardingbg.png')] bg-cover bg-center bg-no-repeat font-sans text-slate-900">
            {/* Backdrop Overlay - Lightened for better contrast with floating island if needed, but keeping dark overlay for focus */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

            {/* Floating Island Card */}
            <div className="relative z-10 flex h-full max-h-[90vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 lg:h-[850px]">
                {/* Sidebar */}
                <aside className="hidden w-80 flex-col border-r border-slate-200 bg-slate-50/80 lg:flex">
                    <div className="p-8">
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                A
                            </div>
                            <span>Aeronomy</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">Airline Onboarding</p>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-6 pb-8">
                        <ul className="space-y-1">
                            {steps.map((step) => {
                                const isActive = step.id === currentStep
                                const isCompleted = step.id < currentStep

                                return (
                                    <li key={step.id}>
                                        <button
                                            disabled={!isCompleted && !isActive}
                                            onClick={() => isCompleted && setCurrentStep(step.id)}
                                            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                                                : isCompleted
                                                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                    : 'cursor-default text-slate-400'
                                                }`}
                                        >
                                            <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${isActive
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : isCompleted
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : 'border-slate-300 bg-transparent'
                                                }`}>
                                                {isCompleted ? (
                                                    <Check className="h-3.5 w-3.5" />
                                                ) : (
                                                    <span className="text-xs">{step.id}</span>
                                                )}
                                            </div>
                                            <span className="truncate">{step.title}</span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>

                    <div className="border-t border-slate-200 p-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200" />
                            <div className="text-sm">
                                <p className="font-medium text-slate-900">Setup in progress</p>
                                <p className="text-slate-500">{Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}% completed</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main id="main-content" className="flex-1 overflow-y-auto bg-white">
                    <div className="flex min-h-full flex-col">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:hidden">
                            <span className="font-semibold text-slate-900">Step {currentStep} of {TOTAL_STEPS}</span>
                            <span className="text-sm text-slate-500">{steps[currentStep - 1].title}</span>
                        </div>

                        <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:px-12 md:py-16">
                            <div className="mb-8">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                                    {steps[currentStep - 1].title}
                                </h1>
                                <p className="mt-2 text-lg text-slate-600">
                                    Please provide the following details to configure your organization profile.
                                </p>
                            </div>

                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <CurrentStepComponent
                                    key={currentStep}
                                    data={formData}
                                    onNext={nextStep}
                                    onBack={prevStep}
                                    isFirstStep={currentStep === 1}
                                    isLastStep={currentStep === TOTAL_STEPS}
                                    saving={saving}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}