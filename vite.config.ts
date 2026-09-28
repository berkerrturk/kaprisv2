import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

interface ApiRequest {
  method?: string
  [Symbol.asyncIterator](): AsyncIterableIterator<string | Uint8Array>
}

interface ApiResponse {
  statusCode: number
  setHeader(name: string, value: string): void
  end(body?: string): void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function sendJson(response: ApiResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

async function readJsonBody(request: ApiRequest) {
  const decoder = new TextDecoder()
  let rawBody = ''
  let size = 0
  for await (const chunk of request) {
    const text =
      typeof chunk === 'string'
        ? chunk
        : decoder.decode(chunk, { stream: true })
    size += text.length
    if (size > 32_000) throw new Error('İstek çok büyük.')
    rawBody += text
  }
  rawBody += decoder.decode()
  return JSON.parse(rawBody) as {
    messages?: ChatMessage[]
  }
}

function extractResponseText(payload: {
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>
}) {
  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === 'output_text')
      ?.text?.trim() ?? ''
  )
}

function alvyaChatApi(apiKey: string, model: string): Plugin {
  return {
    name: 'alvya-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (request, response) => {
        const apiRequest = request as unknown as ApiRequest
        if (apiRequest.method !== 'POST') {
          sendJson(response, 405, { error: 'Yalnızca POST desteklenir.' })
          return
        }
        if (!apiKey) {
          sendJson(response, 503, {
            error: 'ALVYA danışmanı için API anahtarı henüz yapılandırılmadı.',
          })
          return
        }

        try {
          const body = await readJsonBody(apiRequest)
          const messages = (body.messages ?? [])
            .filter(
              (message): message is ChatMessage =>
                (message.role === 'user' || message.role === 'assistant') &&
                typeof message.content === 'string',
            )
            .slice(-10)
            .map((message) => ({
              role: message.role,
              content: message.content.slice(0, 1_000),
            }))

          if (!messages.some((message) => message.role === 'user')) {
            sendJson(response, 400, {
              error: 'Geçerli bir müşteri mesajı gerekli.',
            })
            return
          }

          const openAiResponse = await fetch(
            'https://api.openai.com/v1/responses',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                store: false,
                max_output_tokens: 180,
                instructions:
                  'Sen ALVYA adlı Türkçe bir takı alışveriş danışmanısın. Müşterinin aradığı hazır ürünü anlamaya çalış. Kategori, stil, altın ayarı, renk, taş, kullanım amacı ve bütçe bilgilerinden eksik olan en önemli tek bilgiyi sıcak ve kısa bir soruyla sor. Aynı anda yalnızca bir soru sor. Fiyat veya stok uydurma. Müşterinin tarifi yeterliyse, mevcut katalogda arama yapabileceğini söyle. Yanıtın 45 kelimeyi geçmesin.',
                input: messages,
              }),
            },
          )
          const payload = (await openAiResponse.json()) as {
            error?: { message?: string }
            output?: Array<{
              content?: Array<{ type?: string; text?: string }>
            }>
          }
          if (!openAiResponse.ok)
            throw new Error(
              payload.error?.message ?? 'Yapay zeka servisi yanıt vermedi.',
            )

          const reply = extractResponseText(payload)
          if (!reply) throw new Error('Danışman boş yanıt verdi.')
          sendJson(response, 200, { reply })
        } catch (error) {
          sendJson(response, 502, {
            error:
              error instanceof Error
                ? error.message
                : 'Danışmana şu anda ulaşılamıyor.',
          })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [
      vue(),
      alvyaChatApi(
        env.OPENAI_API_KEY ?? '',
        env.OPENAI_CHAT_MODEL ?? 'gpt-5-mini',
      ),
    ],
    server: {
      allowedHosts: ['.trycloudflare.com'],
    },
  }
})
