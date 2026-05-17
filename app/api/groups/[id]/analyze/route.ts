import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { getGroup, getScreens, saveReport } from '@/lib/store'
import { compareScreenshots } from '@/lib/compare'
import { chat } from '@/lib/ai'
import type { SyncReport, CompareResult } from '@/lib/types'

const SYSTEM_PROMPT = `You are a digital signage synchronization expert. Given a sync analysis report with scores, diff percentages, and outlier screens, write a concise 2-3 sentence summary explaining the sync health and what needs attention. Be practical and direct.`

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params
    const group = getGroup(groupId)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    const screens = getScreens(groupId)
    if (screens.length < 2) {
      return NextResponse.json({ error: 'At least 2 screens required to compare' }, { status: 400 })
    }

    // Compare all pairs
    const comparisons: CompareResult[] = []
    for (let i = 0; i < screens.length; i++) {
      for (let j = i + 1; j < screens.length; j++) {
        const result = await compareScreenshots(screens[i]!, screens[j]!)
        comparisons.push(result)
      }
    }

    // Overall sync score: average of all pair scores
    const syncScore = Math.round(
      comparisons.reduce((sum, c) => sum + c.syncScore, 0) / comparisons.length
    )

    // Outlier detection: screens that appear in many low-score comparisons
    const screenScores: Record<string, number[]> = {}
    for (const c of comparisons) {
      const a = c.screenA.id
      const b = c.screenB.id
      if (!screenScores[a]) screenScores[a] = []
      if (!screenScores[b]) screenScores[b] = []
      screenScores[a].push(c.syncScore)
      screenScores[b].push(c.syncScore)
    }

    const outliers: string[] = []
    for (const [screenId, scores] of Object.entries(screenScores)) {
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length
      if (avg < 70) {
        const screen = screens.find(s => s.id === screenId)
        if (screen) outliers.push(screen.name)
      }
    }

    // Build text summary
    const summaryText = [
      `Group: ${group.name}`,
      `Screens: ${screens.map(s => s.name).join(', ')}`,
      `Comparisons: ${comparisons.length}`,
      `Overall sync score: ${syncScore}%`,
      `Outlier screens: ${outliers.length > 0 ? outliers.join(', ') : 'None'}`,
      `Worst pair: ${
        comparisons.length > 0
          ? `${comparisons.sort((a, b) => a.syncScore - b.syncScore)[0]?.screenA.name} vs ${comparisons[0]?.screenB.name} (${comparisons[0]?.syncScore}%)`
          : 'N/A'
      }`,
    ].join('\n')

    let aiAnalysis = ''
    try {
      aiAnalysis = await chat(SYSTEM_PROMPT, summaryText)
    } catch {
      aiAnalysis = syncScore >= 90
        ? 'All screens are well synchronized. No action required.'
        : `Sync score is ${syncScore}%. ${outliers.length > 0 ? `Screens ${outliers.join(', ')} may have drift issues.` : 'Review diff images for details.'}`
    }

    const report: SyncReport = {
      id: nanoid(),
      groupId,
      groupName: group.name,
      screens,
      comparisons,
      syncScore,
      outliers,
      summary: summaryText,
      aiAnalysis,
      createdAt: new Date().toISOString(),
    }
    saveReport(report)

    return NextResponse.json({
      ...report,
      screens: report.screens.map(s => ({ ...s, screenshotBase64: '[omitted]' })),
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/groups/[id]/analyze error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
