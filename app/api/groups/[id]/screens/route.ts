import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { addScreen, getGroup, getScreens } from '@/lib/store'
import type { Screen } from '@/lib/types'
import sharp from 'sharp'

const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024
const ACCEPTED_SCREENSHOT_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params
    if (!await getGroup(groupId)) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string | null
    const file = formData.get('screenshot') as File | null

    if (!name || !file) {
      return NextResponse.json({ error: 'name and screenshot are required' }, { status: 400 })
    }
    if (!ACCEPTED_SCREENSHOT_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'screenshot must be PNG, JPEG, or WebP' }, { status: 400 })
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      return NextResponse.json({ error: 'screenshot must be 10MB or smaller' }, { status: 413 })
    }

    const buffer = await file.arrayBuffer()
    const meta = await sharp(Buffer.from(buffer)).metadata()
    const base64 = Buffer.from(buffer).toString('base64')

    const screen: Screen = {
      id: nanoid(),
      groupId,
      name: name.trim(),
      screenshotBase64: base64,
      mimeType: file.type,
      width: meta.width ?? 1920,
      height: meta.height ?? 1080,
      uploadedAt: new Date().toISOString(),
    }
    await addScreen(screen)

    return NextResponse.json({ ...screen, screenshotBase64: '[omitted]' }, { status: 201 })
  } catch (error) {
    console.error('POST /api/groups/[id]/screens error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const list = (await getScreens(groupId)).map(s => ({ ...s, screenshotBase64: '[omitted]' }))
  return NextResponse.json(list)
}
