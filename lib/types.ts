export interface ScreenGroup {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Screen {
  id: string
  groupId: string
  name: string
  screenshotBase64: string
  mimeType: string
  width: number
  height: number
  uploadedAt: string
}

export interface CompareResult {
  screenA: Screen
  screenB: Screen
  diffPixels: number
  totalPixels: number
  diffPercent: number
  syncScore: number
  diffImageBase64: string
}

export interface SyncReport {
  id: string
  groupId: string
  groupName: string
  screens: Screen[]
  comparisons: CompareResult[]
  syncScore: number
  outliers: string[]
  summary: string
  aiAnalysis: string
  createdAt: string
}
