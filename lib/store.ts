import type { ScreenGroup, Screen, SyncReport } from './types'

const groups = new Map<string, ScreenGroup>()
const screens = new Map<string, Screen[]>()
const reports = new Map<string, SyncReport>()

export function createGroup(group: ScreenGroup): void {
  groups.set(group.id, group)
  screens.set(group.id, [])
}

export function getGroup(id: string): ScreenGroup | undefined {
  return groups.get(id)
}

export function listGroups(): ScreenGroup[] {
  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function addScreen(screen: Screen): void {
  const list = screens.get(screen.groupId) ?? []
  list.push(screen)
  screens.set(screen.groupId, list)
  const group = groups.get(screen.groupId)
  if (group) {
    group.updatedAt = new Date().toISOString()
  }
}

export function getScreens(groupId: string): Screen[] {
  return screens.get(groupId) ?? []
}

export function saveReport(report: SyncReport): void {
  reports.set(report.id, report)
}

export function getReport(id: string): SyncReport | undefined {
  return reports.get(id)
}

export function listReports(): SyncReport[] {
  return Array.from(reports.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
