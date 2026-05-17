import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { createGroup, listGroups } from '@/lib/store'
import type { ScreenGroup } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { name, description } = (await request.json()) as { name: string; description?: string }
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const group: ScreenGroup = {
      id: nanoid(),
      name: name.trim(),
      description: description?.trim() ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    createGroup(group)
    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('POST /api/groups error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(listGroups())
}
