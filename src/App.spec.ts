import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from './App.vue'

describe('App', () => {
  it('shows the main heading', () => {
    const wrapper = mount(App)

    expect(wrapper.get('h1').text()).toBe('Sana uygun takıyı bul')
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
      '◇Yüzük',
      '⌁Bileklik',
      '◯Bilezik',
      '▽Kolye',
      '◌Küpe',
    ])
  })

  it('asks gold karat, style and budget in order', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="ring"]').trigger('click')
    expect(wrapper.get('legend').text()).toBe(
      'Hangi altın ayarını tercih edersin?',
    )

    const goldOptions = wrapper.findAll('[name="goldKarat"]')
    expect(goldOptions.map((option) => option.attributes('value'))).toEqual([
      '8',
      '14',
      '18',
      '22',
    ])

    await wrapper.get('[name="goldKarat"][value="14"]').setValue()
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('legend').text()).toBe('Hangi stili arıyorsun?')

    await wrapper.get('#style').setValue('Minimal')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('legend').text()).toBe('Bütçe aralığın nedir?')
  })

  it('rejects an invalid budget and shows the selected search criteria', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-category-id="ring"]').trigger('click')
    await wrapper.get('[name="goldKarat"][value="14"]').setValue()
    await wrapper.get('form').trigger('submit')
    await wrapper.get('#style').setValue('Minimal')
    await wrapper.get('form').trigger('submit')

    await wrapper.get('[name="minBudget"]').setValue('10000')
    await wrapper.get('[name="maxBudget"]').setValue('5000')
    expect(wrapper.get('[type="submit"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[role="alert"]').text()).toContain('maksimum bütçe')

    await wrapper.get('[name="maxBudget"]').setValue('20000')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('.answer-summary').text()).toContain('14 ayar')
    expect(wrapper.get('.answer-summary').text()).toContain('Minimal')
    expect(wrapper.get('.answer-summary').text()).toContain('10.000')
    expect(wrapper.get('.answer-summary').text()).toContain('20.000')
    expect(wrapper.text()).toContain('Ürün kataloğu henüz eklenmediği')
  })
})
