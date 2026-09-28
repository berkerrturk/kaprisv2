const instructions =
  'Sen ALVYA adlı Türkçe bir takı alışveriş danışmanısın. Müşterinin aradığı hazır ürünü anlamaya çalış. Kategori, stil, altın ayarı, renk, taş, kullanım amacı ve bütçe bilgilerinden eksik olan en önemli tek bilgiyi sıcak ve kısa bir soruyla sor. Aynı anda yalnızca bir soru sor. Fiyat veya stok uydurma. Müşterinin tarifi yeterliyse, mevcut katalogda arama yapabileceğini söyle. Yanıtın 45 kelimeyi geçmesin.'

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function extractResponseText(payload) {
  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === 'output_text')
      ?.text?.trim() ?? ''
  )
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return json({ error: 'Yalnızca POST desteklenir.' }, 405)
  }

  if (!env.OPENAI_API_KEY) {
    return json(
      { error: 'ALVYA danışmanı için API anahtarı henüz yapılandırılmadı.' },
      503,
    )
  }

  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (contentLength > 32_000) return json({ error: 'İstek çok büyük.' }, 413)

    const body = await request.json()
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter(
        (message) =>
          (message?.role === 'user' || message?.role === 'assistant') &&
          typeof message?.content === 'string',
      )
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content.slice(0, 1_000),
      }))

    if (!messages.some((message) => message.role === 'user')) {
      return json({ error: 'Geçerli bir müşteri mesajı gerekli.' }, 400)
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_CHAT_MODEL || 'gpt-5-mini',
        store: false,
        max_output_tokens: 180,
        instructions,
        input: messages,
      }),
    })
    const payload = await openAiResponse.json()
    if (!openAiResponse.ok) {
      throw new Error(
        payload.error?.message ?? 'Yapay zeka servisi yanıt vermedi.',
      )
    }

    const reply = extractResponseText(payload)
    if (!reply) throw new Error('Danışman boş yanıt verdi.')
    return json({ reply })
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Danışmana şu anda ulaşılamıyor.',
      },
      502,
    )
  }
}
