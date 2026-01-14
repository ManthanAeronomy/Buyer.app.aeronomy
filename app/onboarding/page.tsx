import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <OnboardingWizard />
}































