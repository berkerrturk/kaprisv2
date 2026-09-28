import { mkdir, rename, stat, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const sourceOrigin = 'https://www.goldium.com.tr'
const outputFile = join('data', 'goldium-catalog.json')
const clientOutputFile = join('data', 'goldium-catalog-client.json')
const pageSize = 250
const imageWidth = Number(process.env.GOLDIUM_IMAGE_WIDTH ?? 1000)
const concurrency = Number(process.env.GOLDIUM_CONCURRENCY ?? 8)

const categoryByProductType = {
  Yüzük: 'ring',
  Bileklik: 'bracelet',
  Bilezik: 'bangle',
  Kolye: 'necklace',
  Küpe: 'earring',
  Charm: 'charm',
  'Takı Seti': 'jewelry-set',
}

function stripHtml(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function productDetail(bodyHtml, label) {
  const normalized = stripHtml(bodyHtml)
  const match = normalized.match(
    new RegExp(
      `${label}:\\s*(.*?)(?=\\s+(?:Maden|Renk|Gramı|Ayar|Taş Tipi|Ürün Kodu|Ölçü):|$)`,
      'i',
    ),
  )
  return match?.[1]?.trim() ?? null
}

function imageExtension(sourceUrl) {
  const extension = extname(new URL(sourceUrl).pathname).toLowerCase()
  return /^\.(?:avif|gif|jpe?g|png|webp)$/.test(extension) ? extension : '.jpg'
}

function localImagePath(handle, index, sourceUrl) {
  const fileName = `${String(index + 1).padStart(2, '0')}${imageExtension(sourceUrl)}`
  return `/products/goldium/${handle}/${fileName}`
}

async function fetchJson(url, attempt = 1) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'ALVYA catalog sync/1.0' },
  })
  if (response.ok) return response.json()
  if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    return fetchJson(url, attempt + 1)
  }
  throw new Error(`${url} alınamadı: ${response.status}`)
}

async function fetchAllProducts() {
  const products = []
  for (let page = 1; ; page += 1) {
    const url = `${sourceOrigin}/products.json?limit=${pageSize}&page=${page}`
    const response = await fetchJson(url)
    const batch = response.products ?? []
    products.push(...batch)
    console.log(`Katalog sayfası ${page}: ${batch.length} ürün`)
    if (batch.length < pageSize) return products
  }
}

function normalizeProduct(product) {
  const variant = product.variants?.[0] ?? {}
  const goldKarat = Number(
    productDetail(product.body_html ?? '', 'Ayar')?.match(/\d+/)?.[0] ?? 0,
  )
  const weightGr = Number(
    productDetail(product.body_html ?? '', 'Gramı')
      ?.replace(',', '.')
      .match(/[\d.]+/)?.[0] ?? 0,
  )
  const images = (product.images ?? []).map((image, index) => ({
    sourceUrl: image.src,
    localPath: localImagePath(product.handle, index, image.src),
    width: image.width,
    height: image.height,
  }))

  return {
    sourceId: String(product.id),
    supplierId: 'goldium',
    sourceSku:
      variant.sku ||
      productDetail(product.body_html ?? '', 'Ürün Kodu') ||
      product.handle,
    name: product.title,
    handle: product.handle,
    categoryId: categoryByProductType[product.product_type] ?? 'other',
    productType: product.product_type || 'Diğer',
    priceMinor: Math.round(Number(variant.price ?? 0) * 100),
    compareAtPriceMinor: variant.compare_at_price
      ? Math.round(Number(variant.compare_at_price) * 100)
      : null,
    available: Boolean(variant.available),
    weightGr,
    goldKarat,
    goldColor: productDetail(product.body_html ?? '', 'Renk'),
    stoneType: productDetail(product.body_html ?? '', 'Taş Tipi'),
    description: stripHtml(product.body_html ?? ''),
    tags: product.tags ?? [],
    sourceUrl: `${sourceOrigin}/products/${product.handle}`,
    publishedAt: product.published_at,
    updatedAt: product.updated_at,
    images,
  }
}

async function fileExists(path) {
  try {
    return (await stat(path)).size > 0
  } catch {
    return false
  }
}

async function downloadImage(image, attempt = 1) {
  const target = join('public', ...image.localPath.split('/').filter(Boolean))
  if (await fileExists(target)) return 'skipped'

  await mkdir(join(target, '..'), { recursive: true })
  const source = new URL(image.sourceUrl)
  source.searchParams.set('width', String(imageWidth))
  const response = await fetch(source, {
    headers: {
      accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
      'user-agent': 'ALVYA catalog sync/1.0',
    },
  })

  if (!response.ok) {
    if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1200))
      return downloadImage(image, attempt + 1)
    }
    throw new Error(`${source} alınamadı: ${response.status}`)
  }

  const temporary = `${target}.part`
  await writeFile(temporary, Buffer.from(await response.arrayBuffer()))
  await rename(temporary, target)
  return 'downloaded'
}

async function runPool(items, worker) {
  let cursor = 0
  const failures = []
  let completed = 0
  let downloaded = 0
  let skipped = 0

  async function runWorker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      try {
        const result = await worker(items[index])
        if (result === 'downloaded') downloaded += 1
        if (result === 'skipped') skipped += 1
      } catch (error) {
        failures.push({ item: items[index], error: String(error) })
      }
      completed += 1
      if (completed % 100 === 0 || completed === items.length) {
        console.log(
          `Görseller: ${completed}/${items.length} · yeni ${downloaded} · mevcut ${skipped} · hata ${failures.length}`,
        )
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => runWorker()))
  return { failures, downloaded, skipped }
}

const rawProducts = await fetchAllProducts()
const products = rawProducts.map(normalizeProduct)
const uniqueProducts = [
  ...new Map(products.map((item) => [item.sourceId, item])).values(),
]
const images = uniqueProducts.flatMap((product) => product.images)

await mkdir('data', { recursive: true })
await writeFile(
  outputFile,
  `${JSON.stringify(
    {
      supplierId: 'goldium',
      sourceOrigin,
      syncedAt: new Date().toISOString(),
      imageWidth,
      productCount: uniqueProducts.length,
      imageCount: images.length,
      products: uniqueProducts,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

const clientProducts = uniqueProducts.map((product) => ({
  sourceSku: product.sourceSku,
  name: product.name,
  handle: product.handle,
  categoryId: product.categoryId,
  priceMinor: product.priceMinor,
  available: product.available,
  weightGr: product.weightGr,
  goldKarat: product.goldKarat,
  goldColor: product.goldColor,
  stoneType: product.stoneType,
  images: product.images.map(({ localPath }) => localPath.split('/').at(-1)),
}))
await writeFile(
  clientOutputFile,
  `${JSON.stringify({ products: clientProducts })}\n`,
  'utf8',
)

console.log(`${uniqueProducts.length} ürün ${outputFile} dosyasına yazıldı.`)
const result = await runPool(images, downloadImage)

if (result.failures.length) {
  await writeFile(
    join('data', 'goldium-sync-failures.json'),
    `${JSON.stringify(result.failures, null, 2)}\n`,
    'utf8',
  )
  throw new Error(`${result.failures.length} görsel indirilemedi.`)
}

console.log(
  `Senkronizasyon tamamlandı: ${result.downloaded} yeni, ${result.skipped} mevcut görsel.`,
)
