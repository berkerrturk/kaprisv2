import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from './App.vue'

describe('App', () => {
  it('shows the main heading', () => {
    const wrapper = mount(App)

    expect(wrapper.get('h1').text()).toBe('Hello World')
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
})
