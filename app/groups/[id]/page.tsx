'use client'

import { useState, useEffect, use } from 'react'
import type { ScreenGroup } from '@/lib/types'

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

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [group, setGroup] = useState<ScreenGroup | null>(null)
  const [screens, setScreens] = useState<ScreenMeta[]>([])
  const [screenName, setScreenName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState<ReportMeta | null>(null)

  async function load() {
    const [groupRes, screensRes] = await Promise.all([
      fetch(`/api/groups`),
      fetch(`/api/groups/${id}/screens`),
    ])
    const allGroups = (await groupRes.json()) as ScreenGroup[]
    const foundGroup = allGroups.find(g => g.id === id)
    if (foundGroup) setGroup(foundGroup)
    setScreens((await screensRes.json()) as ScreenMeta[])
  }

  useEffect(() => { load() }, [id])

  async function uploadScreen(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !screenName.trim() || uploading) return
    setUploading(true)
    const form = new FormData()
    form.append('name', screenName)
    form.append('screenshot', file)
    await fetch(`/api/groups/${id}/screens`, { method: 'POST', body: form })
    setScreenName('')
    setFile(null)
    await load()
    setUploading(false)
  }

  async function analyze() {
    if (analyzing || screens.length < 2) return
    setAnalyzing(true)
    const res = await fetch(`/api/groups/${id}/analyze`, { method: 'POST' })
    const data = (await res.json()) as ReportMeta
    setReport(data)
    setAnalyzing(false)
  }

  const scoreColor = report
    ? report.syncScore >= 90 ? 'text-emerald-400'
      : report.syncScore >= 70 ? 'text-yellow-400'
      : 'text-red-400'
    : ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <a href="/groups" className="text-gray-500 hover:text-gray-300 text-sm">← Groups</a>
      <h1 className="text-2xl font-bold mt-2 mb-6">{group?.name ?? 'Loading…'}</h1>

      {/* Upload screen */}
      <form onSubmit={uploadScreen} className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="text-sm font-medium text-gray-300 mb-3">Add screen</div>
        <div className="flex flex-col gap-3">
          <input
            value={screenName}
            onChange={e => setScreenName(e.target.value)}
            placeholder="Screen name (e.g. Screen A)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
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

      {/* Screens list */}
      {screens.length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">{screens.length} screens</div>
          <div className="grid grid-cols-2 gap-3">
            {screens.map(s => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                <div className="font-medium text-sm text-gray-200">{s.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{s.width}x{s.height}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={analyze}
        disabled={screens.length < 2 || analyzing}
        className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition mb-6"
      >
        {analyzing ? 'Analyzing…' : screens.length < 2 ? 'Add at least 2 screens to analyze' : 'Run sync analysis'}
      </button>

      {/* Report */}
      {report && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-200">Sync Report</div>
            <div className={`text-3xl font-bold ${scoreColor}`}>{report.syncScore}%</div>
          </div>
          {report.outliers.length > 0 && (
            <div className="mb-3 text-sm text-yellow-400">
              Outlier screens: {report.outliers.join(', ')}
            </div>
          )}
          <div className="text-sm text-gray-400 leading-relaxed">{report.aiAnalysis}</div>
          <a
            href={`/reports/${report.id}`}
            className="inline-block mt-4 text-xs text-cyan-400 hover:text-cyan-300"
          >
            View full report →
          </a>
        </div>
      )}
    </div>
  )
}
