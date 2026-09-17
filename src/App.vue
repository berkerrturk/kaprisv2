<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import DiscoveryFlow from './components/DiscoveryFlow.vue'
import { categories, type Category } from './data/categories'
import { pickFeatured14KRing } from './data/productCatalog'

interface MenuItem {
  label: string
  href: string
}

const menuItems: MenuItem[] = [
  { label: 'Ana Sayfa', href: '#ana-sayfa' },
  { label: 'Kategoriler', href: '#kategoriler' },
  { label: 'İletişim', href: '#iletisim' },
]

const selectedCategory = ref<Category | null>(null)
const categoriesSection = ref<HTMLElement | null>(null)
const hoveredCategoryId = ref<Category['id'] | null>(null)
const focusedCategoryId = ref<Category['id'] | null>(null)
const ringCollectionPreviewImage = ref<string | null>(null)
const thinkingWomanImage = '/products/design-thinking-woman.png'
const designPrompt = ref('')
const preparedPrompt = ref('')
const promptExamples = [
  'İnce, zarif bir yüzük; küçük bir yıldız detayı olsun',
  'Modern çizgili, kişiye özel bir kolye istiyorum',
  'Günlük kullanıma uygun sade bir bileklik',
]
const featuredStorageKey = 'kapris:featured-14k-ring'
let previousFeaturedSku: string | null = null

try {
  previousFeaturedSku = sessionStorage.getItem(featuredStorageKey)
} catch {
  // The preview still works when browser storage is unavailable.
}

const featuredRing = pickFeatured14KRing(previousFeaturedSku)
const featuredCategoryImages: Partial<Record<Category['id'], string>> = {
  ring: '/products/featured-ring.png',
  bracelet: '/products/featured-bracelet.png',
  bangle: '/products/featured-bangle.png',
  necklace: '/products/featured-necklace.png',
  earring: '/products/featured-earring.png',
}

function featuredImageForCategory(categoryId: Category['id']): string | null {
  return featuredCategoryImages[categoryId] ?? null
}

const previewCategoryId = computed(
  () => hoveredCategoryId.value ?? focusedCategoryId.value,
)
const previewImage = computed(
  () =>
    ringCollectionPreviewImage.value ??
    (selectedCategory.value || !previewCategoryId.value
      ? null
      : featuredImageForCategory(previewCategoryId.value)),
)

try {
  if (featuredRing)
    sessionStorage.setItem(featuredStorageKey, featuredRing.sourceSku)
} catch {
  // The selected image remains stable for this page view.
}

async function selectCategory(category: Category) {
  hoveredCategoryId.value = null
  focusedCategoryId.value = null
  ringCollectionPreviewImage.value = null
  selectedCategory.value = category
  await nextTick()
  categoriesSection.value
    ?.querySelector<HTMLElement>('#discovery-title')
    ?.focus()
}

async function showCategories() {
  const categoryId = selectedCategory.value?.id
  ringCollectionPreviewImage.value = null
  selectedCategory.value = null
  await nextTick()
  categoriesSection.value
    ?.querySelector<HTMLButtonElement>(`[data-category-id="${categoryId}"]`)
    ?.focus()
}

function prepareDesignPrompt() {
  const prompt = designPrompt.value.trim()
  if (prompt) preparedPrompt.value = prompt
}

function usePromptExample(example: string) {
  designPrompt.value = example
  preparedPrompt.value = ''
}

function clearPreparedPrompt() {
  preparedPrompt.value = ''
}
</script>

<template>
  <header class="site-header">
    <nav aria-label="Ana menü">
      <ul class="menu">
        <li v-for="item in menuItems" :key="item.href">
          <a :href="item.href">{{ item.label }}</a>
        </li>
      </ul>
    </nav>
  </header>

  <main id="ana-sayfa" class="page-content">
    <Transition name="category-backdrop">
      <div
        v-if="previewImage"
        :key="previewCategoryId ?? ''"
        class="category-page-backdrop"
        :class="{ 'ring-collection-preview': ringCollectionPreviewImage }"
        aria-hidden="true"
      >
        <img :src="previewImage" alt="" />
      </div>
    </Transition>
    <section class="hero" aria-labelledby="page-title">
      <h1 id="page-title">Tarzını seç ya da tarif et</h1>
    </section>

    <section
      id="kategoriler"
      ref="categoriesSection"
      class="categories"
      :aria-labelledby="selectedCategory ? 'discovery-title' : 'category-title'"
    >
      <div v-if="!selectedCategory" class="section-heading">
        <h2 id="category-title">Ne arıyorsun?</h2>
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
        @preview-ring-collection="ringCollectionPreviewImage = $event"
        @back-to-categories="showCategories"
      />
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
          Henüz vitrinde olmayan bir fikrin varsa, kendi kelimelerinle tarif et.
        </p>
      </div>

      <form class="design-prompt" @submit.prevent="prepareDesignPrompt">
        <label for="design-prompt-input">Tasarım fikrin</label>
        <div class="prompt-input-wrap">
          <textarea
            id="design-prompt-input"
            v-model="designPrompt"
            rows="4"
            maxlength="1000"
            placeholder="Örneğin: İnce, 14 ayar, küçük taşlı bir yüzük..."
            @input="clearPreparedPrompt"
          ></textarea>
          <img
            class="thinking-woman"
            :src="thinkingWomanImage"
            alt=""
            aria-hidden="true"
          />
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
        <div class="prompt-footer">
          <span>{{ designPrompt.length }} / 1000</span>
          <button
            class="prompt-submit"
            type="submit"
            :disabled="!designPrompt.trim()"
          >
            Tarifi hazırla <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div v-if="preparedPrompt" class="prepared-prompt" role="status">
          <strong>Tarifin hazır</strong>
          <p>{{ preparedPrompt }}</p>
          <small>CAD üretimi henüz açık değil.</small>
        </div>
      </form>
    </section>
  </main>
</template>
