'use client'

import { useState, useEffect } from 'react'
import type { ScreenGroup } from '@/lib/types'

export default function GroupsPage() {
  const [groups, setGroups] = useState<ScreenGroup[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  async function loadGroups() {
    const res = await fetch('/api/groups')
    const data = (await res.json()) as ScreenGroup[]
    setGroups(data)
  }

  useEffect(() => { loadGroups() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || creating) return
    setCreating(true)
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    setName('')
    setDescription('')
    await loadGroups()
    setCreating(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Screen Groups</h1>

      <form onSubmit={create} className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
        <div className="text-sm font-medium text-gray-300 mb-3">Create new group</div>
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Group name (e.g. Lobby Screens)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={!name.trim() || creating}
            className="self-start px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg text-sm font-medium transition"
          >
            {creating ? 'Creating…' : 'Create group'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {groups.length === 0 && (
          <div className="text-gray-600 text-sm text-center py-10">No groups yet.</div>
        )}
        {groups.map(g => (
          <a
            key={g.id}
            href={`/groups/${g.id}`}
            className="block bg-gray-900 border border-gray-800 hover:border-emerald-700 rounded-xl p-4 transition"
          >
            <div className="font-medium text-gray-200">{g.name}</div>
            {g.description && <div className="text-gray-500 text-sm mt-0.5">{g.description}</div>}
            <div className="text-gray-700 text-xs mt-2">{new Date(g.updatedAt).toLocaleString()}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
