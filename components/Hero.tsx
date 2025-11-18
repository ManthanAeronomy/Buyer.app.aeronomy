import { ArrowRight, Shield, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-950/30 px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 mb-8 animate-fade-in">
            <Shield className="h-4 w-4" />
            Compliance-Grade SAF Marketplace
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl mb-6 animate-slide-up">
            Trade Sustainable Aviation Fuel with
            <span className="text-lightblue-500"> Confidence</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg leading-8 text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto animate-slide-up">
            The trusted platform for SAF producers, buyers, and auditors. Built-in compliance checking, 
            document verification, and regulatory reporting for UK RTFO, EU RED II, and ICAO CORSIA.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up">
            <Link
              href="/sign-up"
              className="group rounded-lg bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all hover:scale-105 flex items-center gap-2"
            >
              Start Onboarding
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="rounded-lg border-2 border-slate-300 dark:border-slate-700 px-8 py-4 text-base font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              See How It Works
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>UK RTFO Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>EU RED II Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>ICAO CORSIA Certified</span>
            </div>
          </div>
        </div>

        {/* Visual element / mockup placeholder */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-96 w-full max-w-5xl bg-gradient-to-r from-primary-600/20 to-purple-600/20 dark:from-primary-600/10 dark:to-purple-600/10 blur-3xl rounded-full"></div>
          </div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="h-4 bg-primary-200 dark:bg-primary-900/30 rounded w-2/3"></div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

