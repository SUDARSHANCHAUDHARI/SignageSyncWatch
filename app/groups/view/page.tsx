'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ScreenGroup, Screen, CompareResult } from '@/lib/types'
import { compareScreenshots, readImageDimensions } from '@/lib/compareClient'
import ApiKeySettings from '@/components/ApiKeySettings'
import { getAiHeaders } from '@/lib/apiKey'

interface ScreenMeta {
  id: string
  name: string
  width: number
  height: number
  uploadedAt: string
}

interface ReportMeta {
  id: string
  syncScore: number
  outliers: string[]
  aiAnalysis: string
  createdAt: string
}

function GroupDetailView() {
  const id = useSearchParams().get('id') ?? ''
  const [group, setGroup] = useState<ScreenGroup | null>(null)
  const [screens, setScreens] = useState<ScreenMeta[]>([])
  const [screenName, setScreenName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState<ReportMeta | null>(null)
  const [error, setError] = useState('')

  async function load() {
    const [groupRes, screensRes] = await Promise.all([
      fetch(`/api/groups`),
      fetch(`/api/groups/${id}/screens`),
    ])
    const allGroups = (await groupRes.json()) as ScreenGroup[]
    const foundGroup = allGroups.find((g) => g.id === id)
    if (foundGroup) setGroup(foundGroup)
    setScreens((await screensRes.json()) as ScreenMeta[])
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  async function uploadScreen(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !screenName.trim() || uploading) return
    setUploading(true)
    setError('')
    try {
      // Dimensions read in the browser (replaces server-side sharp metadata).
      const { width, height } = await readImageDimensions(file)
      const form = new FormData()
      form.append('name', screenName)
      form.append('screenshot', file)
      form.append('width', String(width))
      form.append('height', String(height))
      await fetch(`/api/groups/${id}/screens`, { method: 'POST', body: form })
      setScreenName('')
      setFile(null)
      await load()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function analyze() {
    if (analyzing || screens.length < 2) return
    setAnalyzing(true)
    setError('')
    try {
      // Pull full screenshots and compare every pair in the browser (Canvas).
      const full = (await fetch(`/api/groups/${id}/screens?full=1`).then((r) => r.json())) as Screen[]
      if (full.length < 2) {
        setError('At least 2 screens required to compare')
        return
      }

      const comparisons: CompareResult[] = []
      for (let i = 0; i < full.length; i++) {
        for (let j = i + 1; j < full.length; j++) {
          comparisons.push(await compareScreenshots(full[i], full[j]))
        }
      }

      const syncScore = Math.round(
        comparisons.reduce((sum, c) => sum + c.syncScore, 0) / comparisons.length,
      )

      const screenScores: Record<string, number[]> = {}
      for (const c of comparisons) {
        ;(screenScores[c.screenA.id] ??= []).push(c.syncScore)
        ;(screenScores[c.screenB.id] ??= []).push(c.syncScore)
      }
      const outliers: string[] = []
      for (const [screenId, scores] of Object.entries(screenScores)) {
        const avg = scores.reduce((s, v) => s + v, 0) / scores.length
        if (avg < 70) {
          const screen = full.find((s) => s.id === screenId)
          if (screen) outliers.push(screen.name)
        }
      }

      const sortedByScore = [...comparisons].sort((a, b) => a.syncScore - b.syncScore)
      const worst = sortedByScore[0]
      const summary = [
        `Group: ${group?.name ?? ''}`,
        `Screens: ${full.map((s) => s.name).join(', ')}`,
        `Comparisons: ${comparisons.length}`,
        `Overall sync score: ${syncScore}%`,
        `Outlier screens: ${outliers.length > 0 ? outliers.join(', ') : 'None'}`,
        `Worst pair: ${worst ? `${worst.screenA.name} vs ${worst.screenB.name} (${worst.syncScore}%)` : 'N/A'}`,
      ].join('\n')

      const res = await fetch(`/api/groups/${id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAiHeaders() },
        body: JSON.stringify({ comparisons, syncScore, outliers, summary }),
      })
      const data = (await res.json()) as ReportMeta & { error?: string }
      if (data.error) setError(data.error)
      else setReport(data)
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const scoreColor = report
    ? report.syncScore >= 90
      ? 'text-emerald-400'
      : report.syncScore >= 70
        ? 'text-yellow-400'
        : 'text-red-400'
    : ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <a href="/groups" className="text-gray-500 hover:text-gray-300 text-sm">← Groups</a>
        <ApiKeySettings />
      </div>
      <h1 className="text-2xl font-bold mt-2 mb-6">{group?.name ?? 'Loading…'}</h1>

      <form onSubmit={uploadScreen} className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="text-sm font-medium text-gray-300 mb-3">Add screen</div>
        <div className="flex flex-col gap-3">
          <input
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            placeholder="Screen name (e.g. Screen A)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
          />
          <button
            type="submit"
            disabled={!file || !screenName.trim() || uploading}
            className="self-start px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg text-sm font-medium transition"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>

      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

      {screens.length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">{screens.length} screens</div>
          <div className="grid grid-cols-2 gap-3">
            {screens.map((s) => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                <div className="font-medium text-sm text-gray-200">{s.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{s.width}x{s.height}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={analyze}
        disabled={screens.length < 2 || analyzing}
        className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition mb-6"
      >
        {analyzing ? 'Analyzing…' : screens.length < 2 ? 'Add at least 2 screens to analyze' : 'Run sync analysis'}
      </button>

      {report && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-200">Sync Report</div>
            <div className={`text-3xl font-bold ${scoreColor}`}>{report.syncScore}%</div>
          </div>
          {report.outliers.length > 0 && (
            <div className="mb-3 text-sm text-yellow-400">Outlier screens: {report.outliers.join(', ')}</div>
          )}
          <div className="text-sm text-gray-400 leading-relaxed">{report.aiAnalysis}</div>
          <a href={`/reports/view?id=${report.id}`} className="inline-block mt-4 text-xs text-cyan-400 hover:text-cyan-300">
            View full report →
          </a>
        </div>
      )}
    </div>
  )
}

export default function GroupDetailPage() {
  return (
    <Suspense>
      <GroupDetailView />
    </Suspense>
  )
}
