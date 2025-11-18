import { UserPlus, Building2, FileText, CheckSquare, Settings, Rocket } from 'lucide-react'

const steps = [
  {
    name: 'Sign Up',
    description: 'Create your account with multi-factor authentication via Clerk. Choose your role: buyer, producer, or auditor.',
    icon: UserPlus,
    step: 1,
  },
  {
    name: 'Verify Organization',
    description: 'Create or join an organization. Verify corporate email domain and provide legal entity details, jurisdiction, and registration info.',
    icon: Building2,
    step: 2,
  },
  {
    name: 'Upload Documents',
    description: 'Submit ISCC/RSB/ASTM certificates, mass-balance statements, and company documents. All files are hashed and version-controlled.',
    icon: FileText,
    step: 3,
  },
  {
    name: 'Compliance Check',
    description: 'Our engine validates your documents against UK RTFO, EU RED II, and CORSIA. Get a real-time checklist of missing evidence.',
    icon: CheckSquare,
    step: 4,
  },
  {
    name: 'Manual Review',
    description: 'Expert reviewers approve your onboarding with step-up MFA. All actions are logged in an immutable audit trail.',
    icon: Settings,
    step: 5,
  },
  {
    name: 'Start Trading',
    description: 'Get your subdomain, API keys, and feature flags. Access RFQ, order management, and compliance reporting.',
    icon: Rocket,
    step: 6,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">
            Onboarding Flow
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            From signup to active trading in 6 steps
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Our compliance-grade onboarding process ensures every participant meets regulatory 
            requirements before accessing the marketplace.
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto max-w-5xl">
          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={step.name} className="relative">
                {/* Connector line */}
                {idx !== steps.length - 1 && (
                  <div className="absolute left-6 top-14 h-full w-0.5 bg-slate-200 dark:bg-slate-800 md:left-8"></div>
                )}
                
                {/* Step card */}
                <div className="relative flex gap-6 md:gap-8">
                  {/* Step number/icon */}
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary-600 shadow-lg relative z-10">
                      <step.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {step.step}. {step.name}
                      </h3>
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-3 py-1 rounded-full">
                        Step {step.step}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">2-5 Days</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">Average onboarding time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">100%</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">Compliance coverage</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">24/7</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">Audit trail monitoring</div>
          </div>
        </div>
      </div>
    </section>
  )
}




















