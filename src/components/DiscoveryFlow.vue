<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import CategoryArtwork from './CategoryArtwork.vue'
import StyleArtwork from './StyleArtwork.vue'
import type { Category } from '../data/categories'
import {
  findProducts,
  getCatalogProductBySku,
  pickFeaturedRingForCollection,
  type CatalogProduct,
  type RingCollectionId,
} from '../data/productCatalog'

const props = defineProps<{
  categoryId: Category['id']
  categoryLabel: string
  featuredRingImage: string | null
  initialProductSku: string | null
}>()

const emit = defineEmits<{
  backToCategories: []
  previewRingCollection: [imageUrl: string | null]
  addToCart: [product: CatalogProduct]
}>()

const goldKaratOptions = [
  { value: 0, label: 'Tüm ayarlar' },
  { value: 8, label: '8 Ayar' },
  { value: 14, label: '14 Ayar' },
  { value: 18, label: '18 Ayar' },
  { value: 22, label: '22 Ayar' },
] as const
const ringCollectionOptions = (
  [
    { id: 'minimal', label: 'Minimal Yüzük' },
    { id: 'design', label: 'Tasarım Yüzük' },
    { id: 'stone', label: 'Taşlı Yüzük' },
    { id: 'enamel', label: 'Mineli Yüzük' },
    { id: 'baguette', label: 'Baget Yüzük' },
    { id: 'heart', label: 'Kalp Yüzük' },
    { id: 'star', label: 'Yıldız Yüzük' },
    { id: 'letter', label: 'Harf Yüzük' },
  ] as const
).map((option) => ({
  ...option,
  imageUrl: pickFeaturedRingForCollection(option.id)?.imageUrl ?? null,
}))
const styleOptions = [
  { id: 'minimal', label: 'Minimal', description: 'Sade çizgiler' },
  { id: 'classic', label: 'Klasik', description: 'Zamansız görünüm' },
  { id: 'modern', label: 'Modern', description: 'Yeni formlar' },
  { id: 'bold', label: 'İddialı', description: 'Dikkat çeken detaylar' },
] as const
const budgetOptions = [
  { label: '10.000 ₺ altı', minBudget: 0, maxBudget: 10000 },
  { label: '10.000–20.000 ₺', minBudget: 10000, maxBudget: 20000 },
  { label: '20.000 ₺ üzeri', minBudget: 20000, maxBudget: null },
] as const
const currentStep = ref(0)
const isComplete = ref(false)
const flowRoot = ref<HTMLElement | null>(null)
const resultsAnchor = ref<HTMLElement | null>(null)
const detailHeading = ref<HTMLElement | null>(null)
const budgetRange = ref<HTMLInputElement | null>(null)
const budgetTier = ref(0)
const visibleProductCount = ref(12)
const selectedProduct = ref<CatalogProduct | null>(null)
const selectedImageUrl = ref<string | null>(null)
const deliveryPriorityVisible = ref(true)
const prioritizeAvailable = ref(false)
const availableOnly = ref(false)
const resultSort = ref<'recommended' | 'price-asc' | 'price-desc'>(
  'recommended',
)
const moneyEmoji = '💰'
const answers = reactive({
  ringCollection: '',
  goldKarat: null as number | null,
  style: '',
})

const hasRingCollectionStep = computed(() => props.categoryId === 'ring')
const karatStep = computed(() => (hasRingCollectionStep.value ? 1 : 0))
const styleStep = computed(() => karatStep.value + 1)
const budgetStep = computed(() => styleStep.value + 1)
const selectedRingCollection = computed(() =>
  ringCollectionOptions.find((option) => option.id === answers.ringCollection),
)

const budgetFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})
const weightFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const selectedBudget = computed(
  () => budgetOptions[budgetTier.value] ?? budgetOptions[0],
)
const budgetMoneyStyle = computed(() => ({
  left:
    budgetTier.value === 0
      ? '0.5rem'
      : budgetTier.value === 1
        ? '50%'
        : 'calc(100% - 0.5rem)',
  transform: `translate(-50%, -50%) scale(${1 + budgetTier.value * 0.3})`,
}))
const budgetProgressWidth = computed(() =>
  budgetTier.value === 0
    ? '0'
    : budgetTier.value === 1
      ? 'calc(50% - 0.5rem)'
      : 'calc(100% - 1rem)',
)
const budgetSummary = computed(() => {
  const { minBudget, maxBudget } = selectedBudget.value
  const minimum = budgetFormatter.format(minBudget)
  return maxBudget === null
    ? `${minimum} üzeri`
    : `${minimum} – ${budgetFormatter.format(maxBudget)}`
})
const catalogMatches = computed(() =>
  findProducts({
    categoryId: props.categoryId,
    goldKarat: answers.goldKarat,
    style: answers.style,
    ringCollection: (answers.ringCollection || null) as RingCollectionId | null,
    minBudgetMinor: selectedBudget.value.minBudget * 100,
    maxBudgetMinor:
      selectedBudget.value.maxBudget === null
        ? null
        : selectedBudget.value.maxBudget * 100,
  }),
)
const matchingProducts = computed(() => {
  let products = catalogMatches.value

  if (availableOnly.value) {
    products = products.filter((product) => product.available)
  }

  if (resultSort.value === 'price-asc') {
    return [...products].sort(
      (first, second) => first.priceMinor - second.priceMinor,
    )
  }

  if (resultSort.value === 'price-desc') {
    return [...products].sort(
      (first, second) => second.priceMinor - first.priceMinor,
    )
  }

  if (!prioritizeAvailable.value) return products

  return products
    .map((product, index) => ({ product, index }))
    .sort(
      (first, second) =>
        Number(second.product.available) - Number(first.product.available) ||
        first.index - second.index,
    )
    .map(({ product }) => product)
})
const visibleProducts = computed(() =>
  matchingProducts.value.slice(0, visibleProductCount.value),
)

async function goBack() {
  if (currentStep.value === 0) {
    emit('backToCategories')
    return
  }

  currentStep.value -= 1
  await nextTick()
  const selector =
    currentStep.value === karatStep.value
      ? '.karat-card[aria-pressed="true"], .karat-card'
      : '.style-card[aria-pressed="true"], .style-card'
  if (hasRingCollectionStep.value && currentStep.value === 0) {
    flowRoot.value?.querySelector<HTMLElement>('#discovery-title')?.focus()
  } else {
    flowRoot.value?.querySelector<HTMLButtonElement>(selector)?.focus()
  }
}

async function selectRingCollection(collection: string) {
  answers.ringCollection = collection
  emit('previewRingCollection', null)
  currentStep.value = karatStep.value
  await nextTick()
  flowRoot.value?.querySelector<HTMLButtonElement>('.karat-card')?.focus()
}

function previewRingCollection(imageUrl: string | null) {
  emit('previewRingCollection', imageUrl)
}

function hasFeaturedRingImage(karat: number): boolean {
  return (
    props.categoryId === 'ring' &&
    karat === 14 &&
    Boolean(props.featuredRingImage)
  )
}

async function selectKarat(karat: number) {
  answers.goldKarat = karat
  currentStep.value = styleStep.value
  await nextTick()
  flowRoot.value?.querySelector<HTMLButtonElement>('.style-card')?.focus()
}

async function selectStyle(style: string) {
  answers.style = style
  currentStep.value = budgetStep.value
  await nextTick()
  budgetRange.value?.focus()
}

async function showResults() {
  if (currentStep.value === budgetStep.value) {
    visibleProductCount.value = 12
    isComplete.value = true
    await nextTick()
    resultsAnchor.value?.focus()
  }
}

async function openProduct(product: CatalogProduct) {
  selectedProduct.value = product
  selectedImageUrl.value = product.imageUrl
  await nextTick()
  detailHeading.value?.focus()
}

async function closeProduct() {
  const sourceSku = selectedProduct.value?.sourceSku
  selectedProduct.value = null
  selectedImageUrl.value = null
  await nextTick()
  flowRoot.value
    ?.querySelector<HTMLButtonElement>(`[data-product-sku="${sourceSku}"]`)
    ?.focus()
}

function restartFlow() {
  emit('backToCategories')
}

function addSelectedProductToCart() {
  if (!selectedProduct.value?.available) return
  emit('addToCart', selectedProduct.value)
}

onMounted(() => {
  if (!props.initialProductSku) return
  const product = getCatalogProductBySku(props.initialProductSku)
  if (!product) return
  selectedProduct.value = product
  selectedImageUrl.value = product.imageUrl
})
</script>

<template>
  <section
    ref="flowRoot"
    class="discovery-flow"
    aria-labelledby="discovery-title"
  >
    <div v-if="selectedProduct" class="product-detail">
      <button class="detail-back" type="button" @click="closeProduct">
        <span aria-hidden="true">←</span> Sonuçlara dön
      </button>
      <div class="product-detail-layout">
        <div class="product-detail-media">
          <img
            v-if="selectedProduct.imageUrl"
            :src="selectedImageUrl ?? selectedProduct.imageUrl"
            :alt="selectedProduct.name"
          />
          <CategoryArtwork
            v-else
            :category-id="categoryId"
            aria-hidden="true"
          />
          <div
            v-if="selectedProduct.imageUrls.length > 1"
            class="product-detail-thumbnails"
            aria-label="Ürün görselleri"
          >
            <button
              v-for="(imageUrl, index) in selectedProduct.imageUrls"
              :key="imageUrl"
              type="button"
              :aria-label="`${index + 1}. görseli göster`"
              :aria-pressed="selectedImageUrl === imageUrl"
              @click="selectedImageUrl = imageUrl"
            >
              <img :src="imageUrl" alt="" loading="lazy" />
            </button>
          </div>
        </div>
        <div class="product-detail-info">
          <p class="eyebrow">ALVYA seçkisi · {{ categoryLabel }}</p>
          <h2 id="discovery-title" ref="detailHeading" tabindex="-1">
            {{ selectedProduct.name }}
          </h2>
          <p class="product-detail-price">
            {{ budgetFormatter.format(selectedProduct.priceMinor / 100) }}
          </p>
          <p class="product-detail-price-note">
            Gösterilen fiyat katalog kaydıdır. Sipariş öncesi güncel fiyat ve
            stok doğrulanacaktır.
          </p>
          <dl class="product-detail-specs">
            <div v-if="selectedProduct.goldKarat">
              <dt>Altın ayarı</dt>
              <dd>{{ selectedProduct.goldKarat }} ayar</dd>
            </div>
            <div v-if="selectedProduct.goldColor">
              <dt>Renk</dt>
              <dd>{{ selectedProduct.goldColor }} altın</dd>
            </div>
            <div v-if="selectedProduct.weightGr">
              <dt>Gramaj</dt>
              <dd>{{ weightFormatter.format(selectedProduct.weightGr) }} gr</dd>
            </div>
            <div v-if="selectedProduct.stoneType">
              <dt>Taş</dt>
              <dd>{{ selectedProduct.stoneType }}</dd>
            </div>
            <div>
              <dt>Ürün kodu</dt>
              <dd>{{ selectedProduct.sourceSku }}</dd>
            </div>
            <div>
              <dt>Stok görünümü</dt>
              <dd>
                {{
                  selectedProduct.available
                    ? 'Stokta görünüyor'
                    : 'Sipariş öncesi doğrulanacak'
                }}
              </dd>
            </div>
          </dl>
          <button
            class="primary-button product-add-button"
            type="button"
            :disabled="!selectedProduct.available"
            @click="addSelectedProductToCart"
          >
            {{
              selectedProduct.available
                ? 'Sepete ekle'
                : 'Stok doğrulaması gerekli'
            }}
          </button>
          <p class="product-detail-purchase-note">
            Bu prototipte tahsilat yapılmaz. Ürün sepete eklenir ve test sipariş
            akışıyla kontrol edilir.
          </p>
          <div class="product-detail-assurances" aria-label="Sipariş bilgileri">
            <span>✓ Siparişten önce fiyat teyidi</span>
            <span>✓ Stok doğrulaması</span>
            <span>✓ Güvenli ödeme altyapısına hazır</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isComplete">
      <h2 id="discovery-title" tabindex="-1">
        {{ categoryLabel }} tercihlerini belirle
      </h2>

      <form @submit.prevent="showResults">
        <fieldset v-if="hasRingCollectionStep && currentStep === 0">
          <legend>Hangi yüzük kategorisini arıyorsun?</legend>
          <div class="ring-collection-deck" aria-label="Yüzük kategorileri">
            <button
              v-for="(collection, index) in ringCollectionOptions"
              :key="collection.id"
              class="ring-collection-card"
              :class="{
                'ring-collection-card-selected':
                  answers.ringCollection === collection.id,
              }"
              :data-ring-collection="collection.id"
              :aria-pressed="answers.ringCollection === collection.id"
              :style="{ animationDelay: `${index * 70}ms` }"
              type="button"
              @pointerenter="previewRingCollection(collection.imageUrl)"
              @pointerleave="previewRingCollection(null)"
              @focus="previewRingCollection(collection.imageUrl)"
              @blur="previewRingCollection(null)"
              @click="selectRingCollection(collection.id)"
            >
              <img
                v-if="collection.imageUrl"
                class="featured-product-background"
                :src="collection.imageUrl"
                alt=""
                aria-hidden="true"
              />
              <span>{{ collection.label }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset v-else-if="currentStep === karatStep">
          <legend>Hangi altın ayarını tercih edersin?</legend>
          <div class="choice-grid">
            <button
              v-for="karat in goldKaratOptions"
              :key="karat.value"
              class="choice-option karat-card"
              :class="{
                'choice-option-selected': answers.goldKarat === karat.value,
              }"
              :data-karat="karat.value"
              :aria-pressed="answers.goldKarat === karat.value"
              type="button"
              @click="selectKarat(karat.value)"
            >
              <img
                v-if="hasFeaturedRingImage(karat.value)"
                class="featured-product-background"
                :src="featuredRingImage ?? ''"
                alt=""
                aria-hidden="true"
              />
              <span class="card-label">{{ karat.label }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset v-else-if="currentStep === styleStep">
          <legend>Hangi stili arıyorsun?</legend>
          <div class="choice-grid">
            <button
              v-for="style in styleOptions"
              :key="style.label"
              class="choice-option style-card"
              :class="{
                'choice-option-selected': answers.style === style.label,
              }"
              type="button"
              :aria-pressed="answers.style === style.label"
              @click="selectStyle(style.label)"
            >
              <StyleArtwork :category-id="categoryId" :style-id="style.id" />
              <span class="card-label">{{ style.label }}</span>
              <span class="style-description">{{ style.description }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset v-else>
          <legend>Bütçe aralığın nedir?</legend>
          <div class="budget-selector">
            <p class="budget-current" aria-live="polite">
              {{ selectedBudget.label }}
            </p>
            <div class="budget-track">
              <div class="budget-track-line" aria-hidden="true"></div>
              <div
                class="budget-track-progress"
                :style="{ width: budgetProgressWidth }"
                aria-hidden="true"
              ></div>
              <span
                v-for="(option, index) in budgetOptions"
                :key="option.label"
                class="budget-stop"
                :style="{
                  left:
                    index === 0
                      ? '0.5rem'
                      : index === 1
                        ? '50%'
                        : 'calc(100% - 0.5rem)',
                }"
                aria-hidden="true"
              ></span>
              <span
                class="budget-money"
                :style="budgetMoneyStyle"
                aria-hidden="true"
                v-text="moneyEmoji"
              ></span>
              <input
                ref="budgetRange"
                v-model.number="budgetTier"
                class="budget-range"
                name="budgetTier"
                type="range"
                min="0"
                max="2"
                step="1"
                aria-label="Bütçe aralığı"
                :aria-valuetext="selectedBudget.label"
              />
            </div>
            <div class="budget-options" aria-label="Bütçe seçenekleri">
              <button
                v-for="(option, index) in budgetOptions"
                :key="option.label"
                class="budget-option"
                type="button"
                :aria-pressed="budgetTier === index"
                @click="budgetTier = index"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </fieldset>

        <div class="flow-actions">
          <button class="secondary-button" type="button" @click="goBack">
            Geri
          </button>
          <button
            v-if="currentStep === budgetStep"
            class="primary-button"
            type="submit"
          >
            Sonuçları gör
          </button>
        </div>
      </form>
    </div>

    <div v-else class="flow-complete" aria-live="polite">
      <p class="eyebrow">Arama özeti</p>
      <h2 id="discovery-title" class="visually-hidden">Arama sonuçları</h2>
      <button
        class="secondary-button restart-top"
        type="button"
        @click="restartFlow"
      >
        En başa dön
      </button>
      <dl class="answer-summary">
        <div>
          <dt>Kategori</dt>
          <dd>{{ categoryLabel }}</dd>
        </div>
        <div v-if="selectedRingCollection">
          <dt>Yüzük türü</dt>
          <dd>{{ selectedRingCollection.label }}</dd>
        </div>
        <div>
          <dt>Altın ayarı</dt>
          <dd>
            {{
              answers.goldKarat ? `${answers.goldKarat} ayar` : 'Tüm ayarlar'
            }}
          </dd>
        </div>
        <div>
          <dt>Stil</dt>
          <dd>{{ answers.style.trim() }}</dd>
        </div>
        <div>
          <dt>Bütçe</dt>
          <dd>
            {{ budgetSummary }}
          </dd>
        </div>
      </dl>
      <aside
        v-if="deliveryPriorityVisible && matchingProducts.length"
        class="delivery-priority-card"
        :class="{ 'is-delivery-prioritized': prioritizeAvailable }"
        aria-label="Hızlı teslimat seçeneği"
      >
        <span class="delivery-priority-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <circle cx="27" cy="24" r="12" />
            <path d="M27 17v8l5 3M4 17h10M7 24h7M10 31h6" />
          </svg>
        </span>
        <div>
          <strong>Hızlı mı lazım?</strong>
          <button
            type="button"
            class="delivery-priority-action"
            @click="prioritizeAvailable = !prioritizeAvailable"
          >
            {{
              prioritizeAvailable
                ? 'Standart sıralamaya dön'
                : 'Stokta olanları önce göster'
            }}
          </button>
          <small>Stok bilgisi sipariş öncesinde yeniden doğrulanır.</small>
        </div>
        <button
          class="delivery-priority-close"
          type="button"
          aria-label="Hızlı teslimat önerisini kapat"
          @click="deliveryPriorityVisible = false"
        >
          ×
        </button>
      </aside>
      <div v-if="catalogMatches.length" class="results-section">
        <div class="results-heading">
          <div>
            <p class="eyebrow">ALVYA seçkisi</p>
            <h3 ref="resultsAnchor" tabindex="-1">
              {{ matchingProducts.length }}
              {{ categoryLabel.toLocaleLowerCase('tr-TR') }} bulundu
            </h3>
          </div>
          <p>
            Katalog fiyatları · Güncel fiyat ve stok sipariş öncesi doğrulanacak
            <template v-if="prioritizeAvailable"> · Stoktakiler önce</template>
          </p>
        </div>
        <div class="product-toolbar" aria-label="Ürün sıralama ve filtreleme">
          <label class="availability-filter">
            <input v-model="availableOnly" type="checkbox" />
            <span>Yalnızca stokta olanlar</span>
          </label>
          <label class="result-sort">
            <span>Sırala</span>
            <select v-model="resultSort">
              <option value="recommended">Önerilen sıralama</option>
              <option value="price-asc">Fiyat: düşükten yükseğe</option>
              <option value="price-desc">Fiyat: yüksekten düşüğe</option>
            </select>
          </label>
        </div>
        <ul v-if="matchingProducts.length" class="product-grid">
          <li v-for="product in visibleProducts" :key="product.sourceSku">
            <button
              class="result-card"
              type="button"
              :data-product-sku="product.sourceSku"
              @click="openProduct(product)"
            >
              <span class="result-card-art">
                <span v-if="product.available" class="stock-badge">
                  Stokta
                </span>
                <img
                  v-if="product.imageUrl"
                  :src="product.imageUrl"
                  :alt="product.name"
                  loading="lazy"
                />
                <CategoryArtwork
                  v-else
                  :category-id="categoryId"
                  aria-hidden="true"
                />
              </span>
              <span class="result-card-body">
                <span class="result-card-source">ALVYA seçkisi</span>
                <span class="result-card-title">{{ product.name }}</span>
                <span class="result-card-details">
                  <template v-if="product.goldKarat">
                    {{ product.goldKarat }} ayar ·
                  </template>
                  <template v-if="product.weightGr">
                    {{ product.weightGr }} gr ·
                  </template>
                  {{ product.goldColor }} altın
                </span>
                <span class="result-card-price">
                  {{ budgetFormatter.format(product.priceMinor / 100) }}
                </span>
                <span class="result-card-action">
                  Ürünü incele <span aria-hidden="true">→</span>
                </span>
              </span>
            </button>
          </li>
        </ul>
        <p v-else class="results-filter-empty">
          Bu filtreyle stokta görünen ürün bulunamadı. Stok filtresini
          kaldırarak tüm seçenekleri görebilirsin.
        </p>
        <button
          v-if="visibleProductCount < matchingProducts.length"
          class="secondary-button results-more"
          type="button"
          @click="visibleProductCount += 12"
        >
          Daha fazla ürün göster
        </button>
      </div>
      <p v-else ref="resultsAnchor" class="results-empty" tabindex="-1">
        Bu seçimlere ve bütçeye uygun doğrulanmış örnek ürün henüz yok. Başka
        bir bütçe veya stil deneyebilirsin.
      </p>
    </div>
  </section>
</template>
