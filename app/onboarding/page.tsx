import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to Aeronomy!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Let's get your organization set up for compliance-grade SAF trading
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Organization Details
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Provide your company information and verify your corporate email domain
                </p>
                <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Start Setup
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 opacity-50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-600 text-white flex items-center justify-center font-semibold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Upload Documents
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Submit your ISCC/RSB/ASTM certificates and company documents
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 opacity-50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-600 text-white flex items-center justify-center font-semibold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Compliance Review
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We'll validate your documents against regulatory requirements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




















