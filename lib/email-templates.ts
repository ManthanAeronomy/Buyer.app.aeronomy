export interface OTPEmailData {
  otpCode: string
  userName?: string
  expirationMinutes?: number
}

export function renderOTPEmail(data: OTPEmailData): string {
  const { otpCode, userName, expirationMinutes = 10 } = data

  const greeting = userName ? `Hello ${userName},` : 'Hello,'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aeronomy</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #0f172a;">
                <span style="color: #0f172a;">Aero</span><span style="color: #0ea5e9;">nomy</span>
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">
                Sustainable Aviation Fuel Marketplace
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="color: #0f172a;">
                <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #0f172a;">
                  ${greeting}
                </h2>

                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                  You're one step away from accessing your Aeronomy account. Use the verification code below to complete your authentication:
                </p>

                <!-- OTP Code Box -->
                <div style="margin: 32px 0; padding: 24px; background-color: #f1f5f9; border-radius: 8px; border: 2px dashed #cbd5e1; text-align: center;">
                  <p style="margin: 0 0 8px; font-size: 14px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
                    Your Verification Code
                  </p>
                  <div style="display: inline-block; padding: 16px 32px; background-color: #ffffff; border-radius: 8px; border: 2px solid #0ea5e9; margin: 8px 0;">
                    <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0ea5e9; font-family: monospace;">
                      ${otpCode}
                    </span>
                  </div>
                  <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8;">
                    This code expires in ${expirationMinutes} minutes
                  </p>
                </div>

                <!-- Security Notice -->
                <div style="margin: 32px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                    <strong style="display: block; margin-bottom: 4px;">Security Notice:</strong>
                    Never share this code with anyone. Aeronomy staff will never ask for your verification code.
                  </p>
                </div>

                <!-- Instructions -->
                <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                  If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0; background-color: #f8fafc;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
                This email was sent by Aeronomy
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                If you didn't request this code, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export interface WelcomeEmailData {
  userName?: string
  companyName?: string
  loginEmail: string
}

export function renderWelcomeEmail(data: WelcomeEmailData): string {
  const { userName, companyName, loginEmail } = data
  const greeting = userName ? `Welcome ${userName}!` : 'Welcome to Aeronomy!'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Aeronomy</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #0f172a;">
                <span style="color: #0f172a;">Aero</span><span style="color: #0ea5e9;">nomy</span>
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">
                Sustainable Aviation Fuel Marketplace
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="color: #0f172a;">
                <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #0f172a;">
                  ${greeting}
                </h2>

                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                  Your account has been successfully created. You're now part of the leading SAF marketplace connecting airlines, producers, and traders.
                </p>

                <!-- Account Details Box -->
                <div style="margin: 32px 0; padding: 24px; background-color: #f1f5f9; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                  <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #0f172a;">Account Details:</p>
                  <table style="width: 100%; font-size: 14px; color: #475569;">
                    <tr>
                      <td style="padding: 4px 0; width: 120px;">Email:</td>
                      <td style="padding: 4px 0; font-weight: 500; color: #0f172a;">${loginEmail}</td>
                    </tr>
                    ${companyName ? `
                    <tr>
                      <td style="padding: 4px 0;">Company:</td>
                      <td style="padding: 4px 0; font-weight: 500; color: #0f172a;">${companyName}</td>
                    </tr>
                    ` : ''}
                  </table>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://app.aeronomy.co/dashboard" 
                     style="display: inline-block; padding: 14px 32px; background-color: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Go to Dashboard
                  </a>
                </div>

                <!-- What's Next -->
                <div style="margin: 32px 0;">
                  <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #0f172a;">What you can do next:</p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;">
                    <li>Browse available SAF lots from verified producers</li>
                    <li>Connect with sustainable fuel suppliers</li>
                    <li>Submit bids and manage contracts</li>
                    <li>Track your sustainability compliance</li>
                  </ul>
                </div>

                <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                  If you have any questions, feel free to reach out to our support team. We're here to help!
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0; background-color: #f8fafc;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
                This email was sent by Aeronomy
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © 2026 Aeronomy. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
