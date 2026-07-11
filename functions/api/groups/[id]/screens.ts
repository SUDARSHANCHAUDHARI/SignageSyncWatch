// Cloudflare Pages Function — serves POST + GET /api/groups/:id/screens.
// Image dimensions are supplied by the client (browser Image API) instead of
// sharp; the screenshot is stored as base64 (no server-side image processing).
import { nanoid } from 'nanoid'
import { KVSyncRepository, type KVNamespaceLike } from '../../../../lib/storage/kv'
import type { Screen } from '../../../../lib/types'

const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024
const ACCEPTED_SCREENSHOT_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

type Ctx = { request: Request; params: { id: string }; env: { SIGNAGE_KV: KVNamespaceLike } }

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  try {
    const groupId = context.params.id
    const repo = new KVSyncRepository(context.env.SIGNAGE_KV)
    if (!(await repo.getGroup(groupId))) {
      return json({ error: 'Group not found' }, 404)
    }

    const formData = await context.request.formData()
    const name = formData.get('name') as string | null
    const file = formData.get('screenshot') as File | null
    const width = Number(formData.get('width')) || 1920
    const height = Number(formData.get('height')) || 1080

    if (!name || !file) return json({ error: 'name and screenshot are required' }, 400)
    if (!ACCEPTED_SCREENSHOT_TYPES.has(file.type)) return json({ error: 'screenshot must be PNG, JPEG, or WebP' }, 400)
    if (file.size > MAX_SCREENSHOT_BYTES) return json({ error: 'screenshot must be 10MB or smaller' }, 413)

    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')

    const screen: Screen = {
      id: nanoid(),
      groupId,
      name: name.trim(),
      screenshotBase64: base64,
      mimeType: file.type,
      width,
      height,
      uploadedAt: new Date().toISOString(),
    }
    await repo.addScreen(screen)

    return json({ ...screen, screenshotBase64: '[omitted]' }, 201)
  } catch (error) {
    console.error('POST /api/groups/[id]/screens error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
}

export const onRequestGet = async (context: Ctx): Promise<Response> => {
  const groupId = context.params.id
  const full = new URL(context.request.url).searchParams.get('full') === '1'
  const screens = await new KVSyncRepository(context.env.SIGNAGE_KV).getScreens(groupId)
  const out = full ? screens : screens.map((s) => ({ ...s, screenshotBase64: '[omitted]' }))
  return json(out)
}
