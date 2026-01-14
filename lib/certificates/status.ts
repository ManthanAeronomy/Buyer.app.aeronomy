import { addDays, isBefore, parseISO, startOfDay } from 'date-fns'
import { CertificateStatus } from '@/models/Certificate'

export const EXPIRING_THRESHOLD_DAYS = 30

export function determineCertificateStatus(expiryDate?: Date | string | null): CertificateStatus {
  if (!expiryDate) {
    return 'uploaded'
  }

  const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate
  const today = startOfDay(new Date())

  if (isBefore(expiry, today)) {
    return 'expired'
  }

  const threshold = addDays(today, EXPIRING_THRESHOLD_DAYS)
  if (isBefore(expiry, threshold)) {
    return 'expiring'
  }

  return 'validated'
}



















