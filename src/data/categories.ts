export interface Category {
  id:
    | 'ring'
    | 'bracelet'
    | 'bangle'
    | 'necklace'
    | 'earring'
    | 'charm'
    | 'jewelry-set'
  label: string
}

export const categories: Category[] = [
  { id: 'ring', label: 'Yüzük' },
  { id: 'bracelet', label: 'Bileklik' },
  { id: 'bangle', label: 'Bilezik' },
  { id: 'necklace', label: 'Kolye' },
  { id: 'earring', label: 'Küpe' },
  { id: 'charm', label: 'Charm' },
  { id: 'jewelry-set', label: 'Takı Seti' },
]
