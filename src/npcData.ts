export type NpcId = 'rick' | 'valentina' | 'bartender' | 'waiter'

export interface NpcDef {
  id: NpcId
  name: string
  role: string
  age: number
  bio: string
  personality: string
  interests: string[]
  story: string
  bodyColor: string
  headColor: string
  hairColor: string
  pantsColor: string
  position: [number, number, number]
}

export const NPCS: NpcDef[] = [
  {
    id: 'rick',
    name: 'Rick',
    role: 'Dono • Casa Blanca',
    age: 42,
    bio: 'Apaixonado por música, cocktails e fazer cada hóspede se sentir especial. Fundou o Casa Blanca após uma viagem inesquecível a Ibiza.',
    personality: 'Carismático · Exigente · Bom humor',
    interests: ['🍹 Cocktails', '🎵 Music', '✈️ Travel', '💃 Dancing', '🌍 Languages'],
    story: 'Rick passou anos viajando pela Europa antes de abrir o Casa Blanca. Em Ibiza, descobriu o que queria para a vida — um lugar onde música, sol e boas conversas se encontram. Cada detalhe do clube foi escolhido por ele pessoalmente, desde a playlist até o formato das taças.',
    bodyColor: '#f5e0b0',
    headColor: '#c8855a',
    hairColor: '#3a1a08',
    pantsColor: '#1e3a5a',
    position: [0, 0, 6],
  },
  {
    id: 'valentina',
    name: 'Valentina',
    role: 'Influencer · Hóspede VIP',
    age: 28,
    bio: 'Criadora de conteúdo de lifestyle e viagem. Descobriu o Casa Blanca e nunca mais conseguiu ficar longe.',
    personality: 'Extrovertida · Criativa · Adora fotos',
    interests: ['📸 Photo', '✈️ Travel', '💃 Dancing', '🌊 Surfing', '🎵 Music'],
    story: 'Valentina chegou ao Casa Blanca por acidente numa viagem de trabalho e ficou encantada. Hoje, seu feed é quase um diário do clube — pôr do sol na piscina, cocktails artesanais e as histórias dos hóspedes que conhece. Ela diz que o Casa Blanca é o único lugar onde consegue desligar o celular por pelo menos cinco minutos.',
    bodyColor: '#f4a0c0',
    headColor: '#d88060',
    hairColor: '#100808',
    pantsColor: '#f0e4f0',
    position: [-5, 0, -2],
  },
  {
    id: 'bartender',
    name: 'Carlos',
    role: 'Bartender Chefe',
    age: 31,
    bio: 'Especialista em cocktails tropicais com 8 anos de experiência. Cada drinque é uma obra de arte.',
    personality: 'Tranquilo · Criativo · Sempre sorrindo',
    interests: ['🍹 Cocktails', '🎵 Music', '🌊 Surfing', '🍕 Food', '🤿 Diving'],
    story: 'Carlos cresceu numa cidade litorânea e aprendeu a primeira receita de cocktail com o pai aos 14 anos. Estudou mixologia em São Paulo e passou por bares premiados antes de encontrar o Casa Blanca. Aqui, ele criou o famoso "Sunset Spritz" — a bebida mais fotografada do clube.',
    bodyColor: '#1a1a1a',
    headColor: '#c49060',
    hairColor: '#0a0808',
    pantsColor: '#111118',
    position: [13.5, 0, -2],
  },
  {
    id: 'waiter',
    name: 'Lucas',
    role: 'Garçom · Estudante',
    age: 24,
    bio: 'Estudante de turismo que trabalha no Casa Blanca pra pagar a faculdade — e porque ama a praia.',
    personality: 'Animado · Prestativo · Cheio de energia',
    interests: ['🌍 Languages', '✈️ Travel', '🎮 Gaming', '🏖️ Beach', '💪 Fitness'],
    story: 'Lucas sonha em trabalhar em resorts de luxo ao redor do mundo. Por enquanto, usa cada dia no Casa Blanca como escola — aprende inglês com os turistas, estuda os hóspedes VIP e anota tudo num caderninho. Ele já recusou três empregos "sérios" porque nada paga em experiências o que a praia paga em felicidade.',
    bodyColor: '#2c3e50',
    headColor: '#d0905c',
    hairColor: '#1a0c08',
    pantsColor: '#1a2030',
    position: [5, 0, 1],
  },
]

export const TALK_DISTANCE = 4.5
