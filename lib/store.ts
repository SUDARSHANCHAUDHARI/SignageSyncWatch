import type { ScreenGroup, Screen, SyncReport } from './types'
import { getSyncRepository } from './storage'

export async function createGroup(group: ScreenGroup): Promise<void> {
  await getSyncRepository().createGroup(group)
}

export async function getGroup(id: string): Promise<ScreenGroup | undefined> {
  return getSyncRepository().getGroup(id)
}

export async function listGroups(): Promise<ScreenGroup[]> {
  return getSyncRepository().listGroups()
}

export async function addScreen(screen: Screen): Promise<void> {
  await getSyncRepository().addScreen(screen)
}

export async function getScreens(groupId: string): Promise<Screen[]> {
  return getSyncRepository().getScreens(groupId)
}

export async function saveReport(report: SyncReport): Promise<void> {
  await getSyncRepository().saveReport(report)
}

export async function getReport(id: string): Promise<SyncReport | undefined> {
  return getSyncRepository().getReport(id)
}

export async function listReports(): Promise<SyncReport[]> {
  return getSyncRepository().listReports()
}
