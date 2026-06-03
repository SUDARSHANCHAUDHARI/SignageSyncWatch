import { MemorySyncRepository } from './memory'
import type { SyncRepository } from './types'

const repository: SyncRepository = new MemorySyncRepository()

export function getSyncRepository(): SyncRepository {
  return repository
}
