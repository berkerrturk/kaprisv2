export interface Category {
  id: 'ring' | 'bracelet' | 'bangle' | 'necklace' | 'earring'
  label: string
  symbol: string
}

export const categories: Category[] = [
  { id: 'ring', label: 'Yüzük', symbol: '◇' },
  { id: 'bracelet', label: 'Bileklik', symbol: '⌁' },
  { id: 'bangle', label: 'Bilezik', symbol: '◯' },
  { id: 'necklace', label: 'Kolye', symbol: '▽' },
  { id: 'earring', label: 'Küpe', symbol: '◌' },
]
