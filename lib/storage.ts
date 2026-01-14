import fs from 'fs/promises'
import path from 'path'

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads')

export async function ensureUploadDir(subdir = '') {
  const dirPath = path.join(UPLOAD_ROOT, subdir)
  await fs.mkdir(dirPath, { recursive: true })
  return dirPath
}

export async function persistFile(buffer: Buffer, storageKey: string) {
  const filePath = path.join(UPLOAD_ROOT, storageKey)
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filePath, buffer)
  return filePath
}

export function buildPublicUrl(storageKey: string) {
  return `/uploads/${storageKey}`
}



















