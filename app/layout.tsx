import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aeronomy - Compliance-Grade SAF Marketplace',
  description: 'The trusted platform for sustainable aviation fuel trading with built-in compliance, document verification, and regulatory reporting.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Always wrap in ClerkProvider to avoid hook errors
  // Clerk will handle missing keys gracefully
    return (
      <ClerkProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </ClerkProvider>
  )
}