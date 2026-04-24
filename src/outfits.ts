export interface Outfit {
  id: string
  name: string
  emoji: string
  bodyColor: string
  headColor: string
}

export interface PlayerProfile {
  name: string
  bio: string
  interests: string[]
  outfitId: string
  faceEmoji: string
}

export const OUTFITS: Outfit[] = [
  { id: 'beach',    name: 'Beach',     emoji: '🏖️', bodyColor: '#e67e22', headColor: '#f0c27f' },
  { id: 'party',    name: 'Party',     emoji: '🎉', bodyColor: '#9b59b6', headColor: '#f0c27f' },
  { id: 'sport',    name: 'Sport',     emoji: '💪', bodyColor: '#27ae60', headColor: '#d4a076' },
  { id: 'luxury',   name: 'Luxury',    emoji: '💎', bodyColor: '#1a1a2e', headColor: '#c8855a' },
  { id: 'tropical', name: 'Tropical',  emoji: '🌺', bodyColor: '#16a085', headColor: '#e8b88a' },
  { id: 'sunset',   name: 'Sunset',    emoji: '🌅', bodyColor: '#c0392b', headColor: '#f0c27f' },
  { id: 'ocean',    name: 'Ocean',     emoji: '🌊', bodyColor: '#2980b9', headColor: '#f0c27f' },
  { id: 'gold',     name: 'VIP Gold',  emoji: '👑', bodyColor: '#d4a017', headColor: '#c8855a' },
  { id: 'neon',     name: 'Neon',      emoji: '🌃', bodyColor: '#00c853', headColor: '#f0c27f' },
  { id: 'pink',     name: 'Pink',      emoji: '💕', bodyColor: '#e91e8c', headColor: '#d88060' },
  { id: 'dark',     name: 'Dark',      emoji: '🖤', bodyColor: '#2c3e50', headColor: '#95a5a6' },
  { id: 'white',    name: 'All White', emoji: '⭐', bodyColor: '#ecf0f1', headColor: '#c8a07a' },
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
