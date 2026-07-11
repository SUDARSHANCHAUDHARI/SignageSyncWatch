import pixelmatch from 'pixelmatch'
import type { Screen, CompareResult } from './types'

// Client-side screenshot comparison using the browser Canvas API. Replaces the
// former server-side `sharp` pipeline (native, can't run on Cloudflare Workers).
// The browser decodes/resizes every image format natively; pixelmatch (pure JS)
// does the pixel diff. Runs only in the browser (uses document/Image/canvas).

function loadImage(base64: string, mime: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to decode image'))
    img.src = `data:${mime};base64,${base64}`
  })
}

// Decode + resize an image to (w×h) and return its RGBA pixel data.
async function toRGBA(base64: string, mime: string, w: number, h: number): Promise<Uint8ClampedArray> {
  const img = await loadImage(base64, mime)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(img, 0, 0, w, h) // fit: fill (stretch to target dims)
  return ctx.getImageData(0, 0, w, h).data
}

// Read an image file's natural dimensions in the browser (was sharp metadata()).
export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to read image dimensions'))
    }
    img.src = url
  })
}

export async function compareScreenshots(a: Screen, b: Screen): Promise<CompareResult> {
  const width = Math.min(a.width, b.width, 1920)
  const height = Math.min(a.height, b.height, 1080)

  const [dataA, dataB] = await Promise.all([
    toRGBA(a.screenshotBase64, a.mimeType, width, height),
    toRGBA(b.screenshotBase64, b.mimeType, width, height),
  ])

  const diff = new Uint8ClampedArray(width * height * 4)
  const diffPixels = pixelmatch(dataA, dataB, diff, width, height, {
    threshold: 0.1,
    includeAA: false,
  })

  const totalPixels = width * height
  const diffPercent = (diffPixels / totalPixels) * 100
  const syncScore = Math.max(0, Math.round(100 - diffPercent))

  // Render the diff to a PNG data URL, then keep just the base64 payload.
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.putImageData(new ImageData(diff, width, height), 0, 0)
  const diffImageBase64 = canvas.toDataURL('image/png').split(',')[1] ?? ''

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
