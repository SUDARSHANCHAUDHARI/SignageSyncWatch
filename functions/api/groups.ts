// Cloudflare Pages Function — serves POST + GET /api/groups.
import { nanoid } from 'nanoid'
import { KVSyncRepository, type KVNamespaceLike } from '../../lib/storage/kv'
import type { ScreenGroup } from '../../lib/types'

type Ctx = { request: Request; env: { SIGNAGE_KV: KVNamespaceLike } }

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  try {
    const { name, description } = (await context.request.json()) as { name: string; description?: string }
    if (!name) return json({ error: 'name is required' }, 400)

    const group: ScreenGroup = {
      id: nanoid(),
      name: name.trim(),
      description: description?.trim() ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await new KVSyncRepository(context.env.SIGNAGE_KV).createGroup(group)
    return json(group, 201)
  } catch (error) {
    console.error('POST /api/groups error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
}

export const onRequestGet = async (context: Ctx): Promise<Response> => {
  const groups = await new KVSyncRepository(context.env.SIGNAGE_KV).listGroups()
  return json(groups)
}
