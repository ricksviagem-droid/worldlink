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
  glbUrl?: string
  glbScale?: number
  glbYOffset?: number
  glbTint?: string
  glbFacingOffset?: number
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
    glbUrl: '/model.glb',
    glbScale: 1.0,
    glbYOffset: 0,
    glbFacingOffset: Math.PI,
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
    glbUrl: '/Michelle.glb',
    glbScale: 1.0,
    glbYOffset: 0,
  },
  {
    id: 'bartender',
    name: 'Israel',
    role: 'Bartender · Alma Roqueira',
    age: 34,
    bio: 'Guitarrista que trocou o palco pelo balcão. Não foi derrota — foi upgrade. Pelo menos aqui as pessoas pagam a conta.',
    personality: 'Intenso · Honesto · Ácido com classe',
    interests: ['🎸 Heavy Metal', '🥃 Whisky', '💀 Black Sabbath', '🚬 Cigarro', '🎵 Rock Clássico'],
    story: 'Israel passou dez anos tentando fazer sucesso com a banda. Não deu. Mas aprendeu que por trás de um bom balcão você encontra as mesmas histórias que nas letras do Black Sabbath — só que com mais álcool na frente. Ainda toca toda sexta-feira numa garagem. Não convida ninguém.',
    bodyColor: '#0d0d0d',
    headColor: '#b07845',
    hairColor: '#0a0505',
    pantsColor: '#1a0a1a',
    position: [11, 0, 1],
    glbUrl: '/Xbot.glb',
    glbScale: 1.0,
    glbYOffset: 0,
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
    glbUrl: '/Soldier.glb',
    glbScale: 0.95,
    glbYOffset: 0,
  },
]

export const TALK_DISTANCE = 4.5
