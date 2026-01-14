import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendEmail } from '@/lib/email'
import { renderWelcomeEmail } from '@/lib/email-templates'

export async function POST(req: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { email, userName, companyName } = body

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Render the welcome email
        const html = renderWelcomeEmail({
            userName,
            companyName,
            loginEmail: email,
        })

        // Send the email
        const result = await sendEmail({
            to: email,
            subject: 'Welcome to Aeronomy - Your SAF Marketplace Account',
            html,
        })

        return NextResponse.json({ success: true, id: result.id })
    } catch (error: any) {
        console.error('Error sending welcome email:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send welcome email' },
            { status: 500 }
        )
    }
}
