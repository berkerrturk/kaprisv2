<script setup lang="ts">
import { ref } from 'vue'
import DiscoveryFlow from './components/DiscoveryFlow.vue'
import { categories, type Category } from './data/categories'

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

function selectCategory(category: Category) {
  selectedCategory.value = category
}
</script>

<template>
  <header class="site-header">
    <a class="brand" href="#ana-sayfa" aria-label="Kapris ana sayfa">Kapris</a>

    <nav aria-label="Ana menü">
      <ul class="menu">
        <li v-for="item in menuItems" :key="item.href">
          <a :href="item.href">{{ item.label }}</a>
        </li>
      </ul>
    </nav>
  </header>

  <main id="ana-sayfa" class="page-content">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Kapris V2</p>
      <h1 id="page-title">Hello World</h1>
      <p class="hero-copy">Aradığın takıyı seçerek keşfetmeye başla.</p>
    </section>

    <section
      id="kategoriler"
      class="categories"
      aria-labelledby="category-title"
    >
      <div class="section-heading">
        <p class="eyebrow">Kategoriler</p>
        <h2 id="category-title">Ne arıyorsun?</h2>
      </div>

      <ul class="category-grid">
        <li v-for="category in categories" :key="category.id">
          <button
            class="category-card"
            type="button"
            :data-category-id="category.id"
            :aria-pressed="selectedCategory?.id === category.id"
            @click="selectCategory(category)"
          >
            <span class="category-symbol" aria-hidden="true">{{
              category.symbol
            }}</span>
            <span>{{ category.label }}</span>
          </button>
        </li>
      </ul>
    </section>

    <DiscoveryFlow
      v-if="selectedCategory"
      :key="selectedCategory.id"
      :category-label="selectedCategory.label"
    />
  </main>
</template>
