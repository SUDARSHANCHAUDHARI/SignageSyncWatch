import type { ScreenGroup, Screen, SyncReport } from '../types'
import type { SyncRepository } from './types'

export class MemorySyncRepository implements SyncRepository {
  private readonly groups = new Map<string, ScreenGroup>()
  private readonly screens = new Map<string, Screen[]>()
  private readonly reports = new Map<string, SyncReport>()

  async createGroup(group: ScreenGroup): Promise<void> {
    this.groups.set(group.id, group)
    this.screens.set(group.id, [])
  }

  async getGroup(id: string): Promise<ScreenGroup | undefined> {
    return this.groups.get(id)
  }

  async listGroups(): Promise<ScreenGroup[]> {
    return Array.from(this.groups.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async addScreen(screen: Screen): Promise<void> {
    const list = this.screens.get(screen.groupId) ?? []
    list.push(screen)
    this.screens.set(screen.groupId, list)
    const group = this.groups.get(screen.groupId)
    if (group) {
      group.updatedAt = new Date().toISOString()
    }
  }

  async getScreens(groupId: string): Promise<Screen[]> {
    return this.screens.get(groupId) ?? []
  }

  async saveReport(report: SyncReport): Promise<void> {
    this.reports.set(report.id, report)
  }

  async getReport(id: string): Promise<SyncReport | undefined> {
    return this.reports.get(id)
  }

  async listReports(): Promise<SyncReport[]> {
    return Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
}
