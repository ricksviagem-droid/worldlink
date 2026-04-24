export type NpcId = 'rick' | 'valentina' | 'bartender' | 'waiter'

export interface NpcDef {
  id: NpcId
  name: string
  role: string
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
    role: 'Owner',
    bodyColor: '#f5e0b0',   // linen shirt
    headColor: '#c8855a',   // warm skin
    hairColor: '#3a1a08',   // dark brown
    pantsColor: '#1e3a5a',  // navy chinos
    position: [0, 0, 6],
  },
  {
    id: 'valentina',
    name: 'Valentina',
    role: 'Guest',
    bodyColor: '#f4a0c0',   // pink top
    headColor: '#d88060',   // warm skin
    hairColor: '#100808',   // near-black
    pantsColor: '#f0e4f0',  // light mauve shorts
    position: [-5, 0, -2],
  },
  {
    id: 'bartender',
    name: 'Bartender',
    role: 'Bartender',
    bodyColor: '#1a1a1a',   // black shirt
    headColor: '#c49060',   // tan skin
    hairColor: '#0a0808',   // black
    pantsColor: '#111118',  // black pants
    position: [13.5, 0, -2],
  },
  {
    id: 'waiter',
    name: 'Waiter',
    role: 'Waiter',
    bodyColor: '#2c3e50',   // dark slate shirt
    headColor: '#d0905c',   // medium skin
    hairColor: '#1a0c08',   // very dark brown
    pantsColor: '#1a2030',  // dark navy pants
    position: [5, 0, 1],
  },
]

export const TALK_DISTANCE = 4.5
