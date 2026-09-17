import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from './App.vue'
import {
  goldiumMinimalRings,
  goldiumRingsByCollection,
  pickFeatured14KRing,
} from './data/productCatalog'

describe('App', () => {
  it('shows the main heading', () => {
    const wrapper = mount(App)

    expect(wrapper.get('h1').text()).toBe('Tarzını seç ya da tarif et')
    expect(wrapper.text()).not.toContain(
      'Aradığın takıyı seçerek keşfetmeye başla.',
    )
    expect(wrapper.find('.brand').exists()).toBe(false)
    expect(wrapper.find('.hero .eyebrow').exists()).toBe(false)
  })

  it('lets visitors prepare a design description beneath the categories', async () => {
    const wrapper = mount(App)
    const prompt = wrapper.get('#design-prompt-input')

    expect(wrapper.get('.design-studio h2').text()).toBe(
      'Aklındaki takıyı anlat.',
    )
    expect(wrapper.get('.prompt-submit').attributes('disabled')).toBeDefined()
    await wrapper.get('.prompt-examples button').trigger('click')
    expect((prompt.element as HTMLTextAreaElement).value).toContain(
      'İnce, zarif',
    )
    await wrapper.get('.design-prompt').trigger('submit')
    expect(wrapper.get('.prepared-prompt').text()).toContain('İnce, zarif')
    await prompt.setValue('Yeni bir tasarım fikri')
    expect(wrapper.find('.prepared-prompt').exists()).toBe(false)
    await wrapper.get('[data-category-id="ring"]').trigger('click')
    expect(wrapper.find('.design-studio').exists()).toBe(false)
  })

  it('shows the primary navigation links', () => {
    const wrapper = mount(App)
    const links = wrapper.findAll('nav a')

    expect(links.map((link) => link.text())).toEqual([
      'Ana Sayfa',
      'Kategoriler',
      'İletişim',
    ])
  })

  it('shows every MVP category', () => {
    const wrapper = mount(App)
    const categoryButtons = wrapper.findAll('.category-card')

    expect(categoryButtons.map((button) => button.text())).toEqual([
      'Yüzük',
      'Bileklik',
      'Bilezik',
      'Kolye',
      'Küpe',
    ])
    expect(
      categoryButtons.every((button) => button.findAll('svg').length === 0),
    ).toBe(true)
  })

  it('previews each category photo across the page only while its card is active', async () => {
    const wrapper = mount(App)

    expect(wrapper.find('.category-page-backdrop').exists()).toBe(false)

    for (const category of [
      'ring',
      'bracelet',
      'bangle',
      'necklace',
      'earring',
    ]) {
      const card = wrapper.get(`[data-category-id="${category}"]`)
      await card.trigger('pointerenter')
      expect(wrapper.get('.category-page-backdrop img').attributes('src')).toBe(
        card.get('img').attributes('src'),
      )
    }

    await wrapper.get('[data-category-id="earring"]').trigger('click')
    expect(wrapper.find('.category-page-backdrop').exists()).toBe(false)
  })

  it('opens a ring category deck before karat cards and can return without scrolling', async () => {
    const wrapper = mount(App)
    const categoryRingImage = wrapper
      .get('[data-category-id="ring"] img')
      .attributes('src')

    expect(categoryRingImage).toBe('/products/featured-ring.png')
    expect(
      wrapper.get('[data-category-id="bracelet"] img').attributes('src'),
    ).toBe('/products/featured-bracelet.png')
    expect(
      wrapper.get('[data-category-id="bangle"] img').attributes('src'),
    ).toBe('/products/featured-bangle.png')
    expect(
      wrapper.get('[data-category-id="necklace"] img').attributes('src'),
    ).toBe('/products/featured-necklace.png')
    expect(
      wrapper.get('[data-category-id="earring"] img').attributes('src'),
    ).toBe('/products/featured-earring.png')

    await wrapper.get('[data-category-id="ring"]').trigger('click')

    expect(wrapper.findAll('.category-card')).toHaveLength(0)
    expect(wrapper.findAll('.ring-collection-card')).toHaveLength(8)
    expect(wrapper.get('legend').text()).toBe(
      'Hangi yüzük kategorisini arıyorsun?',
    )
    expect(wrapper.find('.category-page-backdrop').exists()).toBe(false)
    const minimalCard = wrapper.get('[data-ring-collection="minimal"]')
    await minimalCard.trigger('pointerenter')
    expect(wrapper.get('.category-page-backdrop img').attributes('src')).toBe(
      minimalCard.get('img').attributes('src'),
    )
    await minimalCard.trigger('pointerleave')
    expect(wrapper.find('.category-page-backdrop').exists()).toBe(false)
    await wrapper.get('[data-ring-collection="minimal"]').trigger('click')
    expect(wrapper.findAll('.karat-card')).toHaveLength(4)
    expect(wrapper.get('[data-karat="14"]').findAll('svg')).toHaveLength(0)
    expect(wrapper.get('[data-karat="8"]').findAll('svg')).toHaveLength(0)
    expect(wrapper.get('[data-karat="14"] img').attributes('src')).toMatch(
      /^\/products\/.+/,
    )
    expect(wrapper.get('[data-karat="14"] img').attributes('src')).not.toBe(
      categoryRingImage,
    )
    expect(wrapper.find('[data-karat="18"] img').exists()).toBe(false)
    expect(wrapper.get('.categories').attributes('aria-labelledby')).toBe(
      'discovery-title',
    )
    expect(wrapper.text()).not.toContain('Adım 1 / 3')
    expect(wrapper.find('.flow-actions .primary-button').exists()).toBe(false)

    await wrapper.get('.flow-actions .secondary-button').trigger('click')
    expect(wrapper.findAll('.ring-collection-card')).toHaveLength(8)
    await wrapper.get('.flow-actions .secondary-button').trigger('click')
    expect(wrapper.findAll('.category-card')).toHaveLength(5)
  })

  it('chooses a different 14 karat ring than the previous visit', () => {
    const first = pickFeatured14KRing(null, () => 0)
    const next = pickFeatured14KRing(first!.sourceSku, () => 0)

    expect(goldiumMinimalRings).toContainEqual(first)
    expect(next?.sourceSku).not.toBe(first?.sourceSku)
    expect(next?.goldKarat).toBe(14)
    expect(next?.imageUrl).toMatch(/^\/products\/.+/)
  })

  it('uses a product photo from every Goldium ring collection in the ring deck', async () => {
    expect(Object.values(goldiumRingsByCollection).flat()).toHaveLength(187)

    const wrapper = mount(App)
    await wrapper.get('[data-category-id="ring"]').trigger('click')
    const stoneCard = wrapper.get('[data-ring-collection="stone"]')

    expect(stoneCard.get('img').attributes('src')).toContain('cdn.shopify.com')
    await stoneCard.trigger('pointerenter')
    expect(wrapper.get('.category-page-backdrop').classes()).toContain(
      'ring-collection-preview',
    )
    expect(wrapper.get('.category-page-backdrop img').attributes('src')).toBe(
      stoneCard.get('img').attributes('src'),
    )
  })

  it('asks ring collection, gold karat, style and budget in order', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="ring"]').trigger('click')
    expect(
      wrapper.findAll('.ring-collection-card').map((card) => card.text()),
    ).toEqual([
      'Minimal Yüzük',
      'Tasarım Yüzük',
      'Taşlı Yüzük',
      'Mineli Yüzük',
      'Baget Yüzük',
      'Kalp Yüzük',
      'Yıldız Yüzük',
      'Harf Yüzük',
    ])
    await wrapper.get('[data-ring-collection="minimal"]').trigger('click')
    expect(wrapper.get('legend').text()).toBe(
      'Hangi altın ayarını tercih edersin?',
    )

    const goldOptions = wrapper.findAll('.karat-card')
    expect(
      goldOptions.map((option) => option.attributes('data-karat')),
    ).toEqual(['8', '14', '18', '22'])

    await wrapper.get('[data-karat="14"]').trigger('click')
    expect(wrapper.get('legend').text()).toBe('Hangi stili arıyorsun?')
    expect(wrapper.findAll('.style-card').map((card) => card.text())).toEqual([
      'MinimalSade çizgiler',
      'KlasikZamansız görünüm',
      'ModernYeni formlar',
      'İddialıDikkat çeken detaylar',
    ])
    expect(wrapper.find('.flow-actions .primary-button').exists()).toBe(false)
    const styleArtwork = wrapper
      .findAll('.style-card svg')
      .map((artwork) => artwork.html())
    expect(new Set(styleArtwork).size).toBe(4)

    await wrapper.get('.style-card').trigger('click')
    expect(wrapper.get('legend').text()).toBe('Bütçe aralığın nedir?')
    await wrapper.get('.flow-actions .secondary-button').trigger('click')
    expect(wrapper.get('.style-card[aria-pressed="true"]').text()).toContain(
      'Minimal',
    )
    await wrapper.get('.style-card[aria-pressed="true"]').trigger('click')
    expect(wrapper.get('legend').text()).toBe('Bütçe aralığın nedir?')
  })

  it('moves the money marker across three budget choices and summarizes an open upper range', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="ring"]').trigger('click')
    await wrapper.get('[data-ring-collection="minimal"]').trigger('click')
    await wrapper.get('[data-karat="14"]').trigger('click')
    await wrapper.get('.style-card').trigger('click')

    expect(wrapper.get('.budget-current').text()).toBe('5.000–10.000 ₺')
    expect(wrapper.findAll('.budget-stop')).toHaveLength(3)
    expect(
      wrapper.findAll('.budget-stop').map((stop) => stop.attributes('style')),
    ).toEqual(['left: 0.5rem;', 'left: 50%;', 'left: calc(100% - 0.5rem);'])
    expect(wrapper.get('.budget-money').attributes('style')).toContain(
      'left: 0.5rem',
    )
    expect(wrapper.get('.budget-money').attributes('style')).toContain(
      'scale(1)',
    )
    await wrapper.get('[name="budgetTier"]').setValue('1')
    expect(wrapper.get('.budget-current').text()).toBe('10.000–20.000 ₺')
    expect(wrapper.get('.budget-money').attributes('style')).toContain(
      'scale(1.3)',
    )
    expect(wrapper.get('.budget-money').attributes('style')).toContain(
      'left: 50%',
    )

    await wrapper.findAll('.budget-option')[2]!.trigger('click')
    expect(wrapper.get('.budget-current').text()).toBe('20.000 ₺ üzeri')
    expect(wrapper.get('.budget-money').attributes('style')).toContain(
      'scale(1.6)',
    )
    expect(wrapper.get('.budget-money').attributes('style')).toContain(
      'left: calc(100% - 0.5rem)',
    )
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('.answer-summary').text()).toContain('14 ayar')
    expect(wrapper.get('.answer-summary').text()).toContain('Minimal')
    expect(wrapper.get('.answer-summary').text()).toContain('20.000')
    expect(wrapper.get('.answer-summary').text()).toContain('üzeri')
    expect(wrapper.text()).toContain('uygun doğrulanmış örnek ürün henüz yok')
  })

  it('shows supplier rings inside Kapris and opens an internal product detail', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="ring"]').trigger('click')
    await wrapper.get('[data-ring-collection="minimal"]').trigger('click')
    await wrapper.get('[data-karat="14"]').trigger('click')
    await wrapper.get('.style-card').trigger('click')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('.results-heading h3').text()).toBe('42 yüzük bulundu')
    expect(wrapper.findAll('.result-card')).toHaveLength(12)
    expect(wrapper.get('.result-card').text()).toContain(
      '14 Ayar Altın Mini Kelebek Yüzük',
    )
    expect(wrapper.get('.result-card').text()).toContain('6.020')
    expect(wrapper.get('.result-card img').attributes('src')).toBe(
      '/products/Y89895.webp',
    )
    expect(wrapper.text()).not.toContain("Goldium'da incele")
    expect(wrapper.find('a[href*="goldium.com.tr"]').exists()).toBe(false)

    await wrapper.get('.results-more').trigger('click')
    expect(wrapper.findAll('.result-card')).toHaveLength(24)

    await wrapper.get('.result-card').trigger('click')
    expect(wrapper.get('.product-detail h2').text()).toBe(
      '14 Ayar Altın Mini Kelebek Yüzük',
    )
    expect(wrapper.get('.product-detail-specs').text()).toContain('0,83 gr')
    expect(wrapper.get('.product-detail-specs').text()).toContain('Zirkon')
    expect(
      wrapper.get('.product-detail .primary-button').attributes('disabled'),
    ).toBeDefined()
    expect(wrapper.find('a[href*="goldium.com.tr"]').exists()).toBe(false)

    await wrapper.get('.detail-back').trigger('click')
    expect(wrapper.findAll('.result-card')).toHaveLength(24)
  })

  it('keeps budget boundaries and does not show unverified combinations', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="ring"]').trigger('click')
    await wrapper.get('[data-ring-collection="minimal"]').trigger('click')
    await wrapper.get('[data-karat="14"]').trigger('click')
    await wrapper.get('.style-card').trigger('click')
    await wrapper.get('[name="budgetTier"]').setValue('1')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('.results-heading h3').text()).toBe('2 yüzük bulundu')
    expect(wrapper.text()).not.toContain('Tercihlerin hazır')
    expect(wrapper.get('.restart-top').text()).toBe('En başa dön')
    expect(wrapper.findAll('.result-card')).toHaveLength(2)
    expect(wrapper.get('.result-card').text()).toContain(
      'Renklı Taşlı Minimal Yüzük',
    )
    expect(wrapper.text()).not.toContain('14 Ayar Altın Mini Kelebek Yüzük')

    await wrapper.get('.restart-top').trigger('click')
    expect(wrapper.findAll('.category-card')).toHaveLength(5)
    await wrapper.get('[data-category-id="ring"]').trigger('click')
    await wrapper.get('[data-ring-collection="minimal"]').trigger('click')
    await wrapper.get('[data-karat="8"]').trigger('click')
    await wrapper.get('.style-card').trigger('click')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.findAll('.result-card')).toHaveLength(0)
    expect(wrapper.text()).toContain('uygun doğrulanmış örnek ürün henüz yok')
  })
})
