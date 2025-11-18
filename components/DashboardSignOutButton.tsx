'use client'

import { SignOutButton } from '@clerk/nextjs'

export default function DashboardSignOutButton() {
  return (
    <SignOutButton redirectUrl="/sign-in">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700"
      >
        Sign out
      </button>
    </SignOutButton>
  )
}









