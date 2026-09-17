import goldiumMinimalRingsCsv from '../../data/goldium-minimal-rings.csv?raw'
import goldiumMinimalRingImagesCsv from '../../data/goldium-minimal-ring-images.csv?raw'
import goldiumBagetRingsJson from '../../data/goldium-baget-yuzuk.json?raw'
import goldiumLetterRingsJson from '../../data/goldium-harf-yuzuk.json?raw'
import goldiumHeartRingsJson from '../../data/goldium-kalp-yuzuk.json?raw'
import goldiumEnamelRingsJson from '../../data/goldium-mineli-yuzuk.json?raw'
import goldiumDesignRingsJson from '../../data/goldium-tasarim-yuzuk.json?raw'
import goldiumStoneRingsJson from '../../data/goldium-tasli-yuzuk.json?raw'
import goldiumStarRingsJson from '../../data/goldium-yildiz-yuzuk.json?raw'
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
  weightGr: number
  goldKarat: number
  goldColor: string
  stoneType: string | null
  imageUrl: string | null
  sourceUrl: string
  ringCollection: RingCollectionId
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

    return {
      supplierId: 'goldium',
      sourceSku: sourceSku!,
      name: name!,
      priceMinor: Number(priceMinor),
      weightGr: Number(weightGr),
      goldKarat: 14,
      goldColor: 'Sarı',
      stoneType: stoneType || null,
      imageUrl: imageBySku.has(sourceSku!)
        ? `/products/${imageBySku.get(sourceSku!)}`
        : null,
      sourceUrl: new URL(sourcePath!, sourceOrigin).href,
      ringCollection: 'minimal',
    }
  })

interface GoldiumProductResponse {
  products: Array<{
    title: string
    handle: string
    body_html: string
    variants: Array<{ sku: string; price: string }>
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
      weightGr: weight,
      goldKarat: karat,
      goldColor: getProductDetail(product.body_html, 'Renk') ?? 'Sarı',
      stoneType: getProductDetail(product.body_html, 'Taş Tipi'),
      imageUrl: product.images[0]?.src ?? null,
      sourceUrl: new URL(`/products/${product.handle}`, sourceOrigin).href,
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
  if (
    search.categoryId !== 'ring' ||
    !search.ringCollection ||
    search.goldKarat !== 14
  ) {
    return []
  }

  return goldiumRingsByCollection[search.ringCollection].filter(
    (product) =>
      product.priceMinor >= search.minBudgetMinor &&
      (search.maxBudgetMinor === null ||
        product.priceMinor < search.maxBudgetMinor),
  )
}
