'use client'

import { SignOutButton } from '@clerk/nextjs'

export default function DashboardSignOutButton() {
  return (
    <SignOutButton redirectUrl="/sign-in">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900"
      >
        Sign out
      </button>
    </SignOutButton>
  )
}



















