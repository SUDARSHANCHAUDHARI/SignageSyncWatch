'use client'

import { useState, useEffect, use } from 'react'

interface ComparisonSummary {
  screenA: { name: string }
  screenB: { name: string }
  diffPixels: number
  totalPixels: number
  diffPercent: number
  syncScore: number
  diffImageBase64: string
}

interface ReportDetail {
  id: string
  groupName: string
  syncScore: number
  outliers: string[]
  aiAnalysis: string
  comparisons: ComparisonSummary[]
  createdAt: string
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [report, setReport] = useState<ReportDetail | null>(null)

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then((data: ReportDetail[]) => {
        const found = data.find(r => r.id === id)
        if (found) setReport(found)
      })
  }, [id])

  if (!report) return <div className="p-10 text-gray-600 text-sm text-center">Loading…</div>

  const scoreColor = report.syncScore >= 90 ? 'text-emerald-400'
    : report.syncScore >= 70 ? 'text-yellow-400'
    : 'text-red-400'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <a href="/reports" className="text-gray-500 hover:text-gray-300 text-sm">← Reports</a>

      <div className="flex items-center gap-4 mt-3 mb-8">
        <h1 className="text-2xl font-bold">{report.groupName}</h1>
        <div className={`text-4xl font-bold ${scoreColor}`}>{report.syncScore}%</div>
      </div>

      {report.outliers.length > 0 && (
        <div className="bg-yellow-950 border border-yellow-800 rounded-xl px-4 py-3 mb-6 text-yellow-400 text-sm">
          Outlier screens detected: <strong>{report.outliers.join(', ')}</strong>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
        <div className="text-sm font-medium text-gray-300 mb-2">AI Analysis</div>
        <div className="text-sm text-gray-400 leading-relaxed">{report.aiAnalysis}</div>
      </div>

      <div className="text-sm font-medium text-gray-300 mb-4">Pairwise Comparisons ({report.comparisons.length})</div>
      <div className="space-y-6">
        {report.comparisons.map((c, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-200">
                {c.screenA.name} vs {c.screenB.name}
              </div>
              <div className={`text-lg font-bold ${
                c.syncScore >= 90 ? 'text-emerald-400' : c.syncScore >= 70 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {c.syncScore}%
              </div>
            </div>
            <div className="text-xs text-gray-600 mb-3">
              {c.diffPixels.toLocaleString()} px diff / {c.totalPixels.toLocaleString()} total ({c.diffPercent}%)
            </div>
            {c.diffImageBase64 && (
              <img
                src={`data:image/png;base64,${c.diffImageBase64}`}
                alt="Diff"
                className="w-full rounded-lg border border-gray-700 max-h-64 object-contain bg-black"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
