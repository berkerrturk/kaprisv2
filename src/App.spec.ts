import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'
import {
  goldiumMinimalRings,
  goldiumRingsByCollection,
  pickFeatured14KRing,
} from './data/productCatalog'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          reply: 'Harika. Tercih ettiğin altın ayarı nedir?',
        }),
      }),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows the main heading', () => {
    const wrapper = mount(App)

    expect(wrapper.get('h1').text()).toBe(
      'Sana yakışan takıyı birlikte bulalım.',
    )
    expect(wrapper.text()).not.toContain(
      'Aradığın takıyı seçerek keşfetmeye başla.',
    )
    expect(wrapper.get('.site-header .brand').text()).toBe('ALVYA')
    expect(wrapper.find('.brand-mark').exists()).toBe(true)
    expect(wrapper.get('.utility-message').text()).toBe(
      'Her tarz. Her an. Tek yerde.',
    )
    expect(wrapper.get('.hero-kicker').text()).toBe('Jewelry for every moment.')
    expect(wrapper.find('.hero .eyebrow').exists()).toBe(false)
  })

  it('presents guided discovery, trust details and occasion previews', async () => {
    const wrapper = mount(App)

    expect(wrapper.findAll('.trust-strip article')).toHaveLength(4)
    expect(
      wrapper.findAll('.occasion-grid a').map((link) => link.text()),
    ).toEqual([
      '01Doğum günüHatırlanacak bir hediye',
      '02YıldönümüBirlikte geçen zamana',
      '03MezuniyetYeni bir başlangıca',
      '04Kendin içinTarzını tamamlayan seçim',
    ])
    expect(wrapper.get('.service-callout').text()).toContain(
      'Önce seçeneklerini daralt.',
    )

    const graduation = wrapper.get('.occasion-graduation')
    await graduation.trigger('pointerenter')
    expect(wrapper.get('.category-page-backdrop img').attributes('src')).toBe(
      '/occasions/graduation.webp',
    )
    await graduation.trigger('pointerleave')
    expect(wrapper.find('.category-page-backdrop').exists()).toBe(false)
    await graduation.trigger('click')
    expect(graduation.classes()).toContain('occasion-selected')
    expect(wrapper.get('.category-page-backdrop img').attributes('src')).toBe(
      '/occasions/graduation.webp',
    )
  })

  it('lets visitors prepare a design description beneath the categories', async () => {
    vi.useFakeTimers()
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
    await flushPromises()
    expect(wrapper.findAll('.design-chat-message')).toHaveLength(2)
    expect(wrapper.get('.design-chat-thread').text()).toContain(
      'Tercih ettiğin altın ayarı nedir?',
    )
    await wrapper.get('.chat-search-products').trigger('click')
    expect(wrapper.get('.design-search-loading').text()).toContain(
      'Tarifinize en yakın ürünler aranıyor',
    )
    expect(wrapper.find('.site-header').exists()).toBe(false)
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
    await vi.advanceTimersByTimeAsync(1800)
    expect(wrapper.get('.design-search-results').text()).toContain(
      'İnce, zarif',
    )
    expect(wrapper.get('.design-search-results h1').text()).toBe(
      'Tarifine en yakın ürünler',
    )
    expect(wrapper.findAll('.prompt-product-grid li')).toHaveLength(4)
    expect(wrapper.findAll('.design-result-weight')).toHaveLength(4)
    expect(wrapper.get('.design-result-weight').text()).toMatch(/Gramaj.+gr/)
    expect(wrapper.get('.design-result-price').text()).toContain('₺')
    await wrapper.get('.design-results-back').trigger('click')
    expect(wrapper.find('.design-studio').exists()).toBe(true)
  })

  it('opens a matching catalog product before a custom design request', async () => {
    vi.useFakeTimers()
    const wrapper = mount(App)

    await wrapper.get('.prompt-examples button').trigger('click')
    await wrapper.get('.design-prompt').trigger('submit')
    await flushPromises()
    await wrapper.get('.chat-search-products').trigger('click')
    await vi.advanceTimersByTimeAsync(1800)
    const firstMatch = wrapper.get('.prompt-product-grid button')
    const productName = firstMatch.get('strong').text()

    await firstMatch.trigger('click')

    expect(wrapper.find('.design-studio').exists()).toBe(false)
    expect(wrapper.get('.product-detail h2').text()).toBe(productName)
    expect(wrapper.find('a[href*="goldium.com.tr"]').exists()).toBe(false)
  })

  it('shows the header navigation and every storefront category', async () => {
    const wrapper = mount(App)
    const trigger = wrapper.get('.menu-trigger')

    expect(
      wrapper.findAll('.collection-links a').map((link) => link.text()),
    ).toEqual(['Kadın', 'Erkek', 'Genç', 'Çocuk'])

    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(
      wrapper.findAll('.category-dropdown nav a').map((link) => link.text()),
    ).toEqual([
      'Yüzük →',
      'Bileklik →',
      'Bilezik →',
      'Kolye →',
      'Küpe →',
      'Charm →',
      'Takı Seti →',
      'İndirimli Ürünler →',
      'Erkek →',
      'Çocuk →',
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
      'Charm',
      'Takı Seti',
    ])
    expect(
      categoryButtons.every((button) => button.findAll('svg').length === 0),
    ).toBe(true)
  })

  it('returns to the home page when the ALVYA brand is selected', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="ring"]').trigger('click')
    expect(wrapper.findAll('.category-card')).toHaveLength(0)

    await wrapper.get('.site-header .brand').trigger('click')

    expect(wrapper.findAll('.category-card')).toHaveLength(7)
    expect(wrapper.get('.hero h1').text()).toBe(
      'Sana yakışan takıyı birlikte bulalım.',
    )
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
      'charm',
      'jewelry-set',
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

    expect(categoryRingImage).toMatch(/^\/products\/goldium\/.+/)
    expect(
      wrapper.get('[data-category-id="bracelet"] img').attributes('src'),
    ).toMatch(/^\/products\/goldium\/.+/)
    expect(
      wrapper.get('[data-category-id="bangle"] img').attributes('src'),
    ).toMatch(/^\/products\/goldium\/.+/)
    expect(
      wrapper.get('[data-category-id="necklace"] img').attributes('src'),
    ).toMatch(/^\/products\/goldium\/.+/)
    expect(
      wrapper.get('[data-category-id="earring"] img').attributes('src'),
    ).toMatch(/^\/products\/goldium\/.+/)

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
    expect(wrapper.findAll('.karat-card')).toHaveLength(5)
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
    expect(wrapper.findAll('.category-card')).toHaveLength(7)
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

    expect(stoneCard.get('img').attributes('src')).toMatch(
      /^\/products\/goldium\/.+/,
    )
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
    ).toEqual(['0', '8', '14', '18', '22'])

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

    expect(wrapper.get('.budget-current').text()).toBe('10.000 ₺ altı')
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

  it('shows supplier rings inside ALVYA and opens an internal product detail', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="ring"]').trigger('click')
    await wrapper.get('[data-ring-collection="minimal"]').trigger('click')
    await wrapper.get('[data-karat="14"]').trigger('click')
    await wrapper.get('.style-card').trigger('click')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('.results-heading h3').text()).toBe('46 yüzük bulundu')
    expect(wrapper.findAll('.result-card')).toHaveLength(12)
    expect(wrapper.get('.result-card').text()).toContain(
      '14 Ayar Altın Mini Kelebek Yüzük',
    )
    expect(wrapper.get('.result-card').text()).toContain('6.020')
    expect(wrapper.get('.result-card img').attributes('src')).toMatch(
      /^\/products\/goldium\/.+/,
    )
    expect(wrapper.get('.delivery-priority-card').text()).toContain(
      'Hızlı mı lazım?',
    )
    expect(wrapper.get('.result-card .stock-badge').text()).toBe('Stokta')
    expect(wrapper.get('.product-toolbar').text()).toContain(
      'Yalnızca stokta olanlar',
    )
    await wrapper.get('.result-sort select').setValue('price-desc')
    const sortedPrices = wrapper
      .findAll('.result-card-price')
      .map((price) => price.text())
    expect(sortedPrices.length).toBeGreaterThan(1)
    await wrapper.get('.result-sort select').setValue('recommended')
    await wrapper.get('.delivery-priority-action').trigger('click')
    expect(wrapper.get('.delivery-priority-card').classes()).toContain(
      'is-delivery-prioritized',
    )
    expect(wrapper.get('.results-heading').text()).toContain('Stoktakiler önce')
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
    ).toBeUndefined()
    expect(wrapper.find('a[href*="goldium.com.tr"]').exists()).toBe(false)

    await wrapper.get('.detail-back').trigger('click')
    expect(wrapper.findAll('.result-card')).toHaveLength(24)
  })

  it('completes the local cart and test checkout without taking payment', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="ring"]').trigger('click')
    await wrapper.get('[data-ring-collection="minimal"]').trigger('click')
    await wrapper.get('[data-karat="14"]').trigger('click')
    await wrapper.get('.style-card').trigger('click')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('.result-card').trigger('click')
    await wrapper.get('.product-add-button').trigger('click')

    expect(wrapper.get('.checkout-panel').text()).toContain('Sepetin')
    expect(wrapper.get('.header-actions a[href="#sepet"]').text()).toContain(
      'Sepet (1)',
    )
    await wrapper.get('.checkout-primary').trigger('click')

    await wrapper
      .get('.checkout-fields input[autocomplete="name"]')
      .setValue('Test Kullanıcı')
    await wrapper
      .get('.checkout-fields input[type="email"]')
      .setValue('test@example.com')
    await wrapper
      .get('.checkout-fields input[type="tel"]')
      .setValue('5555555555')
    await wrapper
      .get('.checkout-fields input[autocomplete="address-level2"]')
      .setValue('İstanbul')
    await wrapper.get('.checkout-fields textarea').setValue('Test adresi')
    await wrapper.get('.checkout-form').trigger('submit')

    expect(wrapper.get('.order-complete').text()).toContain(
      'Herhangi bir ödeme veya gerçek sipariş oluşturulmadı.',
    )
    expect(wrapper.get('.order-complete').text()).toContain('ALV-')
    await wrapper.get('.order-complete .checkout-primary').trigger('click')
    expect(wrapper.find('.checkout-panel').exists()).toBe(false)
    expect(wrapper.get('.header-actions a[href="#sepet"]').text()).toContain(
      'Sepet (0)',
    )
  })

  it('shows the full local catalog for a non-ring category', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="necklace"]').trigger('click')
    await wrapper.get('[data-karat="0"]').trigger('click')
    await wrapper.get('.style-card').trigger('click')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('.results-heading h3').text()).toContain('kolye bulundu')
    expect(wrapper.findAll('.result-card').length).toBeGreaterThan(0)
    expect(wrapper.get('.result-card img').attributes('src')).toMatch(
      /^\/products\/goldium\/.+/,
    )

    await wrapper.get('.result-card').trigger('click')
    expect(wrapper.get('.product-detail').text()).toContain('ALVYA seçkisi')
    expect(wrapper.find('a[href*="goldium.com.tr"]').exists()).toBe(false)
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
    expect(wrapper.findAll('.category-card')).toHaveLength(7)
    await wrapper.get('[data-category-id="ring"]').trigger('click')
    await wrapper.get('[data-ring-collection="minimal"]').trigger('click')
    await wrapper.get('[data-karat="8"]').trigger('click')
    await wrapper.get('.style-card').trigger('click')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.findAll('.result-card')).toHaveLength(0)
    expect(wrapper.text()).toContain('uygun doğrulanmış örnek ürün henüz yok')
  })
})
