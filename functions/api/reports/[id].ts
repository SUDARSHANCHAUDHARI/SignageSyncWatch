// Cloudflare Pages Function — serves GET /api/reports/:id.
// Returns the full report including diff images (the list endpoint omits them).
import { KVSyncRepository, type KVNamespaceLike } from '../../../lib/storage/kv'

export const onRequestGet = async (context: {
  params: { id: string }
  env: { SIGNAGE_KV: KVNamespaceLike }
}): Promise<Response> => {
  const report = await new KVSyncRepository(context.env.SIGNAGE_KV).getReport(context.params.id)
  if (!report) {
    return new Response(JSON.stringify({ error: 'Report not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  }
  // Screenshots aren't needed by the detail view; keep diff images.
  const out = { ...report, screens: report.screens.map((s) => ({ ...s, screenshotBase64: '[omitted]' })) }
  return new Response(JSON.stringify(out), {
    headers: { 'content-type': 'application/json' },
  })
}
