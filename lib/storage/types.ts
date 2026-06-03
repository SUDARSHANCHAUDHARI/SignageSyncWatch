import type { ScreenGroup, Screen, SyncReport } from '../types'

export interface SyncRepository {
  createGroup(group: ScreenGroup): Promise<void>
  getGroup(id: string): Promise<ScreenGroup | undefined>
  listGroups(): Promise<ScreenGroup[]>
  addScreen(screen: Screen): Promise<void>
  getScreens(groupId: string): Promise<Screen[]>
  saveReport(report: SyncReport): Promise<void>
  getReport(id: string): Promise<SyncReport | undefined>
  listReports(): Promise<SyncReport[]>
}
