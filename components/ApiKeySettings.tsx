'use client'

import { useEffect, useState } from 'react'
import {
  getApiKey,
  getProvider,
  setApiKey,
  setProvider,
  clearApiKey,
  type Provider,
} from '@/lib/apiKey'

// Self-contained "bring your own API key" control: a button + modal.
// The key is stored only in the browser (localStorage) and never sent to our server for storage.
export default function ApiKeySettings() {
  const [open, setOpen] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [provider, setProviderState] = useState<Provider>('claude')
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setHasKey(!!getApiKey())
    setProviderState(getProvider())
    setDraft(getApiKey())
  }, [])

  function save() {
    const trimmed = draft.trim()
    setApiKey(trimmed)
    setProvider(provider)
    setHasKey(!!trimmed)
    setOpen(false)
  }

  function clear() {
    clearApiKey()
    setDraft('')
    setHasKey(false)
  }

  return (
    <>
      <button
        onClick={() => { setDraft(getApiKey()); setProviderState(getProvider()); setOpen(true) }}
        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:border-indigo-500/60 hover:text-white transition-colors"
      >
        {hasKey ? '⚙ Key set' : '⚙ Add API key'}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setOpen(false)}>
          <div
            className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-lg font-semibold text-gray-100 mb-1">API key</div>
            <p className="text-sm text-gray-500 mb-4">
              This app uses your own API key. It is stored only in this browser and sent directly with your requests — never saved on the server.
            </p>

            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Provider</label>
            <div className="flex gap-2 mb-4">
              {(['claude', 'openai'] as Provider[]).map(p => (
                <button
                  key={p}
                  onClick={() => setProviderState(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    provider === p
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  {p === 'claude' ? 'Claude (Anthropic)' : 'OpenAI'}
                </button>
              ))}
            </div>

            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
              {provider === 'claude' ? 'Anthropic API key' : 'OpenAI API key'}
            </label>
            <input
              type="password"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={!draft.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition"
              >
                Save
              </button>
              {hasKey && (
                <button
                  onClick={clear}
                  className="px-4 py-2.5 border border-white/10 text-gray-300 hover:border-red-700 hover:text-red-300 rounded-xl text-sm font-medium transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
