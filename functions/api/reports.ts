// Cloudflare Pages Function — serves GET /api/reports (list, base64 omitted).
import { KVSyncRepository, type KVNamespaceLike } from '../../lib/storage/kv'

export const onRequestGet = async (context: {
  env: { SIGNAGE_KV: KVNamespaceLike }
}): Promise<Response> => {
  const reports = (await new KVSyncRepository(context.env.SIGNAGE_KV).listReports()).map((r) => ({
    ...r,
    screens: r.screens.map((s) => ({ ...s, screenshotBase64: '[omitted]' })),
    comparisons: r.comparisons.map((c) => ({ ...c, diffImageBase64: '[omitted]' })),
  }))
  return new Response(JSON.stringify(reports), {
    headers: { 'content-type': 'application/json' },
  })
}
