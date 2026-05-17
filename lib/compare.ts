import type { Screen, CompareResult } from './types'

async function decodeImageToRGBA(base64: string, mime: string): Promise<{
  data: Buffer
  width: number
  height: number
}> {
  const sharp = (await import('sharp')).default
  const buffer = Buffer.from(base64, 'base64')
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

async function resizeTo(base64: string, mime: string, w: number, h: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default
  const buffer = Buffer.from(base64, 'base64')
  const { data } = await sharp(buffer)
    .resize(w, h, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return data
}

export async function compareScreenshots(a: Screen, b: Screen): Promise<CompareResult> {
  const pixelmatch = (await import('pixelmatch')).default
  const sharp = (await import('sharp')).default

  const width = Math.min(a.width, b.width, 1920)
  const height = Math.min(a.height, b.height, 1080)

  const [imgA, imgB] = await Promise.all([
    resizeTo(a.screenshotBase64, a.mimeType, width, height),
    resizeTo(b.screenshotBase64, b.mimeType, width, height),
  ])

  const diffData = Buffer.alloc(width * height * 4)

  const diffPixels = pixelmatch(
    new Uint8Array(imgA),
    new Uint8Array(imgB),
    new Uint8Array(diffData.buffer),
    width,
    height,
    { threshold: 0.1, includeAA: false }
  )

  const totalPixels = width * height
  const diffPercent = (diffPixels / totalPixels) * 100
  const syncScore = Math.max(0, Math.round(100 - diffPercent))

  // Generate diff image as base64 PNG
  const diffPng = await sharp(diffData, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer()
  const diffImageBase64 = diffPng.toString('base64')

  return {
    screenA: a,
    screenB: b,
    diffPixels,
    totalPixels,
    diffPercent: Math.round(diffPercent * 100) / 100,
    syncScore,
    diffImageBase64,
  }
}
