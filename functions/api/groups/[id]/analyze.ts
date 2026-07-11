// Cloudflare Pages Function — serves POST /api/groups/:id/analyze.
// Image comparison now happens in the browser (Canvas); this Function receives
// the client-computed comparisons, writes the AI summary (BYOK), and saves the
// report to KV. No server-side image processing.
import { nanoid } from 'nanoid'
import { chat, type AIProvider } from '../../../../lib/ai'
import { KVSyncRepository, type KVNamespaceLike } from '../../../../lib/storage/kv'
import type { SyncReport, CompareResult } from '../../../../lib/types'

const SYSTEM_PROMPT = `You are a digital signage synchronization expert. Given a sync analysis report with scores, diff percentages, and outlier screens, write a concise 2-3 sentence summary explaining the sync health and what needs attention. Be practical and direct.`

type Ctx = { request: Request; params: { id: string }; env: { SIGNAGE_KV: KVNamespaceLike } }

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

interface AnalyzeBody {
  comparisons: CompareResult[]
  syncScore: number
  outliers: string[]
  summary: string
}

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  try {
    const groupId = context.params.id
    const apiKey = context.request.headers.get('x-api-key') ?? ''
    const provider: AIProvider = context.request.headers.get('x-ai-provider') === 'openai' ? 'openai' : 'claude'

    const repo = new KVSyncRepository(context.env.SIGNAGE_KV)
    const group = await repo.getGroup(groupId)
    if (!group) return json({ error: 'Group not found' }, 404)

    const body = (await context.request.json()) as AnalyzeBody
    if (!Array.isArray(body.comparisons) || body.comparisons.length === 0) {
      return json({ error: 'comparisons are required' }, 400)
    }

    let aiAnalysis = ''
    try {
      aiAnalysis = await chat(SYSTEM_PROMPT, body.summary, { provider, apiKey })
    } catch {
      aiAnalysis =
        body.syncScore >= 90
          ? 'All screens are well synchronized. No action required.'
          : `Sync score is ${body.syncScore}%. ${body.outliers.length > 0 ? `Screens ${body.outliers.join(', ')} may have drift issues.` : 'Review diff images for details.'}`
    }

    // Screen metadata for the report (no raw screenshots kept in the report).
    const screens = (await repo.getScreens(groupId)).map((s) => ({ ...s, screenshotBase64: '' }))
    // Keep diff images, drop the source screenshots inside each comparison to bound size.
    const comparisons = body.comparisons.map((c) => ({
      ...c,
      screenA: { ...c.screenA, screenshotBase64: '' },
      screenB: { ...c.screenB, screenshotBase64: '' },
    }))

    const report: SyncReport = {
      id: nanoid(),
      groupId,
      groupName: group.name,
      screens,
      comparisons,
      syncScore: body.syncScore,
      outliers: body.outliers,
      summary: body.summary,
      aiAnalysis,
      createdAt: new Date().toISOString(),
    }
    await repo.saveReport(report)

    return json(
      { ...report, screens: report.screens.map((s) => ({ ...s, screenshotBase64: '[omitted]' })) },
      201,
    )
  } catch (error) {
    console.error('POST /api/groups/[id]/analyze error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
}
