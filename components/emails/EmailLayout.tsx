import React from 'react'

interface EmailLayoutProps {
  children: React.ReactNode
}

export default function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Aeronomy</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', backgroundColor: '#f8fafc' }}>
        <table
          role="presentation"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#f8fafc',
            padding: '20px 0',
          }}
        >
          <tr>
            <td align="center" style={{ padding: '40px 20px' }}>
              <table
                role="presentation"
                style={{
                  maxWidth: '600px',
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Header */}
                <tr>
                  <td style={{ padding: '40px 40px 30px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, color: '#0f172a' }}>
                      <span style={{ color: '#0f172a' }}>Aero</span>
                      <span style={{ color: '#0ea5e9' }}>nomy</span>
                    </h1>
                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>
                      Sustainable Aviation Fuel Marketplace
                    </p>
                  </td>
                </tr>

                {/* Content */}
                <tr>
                  <td style={{ padding: '40px' }}>
                    {children}
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ padding: '30px 40px', textAlign: 'center', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b' }}>
                      This email was sent by Aeronomy
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                      If you didn&apos;t request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}

