import { FileSyncRepository } from './file'
import { MemorySyncRepository } from './memory'
import type { SyncRepository } from './types'

const repository: SyncRepository =
  process.env.SIGNAGE_STORAGE_DRIVER === 'memory'
    ? new MemorySyncRepository()
    : new FileSyncRepository()

export function getSyncRepository(): SyncRepository {
  return repository
}
