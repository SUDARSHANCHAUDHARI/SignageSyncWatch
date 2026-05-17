'use client'

import { useState, useEffect } from 'react'

interface ReportSummary {
  id: string
  groupName: string
  syncScore: number
  outliers: string[]
  createdAt: string
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'text-emerald-400 bg-emerald-950 border-emerald-800'
    : score >= 70 ? 'text-yellow-400 bg-yellow-950 border-yellow-800'
    : 'text-red-400 bg-red-950 border-red-800'
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${color}`}>
      {score}%
    </span>
  )
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([])

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then((data: ReportSummary[]) => setReports(data))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Sync Reports</h1>
      {reports.length === 0 && (
        <div className="text-gray-600 text-sm text-center py-16">No reports yet. Run analysis on a group first.</div>
      )}
      <div className="space-y-3">
        {reports.map(r => (
          <a
            key={r.id}
            href={`/reports/${r.id}`}
            className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-cyan-700 rounded-xl px-5 py-4 transition"
          >
            <div>
              <div className="font-medium text-gray-200">{r.groupName}</div>
              {r.outliers.length > 0 && (
                <div className="text-xs text-yellow-500 mt-0.5">Outliers: {r.outliers.join(', ')}</div>
              )}
              <div className="text-gray-700 text-xs mt-1">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
            <ScoreBadge score={r.syncScore} />
          </a>
        ))}
      </div>
    </div>
  )
}
