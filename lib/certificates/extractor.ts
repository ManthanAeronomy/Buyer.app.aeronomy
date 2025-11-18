import { createWorker } from 'tesseract.js'
import { format } from 'date-fns'
import crypto from 'crypto'

export interface ExtractedCertificateData {
  type?: string
  issuingBody?: string
  issueDate?: string
  expiryDate?: string
  volume?: {
    amount?: number
    unit?: string
  }
  rawText: string
  ocrEngine: 'pdf' | 'tesseract'
}

const DATE_PATTERNS = [
  /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g,
  /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/g,
  /\b([A-Za-z]{3,9})\s(\d{1,2}),\s(\d{4})\b/g,
]

const VOLUME_PATTERN = /\b(\d{1,4}(?:[\.,]\d{1,2})?)\s?(?:tons|tonnes|mt|liters|litres|kg|kilograms|gallons)\b/i
const ISSUING_BODY_PATTERN = /(International Sustainability.*?Certification|Roundtable on Sustainable Biomaterials|CORSIA|International Civil Aviation Organization)/i

const CERTIFICATE_TYPE_KEYWORDS: Record<string, RegExp> = {
  ISCC: /\bISCC\b/i,
  RSB: /\bRSB\b/i,
  CORSIA: /\bCORSIA\b/i,
}

async function extractTextFromPdf(buffer: Buffer) {
  const pdfModule = await import('pdf-parse')
  const parse = (pdfModule as any).default || (pdfModule as any)
  const { text } = await parse(buffer)
  return text
}

async function extractTextFromImage(buffer: Buffer) {
  const worker = (await createWorker()) as any
  try {
    if (worker.loadLanguage) {
      await worker.loadLanguage('eng')
    }
    if (worker.initialize) {
      await worker.initialize('eng')
    }
    const { data } = await worker.recognize(buffer)
    return data.text
  } finally {
    await worker.terminate()
  }
}

async function safeExtractTextFromImage(buffer: Buffer) {
  try {
    return await extractTextFromImage(buffer)
  } catch (error) {
    console.error('Tesseract OCR failed', error)
    throw error
  }
}

function normalizeDate(value: string) {
  let date: Date | null = null

  // MM/DD/YYYY or DD/MM/YYYY
  const mmdd = value.match(DATE_PATTERNS[0])
  if (mmdd) {
    const [dayOrMonth, monthOrDay, year] = value.split(/[\/\-]/).map((part) => part.trim())
    if (year.length === 2) {
      const yearNum = parseInt(year, 10)
      const pivot = yearNum >= 70 ? 1900 : 2000
      date = new Date(pivot + yearNum, parseInt(monthOrDay, 10) - 1, parseInt(dayOrMonth, 10))
    } else {
      const first = parseInt(dayOrMonth, 10)
      const second = parseInt(monthOrDay, 10)
      // best guess: if first > 12 treat as day/month, else keep as month/day
      if (first > 12) {
        date = new Date(parseInt(year, 10), second - 1, first)
      } else {
        date = new Date(parseInt(year, 10), first - 1, second)
      }
    }
  }

  const iso = value.match(DATE_PATTERNS[1])
  if (!date && iso) {
    const [year, month, day] = value.split(/[\/\-]/).map((part) => parseInt(part, 10))
    date = new Date(year, month - 1, day)
  }

  const named = value.match(DATE_PATTERNS[2])
  if (!date && named) {
    date = new Date(value)
  }

  if (!date || Number.isNaN(date.getTime())) {
    return undefined
  }

  return format(date, 'yyyy-MM-dd')
}

function detectCertificateType(text: string) {
  for (const [type, pattern] of Object.entries(CERTIFICATE_TYPE_KEYWORDS)) {
    if (pattern.test(text)) {
      return type
    }
  }
  return undefined
}

function extractVolume(text: string) {
  const match = text.match(VOLUME_PATTERN)
  if (!match) {
    return undefined
  }

  const amount = parseFloat(match[1].replace(',', '.'))
  const unit = match[0].replace(match[1], '').trim()

  if (Number.isNaN(amount)) {
    return undefined
  }

  return {
    amount,
    unit,
  }
}

function extractDates(text: string) {
  const allMatches = text.matchAll(DATE_PATTERNS[0])
  const found: string[] = []
  for (const match of allMatches) {
    if (match[0]) {
      found.push(match[0])
    }
  }

  const isoMatches = text.matchAll(DATE_PATTERNS[1])
  for (const match of isoMatches) {
    if (match[0]) {
      found.push(match[0])
    }
  }

  const namedMatches = text.matchAll(DATE_PATTERNS[2])
  for (const match of namedMatches) {
    if (match[0]) {
      found.push(match[0])
    }
  }

  const unique = Array.from(new Set(found))

  if (unique.length === 0) {
    return { issueDate: undefined, expiryDate: undefined }
  }

  const normalized = unique
    .map((value) => ({
      original: value,
      normalized: normalizeDate(value),
    }))
    .filter((item) => item.normalized)
    .map((item) => item.normalized as string)
    .sort()

  if (normalized.length === 0) {
    return { issueDate: undefined, expiryDate: undefined }
  }

  const issueDate = normalized[0]
  const expiryDate = normalized[normalized.length - 1]

  return { issueDate, expiryDate }
}

export async function extractCertificateData(buffer: Buffer, mimeType: string): Promise<ExtractedCertificateData> {
  let text: string
  let engine: ExtractedCertificateData['ocrEngine']

  if (mimeType === 'application/pdf') {
    text = await extractTextFromPdf(buffer)
    engine = 'pdf'
  } else {
    text = await safeExtractTextFromImage(buffer)
    engine = 'tesseract'
  }

  const trimmed = text.replace(/\s+/g, ' ').trim()
  const { issueDate, expiryDate } = extractDates(trimmed)
  const volume = extractVolume(trimmed)
  const type = detectCertificateType(trimmed)
  const issuingBody = trimmed.match(ISSUING_BODY_PATTERN)?.[0]

  return {
    type,
    issuingBody: issuingBody?.trim(),
    issueDate,
    expiryDate,
    volume,
    rawText: trimmed,
    ocrEngine: engine,
  }
}

export function computeFileChecksum(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

