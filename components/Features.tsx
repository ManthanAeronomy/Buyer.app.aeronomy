import { Shield, Lock, FileCheck, Users, BarChart3, Zap } from 'lucide-react'

const features = [
  {
    name: 'Identity Proofing',
    description: 'Org-level verification with corporate email domains, legal entity checks, and jurisdiction mapping. Built for regulated B2B trading.',
    icon: Shield,
  },
  {
    name: 'Role-Based Access',
    description: 'Least-privilege roles for buyers, producers, and auditors. Enforce segregation of duties with 4-eyes approval for sensitive changes.',
    icon: Users,
  },
  {
    name: 'Document Integrity',
    description: 'SHA-256 hashing on upload, version control, and AV scanning. Immutable audit trail for every document and change.',
    icon: FileCheck,
  },
  {
    name: 'Compliance Pre-Check',
    description: 'Automated validation against UK RTFO, EU RED II, and CORSIA requirements. Real-time missing evidence checklist.',
    icon: BarChart3,
  },
  {
    name: 'Enterprise Security',
    description: 'JWT authentication, step-up MFA for critical actions, tenant-scoped data isolation, and SOC2-ready audit logs.',
    icon: Lock,
  },
  {
    name: 'Fast Onboarding',
    description: 'State-machine driven process with save/resume. From signup to active tenant in days, not months.',
    icon: Zap,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">
            Built for Compliance
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything you need to trade SAF with confidence
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Aeronomy combines identity management, document verification, and compliance checking 
            into a single platform trusted by aviation fuel producers and buyers worldwide.
          </p>
        </div>

        {/* Features grid */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative group bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 group-hover:bg-primary-700 transition-colors">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}




















