export type PrizePreview = {
  name: string
  value: string
  rarity: 'Common' | 'Rare' | 'Ultra rare'
}

export type LootBox = {
  id: string
  name: string
  kicker: string
  description: string
  price: number
  value: string
  family: 'Discovery' | 'Signature' | 'Rare'
  image: string
  accent: string
  glow: string
  featured?: boolean
  prizeCount: number
  impactEstimate: string
  prizes: PrizePreview[]
}

export const lootBoxes: LootBox[] = [
  {
    id: 'discovery-pulse',
    name: 'Discovery Pulse',
    kicker: 'Start here',
    description: 'Sample sets and travel sprays from the first partner drop.',
    price: 25,
    value: '$25–$65',
    family: 'Discovery',
    image: '/assets/discovery-pulse.jpg',
    accent: '#21b8ff',
    glow: 'rgba(22, 174, 255, .42)',
    prizeCount: 12,
    impactEstimate: '$6.75 est.',
    prizes: [
      { name: 'Discovery set', value: '$25', rarity: 'Common' },
      { name: 'Travel spray', value: '$45', rarity: 'Rare' },
      { name: 'Full-size bottle', value: '$65', rarity: 'Ultra rare' },
    ],
  },
  {
    id: 'blue-hour',
    name: 'Blue Hour',
    kicker: 'Most opened',
    description: 'Fresh signatures, full bottles, and after-dark favorites.',
    price: 50,
    value: '$50–$150',
    family: 'Signature',
    image: '/assets/blue-hour.jpg',
    accent: '#4a7dff',
    glow: 'rgba(52, 104, 255, .45)',
    featured: true,
    prizeCount: 18,
    impactEstimate: '$14.25 est.',
    prizes: [
      { name: 'Travel duo', value: '$50', rarity: 'Common' },
      { name: 'Signature bottle', value: '$95', rarity: 'Rare' },
      { name: 'Limited parfum', value: '$150', rarity: 'Ultra rare' },
    ],
  },
  {
    id: 'neon-bloom',
    name: 'Neon Bloom',
    kicker: 'New drop',
    description: 'Radiant florals, modern musks, and electric statement scents.',
    price: 75,
    value: '$75–$220',
    family: 'Signature',
    image: '/assets/neon-bloom.jpg',
    accent: '#8b6dff',
    glow: 'rgba(126, 82, 255, .42)',
    prizeCount: 16,
    impactEstimate: '$20.50 est.',
    prizes: [
      { name: 'Floral discovery edit', value: '$75', rarity: 'Common' },
      { name: 'Sculptural bottle', value: '$135', rarity: 'Rare' },
      { name: 'Collector edition', value: '$220', rarity: 'Ultra rare' },
    ],
  },
  {
    id: 'midnight-atelier',
    name: 'Midnight Atelier',
    kicker: 'Collector drop',
    description: 'Small-batch parfum and rare bottles for serious collectors.',
    price: 150,
    value: '$150–$500',
    family: 'Rare',
    image: '/assets/midnight-atelier.jpg',
    accent: '#d7b36a',
    glow: 'rgba(59, 93, 255, .38)',
    prizeCount: 8,
    impactEstimate: '$43.00 est.',
    prizes: [
      { name: 'Atelier parfum', value: '$150', rarity: 'Common' },
      { name: 'Numbered bottle', value: '$285', rarity: 'Rare' },
      { name: 'Archive edition', value: '$500', rarity: 'Ultra rare' },
    ],
  },
]
