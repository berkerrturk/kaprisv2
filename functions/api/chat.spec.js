import { afterEach, describe, expect, it, vi } from 'vitest'
import { onRequest } from './chat.js'

function postRequest(messages) {
  return new Request('https://alvya.example/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
}

describe('Cloudflare chat function', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('does not accept chat requests without a server-side API key', async () => {
    const response = await onRequest({
      request: postRequest([{ role: 'user', content: 'Sade bir yüzük' }]),
      env: {},
    })

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('API anahtarı'),
    })
  })

  it('returns the assistant reply without storing the conversation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output: [
            {
              content: [{ type: 'output_text', text: 'Bütçe aralığın nedir?' }],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await onRequest({
      request: postRequest([{ role: 'user', content: 'Sade bir yüzük' }]),
      env: { OPENAI_API_KEY: 'test-key', OPENAI_CHAT_MODEL: 'test-model' },
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      reply: 'Bütçe aralığın nedir?',
    })
    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(requestBody).toMatchObject({ model: 'test-model', store: false })
  })
})
