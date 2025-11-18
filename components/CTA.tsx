import { ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'

export default function CTA() {
  return (
    <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-purple-600">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to start trading SAF with confidence?
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-100">
            Join leading aviation fuel producers and buyers on the platform built for 
            compliance-grade sustainable fuel trading.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="group rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-lg hover:bg-slate-50 transition-all hover:scale-105 flex items-center gap-2"
            >
              Start Your Onboarding
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#contact"
              className="group rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Mail className="h-5 w-5" />
              Contact Sales
            </a>
          </div>
          <p className="mt-6 text-sm text-primary-100">
            Questions? Email us at{' '}
            <a href="mailto:hello@aeronomy.app" className="font-semibold text-white hover:underline">
              hello@aeronomy.app
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

