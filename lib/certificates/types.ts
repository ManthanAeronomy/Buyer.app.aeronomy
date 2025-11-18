export type CertificateListStatus = 'uploaded' | 'validated' | 'expiring' | 'expired' | 'invalid'

export interface CertificateVolume {
  amount?: number
  unit?: string
}

export interface CertificateRecord {
  _id: string
  orgId: string
  type: string
  issuingBody?: string
  issueDate?: string
  expiryDate?: string
  volume?: CertificateVolume
  status: CertificateListStatus
  file?: {
    url?: string
    originalName?: string
    mime?: string
    size?: number
  }
  extracted?: {
    text?: string
    engine?: string
  }
  createdAt: string
  updatedAt: string
}









