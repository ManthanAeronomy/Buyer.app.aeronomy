import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'Aeronomy <noreply@aeronomy.co>',
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { success: true, id: data?.id }
  } catch (error: any) {
    console.error('Email sending error:', error)
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`)
  }
}

export default resend

