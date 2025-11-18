import { CheckCircle2, FileCheck2, Globe, Scale } from 'lucide-react'

const standards = [
  {
    name: 'UK RTFO 2025',
    description: 'Renewable Transport Fuel Obligation compliance with automated mass-balance validation and GHG reporting.',
    icon: FileCheck2,
  },
  {
    name: 'EU RED II',
    description: 'Renewable Energy Directive II compliance for sustainability criteria, chain of custody, and double counting.',
    icon: Globe,
  },
  {
    name: 'ICAO CORSIA',
    description: 'Carbon Offsetting and Reduction Scheme for International Aviation with lifecycle emissions tracking.',
    icon: Scale,
  },
  {
    name: 'ISCC / RSB / ASTM',
    description: 'Support for all major certification schemes including ISCC, RSB, and ASTM D7566 fuel specifications.',
    icon: CheckCircle2,
  },
]

export default function Compliance() {
  return (
    <section id="compliance" className="py-24 px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">
            Regulatory Standards
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Built for global compliance from day one
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Aeronomy automatically validates transactions against major aviation fuel regulations 
            and sustainability schemes, keeping you compliant across jurisdictions.
          </p>
        </div>

        {/* Standards grid */}
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {standards.map((standard) => (
              <div
                key={standard.name}
                className="relative bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-950/20 dark:to-purple-950/20 p-8 rounded-2xl border border-primary-200 dark:border-primary-900"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
                      <standard.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {standard.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {standard.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance features */}
        <div className="mt-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Compliance Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Automated document validation',
              'Real-time missing evidence alerts',
              'Immutable audit trails',
              'Version-controlled certificates',
              'GHG lifecycle calculations',
              'Mass-balance verification',
              'Chain of custody tracking',
              'Regulatory reporting exports',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}




















