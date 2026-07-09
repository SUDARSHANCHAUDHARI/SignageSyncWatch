export type AIProvider = 'claude' | 'openai'

export interface AICredentials {
  provider: AIProvider
  apiKey: string
}

export async function chat(
  systemPrompt: string,
  userMessage: string,
  credentials: AICredentials,
): Promise<string> {
  if (!credentials?.apiKey) throw new Error('Missing API key')

  if (credentials.provider === 'openai') {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: credentials.apiKey })
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })
    return res.choices[0]?.message?.content ?? ''
  }

  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: credentials.apiKey })
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  const block = res.content[0]
  return block?.type === 'text' ? block.text : ''
}
