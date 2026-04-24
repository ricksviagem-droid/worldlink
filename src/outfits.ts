export interface Outfit {
  id: string
  name: string
  emoji: string
  bodyColor: string  // shirt / top
  headColor: string  // skin tone
  hairColor: string
  pantsColor: string // shorts / pants
}

export interface PlayerProfile {
  name: string
  bio: string
  interests: string[]
  outfitId: string
  faceEmoji: string
}

export const OUTFITS: Outfit[] = [
  { id: 'beach',    name: 'Beach',     emoji: '🏖️', bodyColor: '#e67e22', headColor: '#f0c27f', hairColor: '#4a2810', pantsColor: '#c0aa72' },
  { id: 'party',    name: 'Party',     emoji: '🎉', bodyColor: '#9b59b6', headColor: '#f0c27f', hairColor: '#1a0818', pantsColor: '#1a1a2e' },
  { id: 'sport',    name: 'Sport',     emoji: '💪', bodyColor: '#27ae60', headColor: '#d4a076', hairColor: '#7a4a18', pantsColor: '#1a2a5a' },
  { id: 'luxury',   name: 'Luxury',    emoji: '💎', bodyColor: '#1a1a2e', headColor: '#c8855a', hairColor: '#0a0808', pantsColor: '#2a2a3e' },
  { id: 'tropical', name: 'Tropical',  emoji: '🌺', bodyColor: '#16a085', headColor: '#e8b88a', hairColor: '#2a1a08', pantsColor: '#f0e8d0' },
  { id: 'sunset',   name: 'Sunset',    emoji: '🌅', bodyColor: '#c0392b', headColor: '#f0c27f', hairColor: '#6a2810', pantsColor: '#1a0a0a' },
  { id: 'ocean',    name: 'Ocean',     emoji: '🌊', bodyColor: '#2980b9', headColor: '#f0c27f', hairColor: '#1a1a3a', pantsColor: '#0a1a3a' },
  { id: 'gold',     name: 'VIP Gold',  emoji: '👑', bodyColor: '#d4a017', headColor: '#c8855a', hairColor: '#3a1a08', pantsColor: '#d4c080' },
  { id: 'neon',     name: 'Neon',      emoji: '🌃', bodyColor: '#00c853', headColor: '#f0c27f', hairColor: '#0a0a18', pantsColor: '#0a0a0a' },
  { id: 'pink',     name: 'Pink',      emoji: '💕', bodyColor: '#e91e8c', headColor: '#d88060', hairColor: '#2a0818', pantsColor: '#f8d0e8' },
  { id: 'dark',     name: 'Dark',      emoji: '🖤', bodyColor: '#2c3e50', headColor: '#95a5a6', hairColor: '#0a0a12', pantsColor: '#111118' },
  { id: 'white',    name: 'All White', emoji: '⭐', bodyColor: '#ecf0f1', headColor: '#c8a07a', hairColor: '#c8a040', pantsColor: '#dde0e8' },
]

export const INTERESTS = [
  '🏖️ Beach', '🎵 Music', '🍹 Cocktails', '💃 Dancing',
  '🌊 Surfing', '📸 Photo', '✈️ Travel', '🍕 Food',
  '🎮 Gaming', '💪 Fitness', '🎨 Art', '🤿 Diving',
  '🧘 Yoga', '🌍 Languages', '🍷 Wine', '🎭 Vibes',
]

export const FACE_EMOJIS = ['😎', '🙂', '😄', '🤩', '🥳', '😏', '🤗', '😊', '🌟', '🏄', '💃', '🎯']

export const STORAGE_KEY = 'worldlink_profile_v2'

export const getOutfit = (id: string): Outfit => OUTFITS.find(o => o.id === id) ?? OUTFITS[0]
