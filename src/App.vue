<script setup lang="ts">
/* eslint-disable vue/html-closing-bracket-newline */
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import DiscoveryFlow from './components/DiscoveryFlow.vue'
import { categories, type Category } from './data/categories'
import {
  pickFeatured14KRing,
  pickFeaturedProductForCategory,
  resolveMediaUrl,
  searchProductsByPrompt,
  type CatalogProduct,
} from './data/productCatalog'

interface CategoryMenuItem {
  label: string
  href: string
  categoryId?: Category['id']
}

interface DesignChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface CartItem {
  product: CatalogProduct
  quantity: number
}

const categoryMenuItems: CategoryMenuItem[] = [
  { label: 'Yüzük', href: '#kategoriler', categoryId: 'ring' },
  { label: 'Bileklik', href: '#kategoriler', categoryId: 'bracelet' },
  { label: 'Bilezik', href: '#kategoriler', categoryId: 'bangle' },
  { label: 'Kolye', href: '#kategoriler', categoryId: 'necklace' },
  { label: 'Küpe', href: '#kategoriler', categoryId: 'earring' },
  { label: 'Charm', href: '#kategoriler', categoryId: 'charm' },
  { label: 'Takı Seti', href: '#kategoriler', categoryId: 'jewelry-set' },
  { label: 'İndirimli Ürünler', href: '#kategoriler' },
  { label: 'Erkek', href: '#kategoriler' },
  { label: 'Çocuk', href: '#kategoriler' },
]

const selectedCategory = ref<Category | null>(null)
const menuOpen = ref(false)
const categoriesSection = ref<HTMLElement | null>(null)
const hoveredCategoryId = ref<Category['id'] | null>(null)
const focusedCategoryId = ref<Category['id'] | null>(null)
const ringCollectionPreviewImage = ref<string | null>(null)
const occasionPreviewImage = ref<string | null>(null)
const selectedOccasionImage = ref<string | null>(null)
const designPrompt = ref('')
const designChatMessages = ref<DesignChatMessage[]>([])
const designChatLoading = ref(false)
const designChatNotice = ref('')
const preparedPrompt = ref('')
const designMatches = ref<CatalogProduct[]>([])
const designSearchState = ref<'idle' | 'loading' | 'results'>('idle')
const requestedProductSku = ref<string | null>(null)
const cartItems = ref<CartItem[]>([])
const cartOpen = ref(false)
const checkoutStep = ref<'cart' | 'details' | 'complete'>('cart')
const testOrderNumber = ref('')
const checkoutForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  city: '',
  address: '',
})
const promptExamples = [
  'İnce, zarif bir yüzük; küçük bir yıldız detayı olsun',
  'Modern çizgili, kişiye özel bir kolye istiyorum',
  'Günlük kullanıma uygun sade bir bileklik',
]
const featuredStorageKey = 'alvya:featured-14k-ring'
const catalogPriceFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})
const catalogWeightFormatter = new Intl.NumberFormat('tr-TR', {
  maximumFractionDigits: 2,
})
const cartCount = computed(() =>
  cartItems.value.reduce((total, item) => total + item.quantity, 0),
)
const cartTotalMinor = computed(() =>
  cartItems.value.reduce(
    (total, item) => total + item.product.priceMinor * item.quantity,
    0,
  ),
)

function formatCatalogWeight(weightGr: number) {
  return `${catalogWeightFormatter.format(weightGr)} gr`
}
let previousFeaturedSku: string | null = null
let designSearchTimer: ReturnType<typeof setTimeout> | null = null

function cancelDesignSearchTimer() {
  if (!designSearchTimer) return
  clearTimeout(designSearchTimer)
  designSearchTimer = null
}

function resetDesignSearch() {
  cancelDesignSearchTimer()
  designSearchState.value = 'idle'
  preparedPrompt.value = ''
  designMatches.value = []
}

onBeforeUnmount(cancelDesignSearchTimer)

try {
  previousFeaturedSku = sessionStorage.getItem(featuredStorageKey)
} catch {
  // The preview still works when browser storage is unavailable.
}

const featuredRing = pickFeatured14KRing(previousFeaturedSku)
const fallbackCategoryImages: Partial<Record<Category['id'], string>> = {
  ring: resolveMediaUrl('/products/featured-ring.png'),
  bracelet: resolveMediaUrl('/products/featured-bracelet.png'),
  bangle: resolveMediaUrl('/products/featured-bangle.png'),
  necklace: resolveMediaUrl('/products/featured-necklace.png'),
  earring: resolveMediaUrl('/products/featured-earring.png'),
}

const featuredCategoryImages = Object.fromEntries(
  categories.map((category) => [
    category.id,
    pickFeaturedProductForCategory(category.id)?.imageUrl ??
      fallbackCategoryImages[category.id] ??
      null,
  ]),
) as Record<Category['id'], string | null>

function featuredImageForCategory(categoryId: Category['id']): string | null {
  return featuredCategoryImages[categoryId] ?? null
}

const previewCategoryId = computed(
  () => hoveredCategoryId.value ?? focusedCategoryId.value,
)
const previewImage = computed(
  () =>
    ringCollectionPreviewImage.value ??
    occasionPreviewImage.value ??
    selectedOccasionImage.value ??
    (selectedCategory.value || !previewCategoryId.value
      ? null
      : featuredImageForCategory(previewCategoryId.value)),
)
const designChatSearchPrompt = computed(() =>
  designChatMessages.value
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .join('. '),
)

try {
  if (featuredRing)
    sessionStorage.setItem(featuredStorageKey, featuredRing.sourceSku)
} catch {
  // The selected image remains stable for this page view.
}

async function selectCategory(
  category: Category,
  initialProductSku: string | null = null,
) {
  cancelDesignSearchTimer()
  designSearchState.value = 'idle'
  hoveredCategoryId.value = null
  focusedCategoryId.value = null
  ringCollectionPreviewImage.value = null
  requestedProductSku.value = initialProductSku
  selectedCategory.value = category
  await nextTick()
  categoriesSection.value
    ?.querySelector<HTMLElement>('#discovery-title')
    ?.focus()
}

async function showCategories() {
  resetDesignSearch()
  const categoryId = selectedCategory.value?.id
  ringCollectionPreviewImage.value = null
  requestedProductSku.value = null
  selectedCategory.value = null
  await nextTick()
  categoriesSection.value
    ?.querySelector<HTMLButtonElement>(`[data-category-id="${categoryId}"]`)
    ?.focus()
}

function showHome() {
  resetDesignSearch()
  menuOpen.value = false
  hoveredCategoryId.value = null
  focusedCategoryId.value = null
  ringCollectionPreviewImage.value = null
  occasionPreviewImage.value = null
  selectedCategory.value = null
  requestedProductSku.value = null
}

async function selectMenuItem(item: CategoryMenuItem) {
  menuOpen.value = false
  if (!item.categoryId) return

  const category = categories.find(({ id }) => id === item.categoryId)
  if (category) await selectCategory(category)
}

function prepareDesignPrompt(promptOverride?: string) {
  const prompt = (promptOverride ?? designPrompt.value).trim()
  if (!prompt) return
  cancelDesignSearchTimer()
  preparedPrompt.value = prompt
  designMatches.value = []
  designSearchState.value = 'loading'
  designSearchTimer = setTimeout(() => {
    designMatches.value = searchProductsByPrompt(prompt)
    designSearchState.value = 'results'
    designSearchTimer = null
  }, 1800)
}

async function sendDesignChatMessage() {
  const prompt = designPrompt.value.trim()
  if (!prompt || designChatLoading.value) return

  designChatMessages.value.push({ role: 'user', content: prompt })
  designPrompt.value = ''
  designChatNotice.value = ''
  designChatLoading.value = true

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: designChatMessages.value }),
    })
    const payload = (await response.json()) as {
      reply?: string
      error?: string
    }
    if (!response.ok || !payload.reply) throw new Error(payload.error)
    designChatMessages.value.push({ role: 'assistant', content: payload.reply })
  } catch {
    designChatMessages.value.push({
      role: 'assistant',
      content:
        'Tarifini aldım. İstersen mevcut kataloğumuzdaki en yakın ürünleri hemen gösterebilirim.',
    })
    designChatNotice.value =
      'Yapay zeka danışmanı henüz etkin değil; katalog araması kullanılabilir.'
  } finally {
    designChatLoading.value = false
  }
}

function usePromptExample(example: string) {
  designPrompt.value = example
  preparedPrompt.value = ''
  designMatches.value = []
}

function clearPreparedPrompt() {
  resetDesignSearch()
}

async function editDesignPrompt() {
  resetDesignSearch()
  await nextTick()
  document.querySelector<HTMLTextAreaElement>('#design-prompt-input')?.focus()
}

async function openDesignMatch(product: CatalogProduct) {
  const category = categories.find(({ id }) => id === product.categoryId)
  if (!category) return
  await selectCategory(category, product.sourceSku)
}

function openCart() {
  cartOpen.value = true
  if (checkoutStep.value === 'complete') checkoutStep.value = 'cart'
}

function closeCart() {
  cartOpen.value = false
}

function addToCart(product: CatalogProduct) {
  const existingItem = cartItems.value.find(
    (item) => item.product.sourceSku === product.sourceSku,
  )
  if (existingItem) existingItem.quantity += 1
  else cartItems.value.push({ product, quantity: 1 })
  checkoutStep.value = 'cart'
  cartOpen.value = true
}

function changeCartQuantity(sourceSku: string, change: number) {
  const item = cartItems.value.find(
    (cartItem) => cartItem.product.sourceSku === sourceSku,
  )
  if (!item) return
  item.quantity += change
  if (item.quantity <= 0) removeFromCart(sourceSku)
}

function removeFromCart(sourceSku: string) {
  cartItems.value = cartItems.value.filter(
    (item) => item.product.sourceSku !== sourceSku,
  )
}

function completeTestOrder() {
  testOrderNumber.value = `ALV-${Date.now().toString().slice(-6)}`
  checkoutStep.value = 'complete'
}

function finishTestOrder() {
  cartItems.value = []
  checkoutStep.value = 'cart'
  testOrderNumber.value = ''
  cartOpen.value = false
  Object.assign(checkoutForm, {
    fullName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  })
}
</script>

<template>
  <main
    v-if="designSearchState === 'loading'"
    class="design-search-loading"
    aria-labelledby="design-search-message"
  >
    <div class="design-search-loading-inner" role="status" aria-live="polite">
      <div class="design-search-brand" aria-label="ALVYA">
        <span class="brand-mark" aria-hidden="true"></span>
        <strong>ALVYA</strong>
      </div>
      <span class="search-spark" aria-hidden="true">✦</span>
      <p id="design-search-message">Tarifinize en yakın ürünler aranıyor</p>
      <div
        class="design-search-progress"
        role="progressbar"
        aria-label="Ürünler aranıyor"
      >
        <span></span>
      </div>
      <small>Birazdan sizin için seçtiklerimizi göstereceğiz ♡</small>
    </div>
  </main>

  <template v-else>
    <header class="site-header">
      <div class="utility-bar">
        <nav class="utility-links" aria-label="Hızlı bağlantılar">
          <a href="#iletisim">İletişim</a>
        </nav>
        <a class="utility-message" href="#kategoriler">
          Her tarz. Her an. Tek yerde.
        </a>
        <button class="language-button" type="button" aria-label="Dil seçimi">
          TR
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
        </button>
      </div>

      <div class="main-navigation">
        <div
          class="category-menu"
          @pointerenter="menuOpen = true"
          @pointerleave="menuOpen = false"
        >
          <button
            class="menu-trigger"
            type="button"
            aria-label="Kategorileri aç"
            aria-controls="category-dropdown"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <span></span><span></span><span></span>
          </button>
          <div
            id="category-dropdown"
            class="category-dropdown"
            :class="{ 'is-open': menuOpen }"
          >
            <div class="dropdown-heading">
              <span>Kategoriler</span>
              <small>Tarzını keşfet</small>
            </div>
            <nav aria-label="Ürün kategorileri">
              <a
                v-for="item in categoryMenuItems"
                :key="item.label"
                :href="item.href"
                @click="selectMenuItem(item)"
              >
                {{ item.label }}
                <span aria-hidden="true">→</span>
              </a>
            </nav>
          </div>
        </div>

        <a
          class="brand"
          href="#ana-sayfa"
          aria-label="ALVYA ana sayfa"
          @click="showHome"
        >
          <span class="brand-mark" aria-hidden="true"></span>
          <span>ALVYA</span>
        </a>

        <nav class="collection-links" aria-label="Koleksiyon bağlantıları">
          <a href="#kategoriler">Kadın</a>
          <a href="#kategoriler">Erkek</a>
          <a href="#kategoriler">Genç</a>
          <a href="#kategoriler">Çocuk</a>
        </nav>

        <div class="header-actions">
          <label class="header-search">
            <span class="visually-hidden">Ürün ara</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input type="search" placeholder="Ara" />
          </label>
          <a href="#favoriler" aria-label="Favoriler">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"
              />
            </svg>
            <span>Favoriler</span>
          </a>
          <a href="#hesap" aria-label="Hesabım">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            <span>Hesap</span>
          </a>
          <a
            href="#sepet"
            :aria-label="`Sepet, ${cartCount} ürün`"
            @click.prevent="openCart"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 8h14l1 13H4L5 8Z" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" />
            </svg>
            <span>Sepet ({{ cartCount }})</span>
          </a>
        </div>
      </div>
    </header>

    <main id="ana-sayfa" class="page-content">
      <section
        v-if="designSearchState === 'results'"
        id="tarif-sonuclari"
        class="design-search-results"
        aria-labelledby="design-results-title"
      >
        <button
          class="design-results-back"
          type="button"
          @click="editDesignPrompt"
        >
          ← Tarifini düzenle
        </button>
        <div class="design-results-heading">
          <span aria-hidden="true">✦</span>
          <p>ALVYA SEÇKİSİ</p>
          <h1 id="design-results-title">Tarifine en yakın ürünler</h1>
          <blockquote>“{{ preparedPrompt }}”</blockquote>
          <small v-if="designMatches.length">
            Stok kataloğumuzda sana yakın {{ designMatches.length }} seçenek
            bulduk.
          </small>
          <small v-else>
            Yakın bir ürün bulamadık. İsteğini özel tasarım talebine
            dönüştürebiliriz.
          </small>
        </div>
        <ul
          v-if="designMatches.length"
          class="prompt-product-grid design-results-grid"
        >
          <li v-for="product in designMatches" :key="product.sourceSku">
            <button type="button" @click="openDesignMatch(product)">
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.name"
                loading="lazy"
              />
              <span class="design-result-content">
                <strong>{{ product.name }}</strong>
                <span class="design-result-facts">
                  <span class="design-result-weight">
                    <small>Gramaj</small>
                    <b>{{ formatCatalogWeight(product.weightGr) }}</b>
                  </span>
                  <span class="design-result-price">
                    <small>Fiyat</small>
                    <b>{{
                      catalogPriceFormatter.format(product.priceMinor / 100)
                    }}</b>
                  </span>
                </span>
                <small v-if="product.available" class="design-result-stock">
                  ● Stokta
                </small>
                <em>Ürünü incele →</em>
              </span>
            </button>
          </li>
        </ul>
      </section>

      <template v-else>
        <Transition name="category-backdrop">
          <div
            v-if="previewImage"
            :key="previewImage"
            class="category-page-backdrop"
            :class="{ 'ring-collection-preview': ringCollectionPreviewImage }"
            aria-hidden="true"
          >
            <img :src="previewImage" alt="" />
          </div>
        </Transition>
        <section
          v-if="!selectedCategory"
          class="hero"
          aria-labelledby="page-title"
        >
          <div class="hero-copy">
            <p class="hero-kicker">Jewelry for every moment.</p>
            <h1 id="page-title">Sana yakışan takıyı birlikte bulalım.</h1>
            <p class="hero-description">
              Ayarını, stilini ve bütçeni söyle. ALVYA, farklı mağazaların
              mevcut ürünleri arasından sana en uygun seçenekleri hazırlasın.
            </p>
            <div class="hero-actions">
              <a class="hero-primary" href="#kategoriler">Takını bul</a>
              <a class="hero-secondary" href="#tarif-et">Aklındakini anlat</a>
            </div>
            <ul class="hero-notes" aria-label="ALVYA özellikleri">
              <li><span aria-hidden="true">✓</span> Bütçene göre sonuçlar</li>
              <li><span aria-hidden="true">✓</span> Mağazalar arası keşif</li>
              <li><span aria-hidden="true">✓</span> Yakın alternatifler</li>
            </ul>
          </div>
          <div class="hero-visual" aria-hidden="true">
            <span class="hero-orbit"></span>
            <span class="hero-product-image"></span>
            <div class="hero-caption">
              <small>ALVYA seçkisi</small>
              <strong>Tarzına göre, sana özel</strong>
            </div>
          </div>
        </section>

        <section
          v-if="!selectedCategory"
          class="trust-strip"
          aria-label="ALVYA yaklaşımı"
        >
          <article>
            <span aria-hidden="true">01</span>
            <div>
              <strong>Şeffaf ürün bilgisi</strong
              ><small>Ayar, gramaj ve taş detayları bir arada</small>
            </div>
          </article>
          <article>
            <span aria-hidden="true">02</span>
            <div>
              <strong>Stok odaklı keşif</strong
              ><small>Mevcut ürünlerden uygun seçenekler</small>
            </div>
          </article>
          <article>
            <span aria-hidden="true">03</span>
            <div>
              <strong>Fiyat ve stok doğrulaması</strong
              ><small>Siparişten önce güncel bilgi kontrolü</small>
            </div>
          </article>
          <article>
            <span aria-hidden="true">04</span>
            <div>
              <strong>Bulamazsan tarif et</strong
              ><small>İsteğini özel tasarım talebine dönüştür</small>
            </div>
          </article>
        </section>

        <section
          id="kategoriler"
          ref="categoriesSection"
          class="categories"
          :aria-labelledby="
            selectedCategory ? 'discovery-title' : 'category-title'
          "
        >
          <div v-if="!selectedCategory" class="section-heading">
            <p class="section-kicker">Kategoriden başla</p>
            <h2 id="category-title">Bugün ne arıyorsun?</h2>
            <p>
              Bir kategori seç; seni doğru ürünlere götüren kısa soruları
              yanıtla.
            </p>
          </div>

          <ul v-if="!selectedCategory" class="category-grid">
            <li v-for="category in categories" :key="category.id">
              <button
                class="category-card"
                type="button"
                :data-category-id="category.id"
                @pointerenter="hoveredCategoryId = category.id"
                @pointerleave="hoveredCategoryId = null"
                @focus="focusedCategoryId = category.id"
                @blur="focusedCategoryId = null"
                @click="selectCategory(category)"
              >
                <img
                  v-if="featuredImageForCategory(category.id)"
                  class="featured-product-background"
                  :src="featuredImageForCategory(category.id)!"
                  alt=""
                  aria-hidden="true"
                />
                <span class="card-label">{{ category.label }}</span>
              </button>
            </li>
          </ul>

          <DiscoveryFlow
            v-else
            :key="selectedCategory.id"
            :category-id="selectedCategory.id"
            :category-label="selectedCategory.label"
            :featured-ring-image="featuredRing?.imageUrl ?? null"
            :initial-product-sku="requestedProductSku"
            @preview-ring-collection="ringCollectionPreviewImage = $event"
            @back-to-categories="showCategories"
            @add-to-cart="addToCart"
          />
        </section>

        <section
          v-if="!selectedCategory"
          class="occasion-section"
          aria-labelledby="occasion-title"
        >
          <div class="occasion-heading">
            <p class="section-kicker">Anlamına göre keşfet</p>
            <h2 id="occasion-title">Her an için doğru parça</h2>
            <p>
              Hediye rehberlerinden ilham alan bu alan, koleksiyon verileri
              tamamlandığında doğrudan filtreli sonuçlara bağlanacak.
            </p>
          </div>
          <div class="occasion-grid">
            <a
              class="occasion-birthday"
              :class="{
                'occasion-selected':
                  selectedOccasionImage === '/occasions/birthday.webp',
              }"
              href="#kategoriler"
              @pointerenter="occasionPreviewImage = '/occasions/birthday.webp'"
              @pointerleave="occasionPreviewImage = null"
              @focus="occasionPreviewImage = '/occasions/birthday.webp'"
              @blur="occasionPreviewImage = null"
              @click.prevent="
                selectedOccasionImage = '/occasions/birthday.webp'
              "
            >
              <span>01</span><strong>Doğum günü</strong
              ><small>Hatırlanacak bir hediye</small>
            </a>
            <a
              class="occasion-anniversary"
              :class="{
                'occasion-selected':
                  selectedOccasionImage === '/occasions/anniversary.webp',
              }"
              href="#kategoriler"
              @pointerenter="
                occasionPreviewImage = '/occasions/anniversary.webp'
              "
              @pointerleave="occasionPreviewImage = null"
              @focus="occasionPreviewImage = '/occasions/anniversary.webp'"
              @blur="occasionPreviewImage = null"
              @click.prevent="
                selectedOccasionImage = '/occasions/anniversary.webp'
              "
            >
              <span>02</span><strong>Yıldönümü</strong
              ><small>Birlikte geçen zamana</small>
            </a>
            <a
              class="occasion-graduation"
              :class="{
                'occasion-selected':
                  selectedOccasionImage === '/occasions/graduation.webp',
              }"
              href="#kategoriler"
              @pointerenter="
                occasionPreviewImage = '/occasions/graduation.webp'
              "
              @pointerleave="occasionPreviewImage = null"
              @focus="occasionPreviewImage = '/occasions/graduation.webp'"
              @blur="occasionPreviewImage = null"
              @click.prevent="
                selectedOccasionImage = '/occasions/graduation.webp'
              "
            >
              <span>03</span><strong>Mezuniyet</strong
              ><small>Yeni bir başlangıca</small>
            </a>
            <a
              class="occasion-self-gift"
              :class="{
                'occasion-selected':
                  selectedOccasionImage === '/occasions/self-gift.webp',
              }"
              href="#kategoriler"
              @pointerenter="occasionPreviewImage = '/occasions/self-gift.webp'"
              @pointerleave="occasionPreviewImage = null"
              @focus="occasionPreviewImage = '/occasions/self-gift.webp'"
              @blur="occasionPreviewImage = null"
              @click.prevent="
                selectedOccasionImage = '/occasions/self-gift.webp'
              "
            >
              <span>04</span><strong>Kendin için</strong
              ><small>Tarzını tamamlayan seçim</small>
            </a>
          </div>
        </section>

        <section
          v-if="!selectedCategory"
          id="tarif-et"
          class="design-studio"
          aria-labelledby="design-studio-title"
        >
          <div class="design-studio-intro">
            <span class="studio-spark" aria-hidden="true">✦</span>
            <p class="studio-kicker">Bir fikirle başlar</p>
            <h2 id="design-studio-title">Aklındaki takıyı anlat.</h2>
            <p>
              Henüz vitrinde olmayan bir fikrin varsa, kendi kelimelerinle tarif
              et.
            </p>
          </div>

          <form class="design-prompt" @submit.prevent="sendDesignChatMessage">
            <div class="design-chat-greeting">
              <span class="design-chat-avatar" aria-hidden="true">
                <span class="brand-mark"></span>
              </span>
              <div>
                <strong>ALVYA</strong>
                <p>Merhaba ✦ Nasıl bir takı hayal ediyorsun?</p>
                <small>
                  Tarzını, rengini veya aklındaki küçük bir detayı
                  anlatabilirsin.
                </small>
              </div>
            </div>
            <div
              v-if="designChatMessages.length"
              class="design-chat-thread"
              aria-live="polite"
            >
              <article
                v-for="(message, index) in designChatMessages"
                :key="`${message.role}-${index}`"
                :class="`design-chat-message ${message.role}`"
              >
                <span>{{ message.content }}</span>
              </article>
              <article
                v-if="designChatLoading"
                class="design-chat-message assistant typing"
              >
                <span aria-label="ALVYA yanıt yazıyor">•••</span>
              </article>
            </div>
            <div class="prompt-examples" aria-label="Örnek fikirler">
              <button
                v-for="example in promptExamples"
                :key="example"
                type="button"
                @click="usePromptExample(example)"
              >
                {{ example }}
              </button>
            </div>
            <label class="prompt-input-label" for="design-prompt-input">
              Mesajın
            </label>
            <div class="prompt-input-wrap">
              <textarea
                id="design-prompt-input"
                v-model="designPrompt"
                rows="4"
                maxlength="1000"
                placeholder="Aklındaki takıyı buraya yaz..."
                @input="clearPreparedPrompt"
              ></textarea>
              <div class="prompt-composer-footer">
                <small>Detay verdikçe daha yakın ürünler bulabilirim</small>
                <span>{{ designPrompt.length }} / 1000</span>
                <button
                  class="prompt-submit"
                  type="submit"
                  :disabled="!designPrompt.trim()"
                  aria-label="Mesajı ALVYA danışmanına gönder"
                >
                  <span aria-hidden="true">↑</span>
                </button>
              </div>
            </div>
            <div v-if="designChatSearchPrompt" class="design-chat-actions">
              <small v-if="designChatNotice">{{ designChatNotice }}</small>
              <button
                class="chat-search-products"
                type="button"
                :disabled="designChatLoading"
                @click="prepareDesignPrompt(designChatSearchPrompt)"
              >
                Mevcut ürünlerde ara <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </section>

        <section
          v-if="!selectedCategory"
          class="service-callout"
          aria-labelledby="service-title"
        >
          <div>
            <p class="section-kicker">Karar vermek zorunda değilsin</p>
            <h2 id="service-title">Önce seçeneklerini daralt.</h2>
          </div>
          <p>
            Ürün bulucu; kategori, ayar, stil ve bütçe cevaplarını kullanarak
            uzun ürün listelerini daha anlaşılır bir seçkiye dönüştürür.
          </p>
          <a href="#kategoriler">
            Keşfe başla <span aria-hidden="true">→</span>
          </a>
        </section>
      </template>
    </main>

    <div
      v-if="cartOpen"
      id="sepet"
      class="checkout-overlay"
      @click.self="closeCart"
    >
      <section
        class="checkout-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <header class="checkout-header">
          <div>
            <p class="section-kicker">ALVYA TEST MAĞAZASI</p>
            <h2 id="checkout-title">
              {{ checkoutStep === 'cart' ? 'Sepetin' : 'Sipariş bilgileri' }}
            </h2>
          </div>
          <button type="button" aria-label="Sepeti kapat" @click="closeCart">
            ×
          </button>
        </header>

        <div v-if="checkoutStep === 'cart'" class="cart-step">
          <p v-if="!cartItems.length" class="cart-empty">
            Sepetin henüz boş. Beğendiğin ürünü inceleyip sepete ekleyebilirsin.
          </p>
          <ul v-else class="cart-items">
            <li v-for="item in cartItems" :key="item.product.sourceSku">
              <img
                v-if="item.product.imageUrl"
                :src="item.product.imageUrl"
                :alt="item.product.name"
              />
              <div class="cart-item-copy">
                <strong>{{ item.product.name }}</strong>
                <small>{{ item.product.sourceSku }}</small>
                <b>{{
                  catalogPriceFormatter.format(item.product.priceMinor / 100)
                }}</b>
              </div>
              <div class="cart-item-actions">
                <div class="quantity-control" aria-label="Ürün adedi">
                  <button
                    type="button"
                    aria-label="Adedi azalt"
                    @click="changeCartQuantity(item.product.sourceSku, -1)"
                  >
                    −
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button
                    type="button"
                    aria-label="Adedi artır"
                    @click="changeCartQuantity(item.product.sourceSku, 1)"
                  >
                    +
                  </button>
                </div>
                <button
                  class="cart-remove"
                  type="button"
                  @click="removeFromCart(item.product.sourceSku)"
                >
                  Kaldır
                </button>
              </div>
            </li>
          </ul>
          <div v-if="cartItems.length" class="cart-summary">
            <span>Ürün toplamı</span>
            <strong>{{
              catalogPriceFormatter.format(cartTotalMinor / 100)
            }}</strong>
            <small>
              Katalog fiyatıdır; stok ve güncel fiyat siparişten önce
              doğrulanacaktır.
            </small>
          </div>
          <button
            class="primary-button checkout-primary"
            type="button"
            :disabled="!cartItems.length"
            @click="checkoutStep = 'details'"
          >
            Test siparişine devam et
          </button>
        </div>

        <form
          v-else-if="checkoutStep === 'details'"
          class="checkout-form"
          @submit.prevent="completeTestOrder"
        >
          <button
            class="checkout-back"
            type="button"
            @click="checkoutStep = 'cart'"
          >
            ← Sepete dön
          </button>
          <div class="checkout-fields">
            <label>
              <span>Ad soyad</span>
              <input
                v-model="checkoutForm.fullName"
                required
                autocomplete="name"
              />
            </label>
            <label>
              <span>E-posta</span>
              <input
                v-model="checkoutForm.email"
                required
                type="email"
                autocomplete="email"
              />
            </label>
            <label>
              <span>Telefon</span>
              <input
                v-model="checkoutForm.phone"
                required
                type="tel"
                autocomplete="tel"
              />
            </label>
            <label>
              <span>Şehir</span>
              <input
                v-model="checkoutForm.city"
                required
                autocomplete="address-level2"
              />
            </label>
            <label class="checkout-address">
              <span>Teslimat adresi</span>
              <textarea
                v-model="checkoutForm.address"
                required
                rows="3"
                autocomplete="street-address"
              ></textarea>
            </label>
          </div>
          <div class="test-payment-card">
            <span aria-hidden="true">◇</span>
            <div>
              <strong>Test ödeme</strong>
              <small>
                Kart bilgisi istenmez ve gerçek tahsilat yapılmaz. Bu ekran
                yalnızca alışveriş akışını denemek içindir.
              </small>
            </div>
          </div>
          <button class="primary-button checkout-primary" type="submit">
            Test siparişi oluştur
          </button>
        </form>

        <div v-else class="order-complete" role="status">
          <span aria-hidden="true">✓</span>
          <p class="section-kicker">Akış başarıyla tamamlandı</p>
          <h3>Test siparişin hazır</h3>
          <p>
            Sipariş numaran <strong>{{ testOrderNumber }}</strong
            >. Herhangi bir ödeme veya gerçek sipariş oluşturulmadı.
          </p>
          <button
            class="primary-button checkout-primary"
            type="button"
            @click="finishTestOrder"
          >
            Alışverişe dön
          </button>
        </div>
      </section>
    </div>

    <footer class="site-footer">
      <div class="footer-brand">
        <a
          class="brand"
          href="#ana-sayfa"
          aria-label="ALVYA ana sayfa"
          @click="showHome"
        >
          <span class="brand-mark" aria-hidden="true"></span>
          <span>ALVYA</span>
        </a>
        <p>Her tarz. Her an. Tek yerde.</p>
        <small>Jewelry for every moment.</small>
      </div>
      <nav aria-label="ALVYA bağlantıları">
        <div>
          <strong>Keşfet</strong><a href="#kategoriler">Kategoriler</a
          ><a href="#tarif-et">Özel tasarım</a
          ><a href="#kategoriler">Yeni gelenler</a>
        </div>
        <div>
          <strong>Destek</strong><a href="#siparis-takip">Sipariş takibi</a
          ><a href="#iletisim">İletişim</a
          ><a href="#beden-rehberi">Ölçü rehberi</a>
        </div>
        <div>
          <strong>ALVYA</strong><a href="#magazalar">Partner mağazalar</a
          ><a href="#hakkimizda">Hakkımızda</a
          ><a href="#guvenlik">Güvenli alışveriş</a>
        </div>
      </nav>
      <div class="footer-bottom">
        <span>© 2026 ALVYA</span
        ><span>Gizlilik · Mesafeli Satış · Çerezler</span>
      </div>
    </footer>
  </template>
</template>
