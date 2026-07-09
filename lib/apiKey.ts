export type Provider = 'claude' | 'openai'

const KEY_STORAGE = 'signagesyncwatch_api_key'
const PROVIDER_STORAGE = 'signagesyncwatch_provider'

export function getApiKey(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(KEY_STORAGE) ?? ''
}

export function getProvider(): Provider {
  if (typeof window === 'undefined') return 'claude'
  return localStorage.getItem(PROVIDER_STORAGE) === 'openai' ? 'openai' : 'claude'
}

export function setApiKey(key: string): void {
  localStorage.setItem(KEY_STORAGE, key)
}

export function setProvider(provider: Provider): void {
  localStorage.setItem(PROVIDER_STORAGE, provider)
}

export function clearApiKey(): void {
  localStorage.removeItem(KEY_STORAGE)
}

// Headers to attach to any request that triggers an AI call.
export function getAiHeaders(): Record<string, string> {
  const key = getApiKey()
  return key ? { 'x-api-key': key, 'x-ai-provider': getProvider() } : {}
}
