import goldiumMinimalRingsCsv from '../../data/goldium-minimal-rings.csv?raw'
import goldiumMinimalRingImagesCsv from '../../data/goldium-minimal-ring-images.csv?raw'
import goldiumBagetRingsJson from '../../data/goldium-baget-yuzuk.json?raw'
import goldiumLetterRingsJson from '../../data/goldium-harf-yuzuk.json?raw'
import goldiumHeartRingsJson from '../../data/goldium-kalp-yuzuk.json?raw'
import goldiumEnamelRingsJson from '../../data/goldium-mineli-yuzuk.json?raw'
import goldiumDesignRingsJson from '../../data/goldium-tasarim-yuzuk.json?raw'
import goldiumStoneRingsJson from '../../data/goldium-tasli-yuzuk.json?raw'
import goldiumStarRingsJson from '../../data/goldium-yildiz-yuzuk.json?raw'
import goldiumCatalogJson from '../../data/goldium-catalog-client.json?raw'
import type { Category } from './categories'

export type RingCollectionId =
  | 'minimal'
  | 'design'
  | 'stone'
  | 'enamel'
  | 'baguette'
  | 'heart'
  | 'star'
  | 'letter'

export interface CatalogProduct {
  supplierId: 'goldium'
  sourceSku: string
  name: string
  priceMinor: number
  available: boolean
  weightGr: number
  goldKarat: number
  goldColor: string
  stoneType: string | null
  imageUrl: string | null
  imageUrls: string[]
  sourceUrl: string
  categoryId: Category['id']
  ringCollection: RingCollectionId | null
}

export interface ProductSearch {
  categoryId: Category['id']
  goldKarat: number | null
  style: string
  ringCollection: RingCollectionId | null
  minBudgetMinor: number
  maxBudgetMinor: number | null
}

const sourceOrigin = 'https://www.goldium.com.tr'
const mediaBaseUrl = (import.meta.env.VITE_MEDIA_BASE_URL ?? '').replace(
  /\/$/,
  '',
)

export function resolveMediaUrl(path: string): string {
  return mediaBaseUrl ? `${mediaBaseUrl}${path}` : path
}

interface GoldiumCatalogManifest {
  products: Array<{
    sourceSku: string
    name: string
    handle: string
    categoryId: Category['id'] | 'other'
    priceMinor: number
    available: boolean
    weightGr: number
    goldKarat: number
    goldColor: string | null
    stoneType: string | null
    images: string[]
  }>
}

const supportedCategoryIds = new Set<Category['id']>([
  'ring',
  'bracelet',
  'bangle',
  'necklace',
  'earring',
  'charm',
  'jewelry-set',
])
const goldiumCatalogManifest = JSON.parse(
  goldiumCatalogJson,
) as GoldiumCatalogManifest
const catalogImagesByKey = new Map<string, string[]>()
const catalogAvailabilityByKey = new Map<string, boolean>()

for (const product of goldiumCatalogManifest.products) {
  const imageUrls = product.images.map((fileName) =>
    resolveMediaUrl(`/products/goldium/${product.handle}/${fileName}`),
  )
  catalogImagesByKey.set(product.sourceSku, imageUrls)
  catalogImagesByKey.set(product.handle, imageUrls)
  catalogAvailabilityByKey.set(product.sourceSku, product.available)
  catalogAvailabilityByKey.set(product.handle, product.available)
}

function localImagesFor(sourceSku: string, handle: string): string[] {
  return (
    catalogImagesByKey.get(sourceSku) ?? catalogImagesByKey.get(handle) ?? []
  )
}

export const goldiumCatalogProducts: CatalogProduct[] =
  goldiumCatalogManifest.products
    .filter((product) =>
      supportedCategoryIds.has(product.categoryId as Category['id']),
    )
    .map((product) => {
      const imageUrls = product.images.map((fileName) =>
        resolveMediaUrl(`/products/goldium/${product.handle}/${fileName}`),
      )
      return {
        supplierId: 'goldium',
        sourceSku: product.sourceSku,
        name: product.name,
        priceMinor: product.priceMinor,
        available: product.available,
        weightGr: product.weightGr,
        goldKarat: product.goldKarat,
        goldColor: product.goldColor ?? 'Sarı',
        stoneType: product.stoneType,
        imageUrl: imageUrls[0] ?? null,
        imageUrls,
        sourceUrl: new URL(`/products/${product.handle}`, sourceOrigin).href,
        categoryId: product.categoryId as Category['id'],
        ringCollection: null,
      }
    })

const imageBySku = new Map(
  goldiumMinimalRingImagesCsv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [sourceSku, , localFile] = line.split(',')
      return [sourceSku, localFile] as [string, string]
    }),
)

export const goldiumMinimalRings: CatalogProduct[] = goldiumMinimalRingsCsv
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => {
    const [sourceSku, name, priceMinor, weightGr, stoneType, , sourcePath] =
      line.split(',')

    const handle = sourcePath!.split('/').filter(Boolean).at(-1) ?? sourceSku!
    const imageUrls = localImagesFor(sourceSku!, handle)

    return {
      supplierId: 'goldium',
      sourceSku: sourceSku!,
      name: name!,
      priceMinor: Number(priceMinor),
      available:
        catalogAvailabilityByKey.get(sourceSku!) ??
        catalogAvailabilityByKey.get(handle) ??
        false,
      weightGr: Number(weightGr),
      goldKarat: 14,
      goldColor: 'Sarı',
      stoneType: stoneType || null,
      imageUrl:
        imageUrls[0] ??
        (imageBySku.has(sourceSku!)
          ? resolveMediaUrl(`/products/${imageBySku.get(sourceSku!)}`)
          : null),
      imageUrls:
        imageUrls.length > 0
          ? imageUrls
          : imageBySku.has(sourceSku!)
            ? [resolveMediaUrl(`/products/${imageBySku.get(sourceSku!)}`)]
            : [],
      sourceUrl: new URL(sourcePath!, sourceOrigin).href,
      categoryId: 'ring',
      ringCollection: 'minimal',
    }
  })

interface GoldiumProductResponse {
  products: Array<{
    title: string
    handle: string
    body_html: string
    variants: Array<{ sku: string; price: string; available?: boolean }>
    images: Array<{ src: string }>
  }>
}

function getProductDetail(bodyHtml: string, label: string): string | null {
  const normalized = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const match = normalized.match(
    new RegExp(
      `${label}:\\s*(.*?)(?=\\s+(?:Maden|Renk|Gramı|Ayar|Taş Tipi|Ürün Kodu|Ölçü):|$)`,
      'i',
    ),
  )
  return match?.[1]?.trim() ?? null
}

function parseGoldiumCollection(
  source: string,
  ringCollection: RingCollectionId,
): CatalogProduct[] {
  const { products } = JSON.parse(source) as GoldiumProductResponse

  return products.map((product) => {
    const variant = product.variants[0]
    const imageUrls = localImagesFor(
      variant?.sku || product.handle,
      product.handle,
    )
    const karat = Number(
      getProductDetail(product.body_html, 'Ayar')?.match(/\d+/)?.[0] ?? 14,
    )
    const weight = Number(
      getProductDetail(product.body_html, 'Gramı')
        ?.replace(',', '.')
        .match(/[\d.]+/)?.[0] ?? 0,
    )

    return {
      supplierId: 'goldium',
      sourceSku: variant?.sku || product.handle,
      name: product.title,
      priceMinor: Math.round(Number(variant?.price ?? 0) * 100),
      available:
        catalogAvailabilityByKey.get(variant?.sku || product.handle) ??
        variant?.available ??
        false,
      weightGr: weight,
      goldKarat: karat,
      goldColor: getProductDetail(product.body_html, 'Renk') ?? 'Sarı',
      stoneType: getProductDetail(product.body_html, 'Taş Tipi'),
      imageUrl: imageUrls[0] ?? product.images[0]?.src ?? null,
      imageUrls:
        imageUrls.length > 0
          ? imageUrls
          : product.images.map((image) => image.src),
      sourceUrl: new URL(`/products/${product.handle}`, sourceOrigin).href,
      categoryId: 'ring',
      ringCollection,
    }
  })
}

export const goldiumRingsByCollection: Record<
  RingCollectionId,
  CatalogProduct[]
> = {
  minimal: goldiumMinimalRings,
  design: parseGoldiumCollection(goldiumDesignRingsJson, 'design'),
  stone: parseGoldiumCollection(goldiumStoneRingsJson, 'stone'),
  enamel: parseGoldiumCollection(goldiumEnamelRingsJson, 'enamel'),
  baguette: parseGoldiumCollection(goldiumBagetRingsJson, 'baguette'),
  heart: parseGoldiumCollection(goldiumHeartRingsJson, 'heart'),
  star: parseGoldiumCollection(goldiumStarRingsJson, 'star'),
  letter: parseGoldiumCollection(goldiumLetterRingsJson, 'letter'),
}

export function pickFeaturedRingForCollection(
  ringCollection: RingCollectionId,
  random: () => number = Math.random,
): CatalogProduct | null {
  const candidates = goldiumRingsByCollection[ringCollection].filter(
    (product) => product.imageUrl,
  )
  return candidates[Math.floor(random() * candidates.length)] ?? null
}

// These catalog photos show the ring clearly against a clean background.
const featuredRingSkus = new Set([
  'RYZ26010',
  'RYZ26009',
  'RYZ26008',
  'RYZ26007',
  'RYZ26006',
  'RYZ26005',
  'RYZ26004',
  'RYZ26003',
  'RYZ26002',
  'RYZ26001',
])

export function pickFeatured14KRing(
  previousSku: string | null,
  random: () => number = Math.random,
): CatalogProduct | null {
  const candidates = goldiumMinimalRings.filter(
    (product) =>
      product.goldKarat === 14 &&
      product.imageUrl &&
      featuredRingSkus.has(product.sourceSku) &&
      product.sourceSku !== previousSku,
  )

  return candidates[Math.floor(random() * candidates.length)] ?? null
}

export function findProducts(search: ProductSearch): CatalogProduct[] {
  if (search.categoryId === 'ring') {
    if (
      !search.ringCollection ||
      (search.goldKarat !== 0 && search.goldKarat !== 14)
    )
      return []

    return goldiumRingsByCollection[search.ringCollection].filter(
      (product) =>
        product.priceMinor >= search.minBudgetMinor &&
        (search.maxBudgetMinor === null ||
          product.priceMinor < search.maxBudgetMinor),
    )
  }

  return goldiumCatalogProducts.filter(
    (product) =>
      product.categoryId === search.categoryId &&
      (search.goldKarat === 0 || product.goldKarat === search.goldKarat) &&
      product.priceMinor >= search.minBudgetMinor &&
      (search.maxBudgetMinor === null ||
        product.priceMinor < search.maxBudgetMinor),
  )
}

export function pickFeaturedProductForCategory(
  categoryId: Category['id'],
): CatalogProduct | null {
  return (
    goldiumCatalogProducts.find(
      (product) => product.categoryId === categoryId && product.imageUrl,
    ) ?? null
  )
}

const promptCategoryKeywords: Array<{
  categoryId: Category['id']
  keywords: string[]
}> = [
  { categoryId: 'jewelry-set', keywords: ['taki seti', 'set'] },
  { categoryId: 'bracelet', keywords: ['bileklik'] },
  { categoryId: 'bangle', keywords: ['bilezik'] },
  { categoryId: 'necklace', keywords: ['kolye'] },
  { categoryId: 'earring', keywords: ['kupe'] },
  { categoryId: 'charm', keywords: ['charm'] },
  { categoryId: 'ring', keywords: ['yuzuk'] },
]

const promptStopWords = new Set([
  'bir',
  'icin',
  'ile',
  'olsun',
  'istiyorum',
  'uygun',
  'detayi',
  'detayli',
])

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function searchProductsByPrompt(
  prompt: string,
  limit = 4,
): CatalogProduct[] {
  const normalizedPrompt = normalizeSearchText(prompt)
  if (!normalizedPrompt) return []

  const categoryId = promptCategoryKeywords.find(({ keywords }) =>
    keywords.some((keyword) => normalizedPrompt.includes(keyword)),
  )?.categoryId
  const tokens = [
    ...new Set(
      normalizedPrompt
        .split(' ')
        .filter((token) => token.length >= 3 && !promptStopWords.has(token)),
    ),
  ]

  return goldiumCatalogProducts
    .filter((product) => !categoryId || product.categoryId === categoryId)
    .map((product, index) => {
      const haystack = normalizeSearchText(
        [product.name, product.stoneType, product.goldColor]
          .filter(Boolean)
          .join(' '),
      )
      const tokenScore = tokens.reduce(
        (score, token) => score + (haystack.includes(token) ? 3 : 0),
        0,
      )
      return {
        product,
        index,
        score: tokenScore + (categoryId ? 12 : 0),
      }
    })
    .filter(({ score }) => score > 0)
    .sort(
      (first, second) =>
        second.score - first.score ||
        Number(second.product.available) - Number(first.product.available) ||
        first.index - second.index,
    )
    .slice(0, limit)
    .map(({ product }) => product)
}

export function getCatalogProductBySku(
  sourceSku: string,
): CatalogProduct | null {
  return (
    goldiumCatalogProducts.find((product) => product.sourceSku === sourceSku) ??
    null
  )
}
