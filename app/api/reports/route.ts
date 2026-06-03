import { NextResponse } from 'next/server'
import { listReports } from '@/lib/store'

export async function GET() {
  const reports = (await listReports()).map(r => ({
    ...r,
    screens: r.screens.map(s => ({ ...s, screenshotBase64: '[omitted]' })),
    comparisons: r.comparisons.map(c => ({ ...c, diffImageBase64: '[omitted]' })),
  }))
  return NextResponse.json(reports)
}
