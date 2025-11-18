import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Organization Onboarding | Aeronomy',
    description: 'Complete your organization profile',
}

export default function OnboardingPage() {
    return <OnboardingWizard />
}
