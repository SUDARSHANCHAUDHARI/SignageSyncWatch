import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { ScreenGroup, Screen, SyncReport } from '../types'
import type { SyncRepository } from './types'

interface SyncStore {
  groups: ScreenGroup[]
  screens: Screen[]
  reports: SyncReport[]
}

const emptyStore: SyncStore = {
  groups: [],
  screens: [],
  reports: [],
}

export class FileSyncRepository implements SyncRepository {
  private readonly filePath: string
  private writeQueue = Promise.resolve()

  constructor(dataDir = process.env.SIGNAGE_DATA_DIR ?? join(process.cwd(), '.signage-data')) {
    this.filePath = join(dataDir, 'sync-watch.json')
  }

  async createGroup(group: ScreenGroup): Promise<void> {
    await this.withWriteLock(async () => {
      const store = await this.readStore()
      const groups = new Map(store.groups.map(item => [item.id, item]))
      groups.set(group.id, group)
      await this.writeStore({ ...store, groups: Array.from(groups.values()) })
    })
  }

  async getGroup(id: string): Promise<ScreenGroup | undefined> {
    return (await this.readStore()).groups.find(group => group.id === id)
  }

  async listGroups(): Promise<ScreenGroup[]> {
    return (await this.readStore()).groups.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async addScreen(screen: Screen): Promise<void> {
    await this.withWriteLock(async () => {
      const store = await this.readStore()
      const groups = store.groups.map(group =>
        group.id === screen.groupId ? { ...group, updatedAt: new Date().toISOString() } : group
      )
      await this.writeStore({ ...store, groups, screens: [...store.screens, screen] })
    })
  }

  async getScreens(groupId: string): Promise<Screen[]> {
    return (await this.readStore()).screens.filter(screen => screen.groupId === groupId)
  }

  async saveReport(report: SyncReport): Promise<void> {
    await this.withWriteLock(async () => {
      const store = await this.readStore()
      const reports = new Map(store.reports.map(item => [item.id, item]))
      reports.set(report.id, report)
      await this.writeStore({ ...store, reports: Array.from(reports.values()) })
    })
  }

  async getReport(id: string): Promise<SyncReport | undefined> {
    return (await this.readStore()).reports.find(report => report.id === id)
  }

  async listReports(): Promise<SyncReport[]> {
    return (await this.readStore()).reports.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  private async readStore(): Promise<SyncStore> {
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw) as Partial<SyncStore>
      return {
        groups: Array.isArray(parsed.groups) ? parsed.groups : [],
        screens: Array.isArray(parsed.screens) ? parsed.screens : [],
        reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyStore
      throw error
    }
  }

  private async writeStore(store: SyncStore): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    const tempPath = `${this.filePath}.tmp`
    await writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
    await rename(tempPath, this.filePath)
  }

  private async withWriteLock(operation: () => Promise<void>): Promise<void> {
    this.writeQueue = this.writeQueue.then(operation, operation)
    return this.writeQueue
  }
}
