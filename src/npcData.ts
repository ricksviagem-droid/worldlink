export type NpcId = 'rick' | 'valentina' | 'bartender' | 'waiter'

export interface NpcDef {
  id: NpcId
  name: string
  role: string
  bodyColor: string
  headColor: string
  position: [number, number, number]
}

export const NPCS: NpcDef[] = [
  {
    id: 'rick',
    name: 'Rick',
    role: 'Owner',
    bodyColor: '#f5e0b0',
    headColor: '#c8855a',
    position: [0, 0, 6],
  },
  {
    id: 'valentina',
    name: 'Valentina',
    role: 'Guest',
    bodyColor: '#f4a0c0',
    headColor: '#d88060',
    position: [-5, 0, -2],
  },
  {
    id: 'bartender',
    name: 'Bartender',
    role: 'Bartender',
    bodyColor: '#1a1a1a',
    headColor: '#c49060',
    position: [13.5, 0, -2],
  },
  {
    id: 'waiter',
    name: 'Waiter',
    role: 'Waiter',
    bodyColor: '#2c3e50',
    headColor: '#d0905c',
    position: [5, 0, 1],
  },
]

export const TALK_DISTANCE = 4.5
