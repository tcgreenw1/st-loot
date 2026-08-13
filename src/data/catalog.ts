export type LootBox = {
  id: string
  name: string
  eyebrow: string
  description: string
  price: number
  value: string
  family: 'Fresh' | 'Warm' | 'Rare'
  accent: string
  featured?: boolean
  notes: string[]
  prizeCount: number
}

export const lootBoxes: LootBox[] = [
  {
    id: 'discovery-drop',
    name: 'Discovery Drop',
    eyebrow: 'The first spritz',
    description: 'A guaranteed fragrance discovery from an emerging perfume house.',
    price: 25,
    value: '$25–$60 value',
    family: 'Fresh',
    accent: '#c8efff',
    notes: ['Citrus', 'Mineral', 'Clean musk'],
    prizeCount: 12,
  },
  {
    id: 'signature-vault',
    name: 'Signature Vault',
    eyebrow: 'Most loved',
    description: 'Full bottles, travel sets, and limited discovery collections.',
    price: 50,
    value: '$50–$140 value',
    family: 'Warm',
    accent: '#d8ff62',
    featured: true,
    notes: ['Amber', 'Sandalwood', 'Vanilla'],
    prizeCount: 18,
  },
  {
    id: 'collectors-edit',
    name: "Collector's Edit",
    eyebrow: 'Small batch',
    description: 'Rare editions and premium bottles selected for fragrance collectors.',
    price: 100,
    value: '$100–$300 value',
    family: 'Rare',
    accent: '#d7c7ff',
    notes: ['Oud', 'Saffron', 'Dark rose'],
    prizeCount: 10,
  },
  {
    id: 'daylight-set',
    name: 'Daylight Set',
    eyebrow: 'Easy everyday',
    description: 'Bright, versatile fragrances designed for the everyday rotation.',
    price: 35,
    value: '$35–$85 value',
    family: 'Fresh',
    accent: '#ffe6a7',
    notes: ['Bergamot', 'Neroli', 'Cedar'],
    prizeCount: 14,
  },
  {
    id: 'after-hours',
    name: 'After Hours',
    eyebrow: 'A little bolder',
    description: 'Statement scents, rich woods, and memorable night-out bottles.',
    price: 65,
    value: '$65–$175 value',
    family: 'Warm',
    accent: '#ffb8a7',
    notes: ['Tobacco', 'Tonka', 'Leather'],
    prizeCount: 16,
  },
  {
    id: 'atelier-reserve',
    name: 'Atelier Reserve',
    eyebrow: 'By invitation',
    description: 'A rotating edit of hard-to-find bottles from independent perfumers.',
    price: 150,
    value: '$150–$450 value',
    family: 'Rare',
    accent: '#bdebd2',
    notes: ['Incense', 'Iris', 'Resin'],
    prizeCount: 8,
  },
]

