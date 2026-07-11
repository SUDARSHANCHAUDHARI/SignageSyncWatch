import type { ScreenGroup, Screen, SyncReport } from '../types'
import type { SyncRepository } from './types'

// Minimal shape of a Cloudflare KV namespace — only the methods this driver uses.
// Declared locally so lib/ stays typecheckable without @cloudflare/workers-types.
export interface KVNamespaceLike {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>
}

const GROUP_PREFIX = 'group:'
const REPORT_PREFIX = 'report:'
const screenPrefix = (groupId: string) => `screen:${groupId}:`

/**
 * Cloudflare KV-backed sync store. Persists across requests/isolates.
 * Keys: group:<id>, screen:<groupId>:<screenId>, report:<id>.
 */
export class KVSyncRepository implements SyncRepository {
  constructor(private readonly kv: KVNamespaceLike) {}

  private async getJSON<T>(key: string): Promise<T | undefined> {
    const raw = await this.kv.get(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  }

  async createGroup(group: ScreenGroup): Promise<void> {
    await this.kv.put(`${GROUP_PREFIX}${group.id}`, JSON.stringify(group))
  }

  async getGroup(id: string): Promise<ScreenGroup | undefined> {
    return this.getJSON<ScreenGroup>(`${GROUP_PREFIX}${id}`)
  }

  async listGroups(): Promise<ScreenGroup[]> {
    const { keys } = await this.kv.list({ prefix: GROUP_PREFIX })
    const groups = await Promise.all(keys.map((k) => this.getJSON<ScreenGroup>(k.name)))
    return groups
      .filter((g): g is ScreenGroup => g !== undefined)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  async addScreen(screen: Screen): Promise<void> {
    await this.kv.put(`${screenPrefix(screen.groupId)}${screen.id}`, JSON.stringify(screen))
    const group = await this.getGroup(screen.groupId)
    if (group) {
      group.updatedAt = new Date().toISOString()
      await this.kv.put(`${GROUP_PREFIX}${group.id}`, JSON.stringify(group))
    }
  }

  async getScreens(groupId: string): Promise<Screen[]> {
    const { keys } = await this.kv.list({ prefix: screenPrefix(groupId) })
    const screens = await Promise.all(keys.map((k) => this.getJSON<Screen>(k.name)))
    return screens
      .filter((s): s is Screen => s !== undefined)
      .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())
  }

  async saveReport(report: SyncReport): Promise<void> {
    await this.kv.put(`${REPORT_PREFIX}${report.id}`, JSON.stringify(report))
  }

  async getReport(id: string): Promise<SyncReport | undefined> {
    return this.getJSON<SyncReport>(`${REPORT_PREFIX}${id}`)
  }

  async listReports(): Promise<SyncReport[]> {
    const { keys } = await this.kv.list({ prefix: REPORT_PREFIX })
    const reports = await Promise.all(keys.map((k) => this.getJSON<SyncReport>(k.name)))
    return reports
      .filter((r): r is SyncReport => r !== undefined)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}
