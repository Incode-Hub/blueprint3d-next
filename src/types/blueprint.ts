export interface FurnitureItem {
    id: number
    name: string
    x: number
    y: number
    width: number
    height: number
    locked: boolean
    rotation?: number
    color?: string
  }
  
  export interface Wall {
    start: { x: number; z: number }
    end: { x: number; z: number }
  }
  
  export interface ProjectData {
    walls: Wall[]
    furniture: FurnitureItem[]
    floorMaterial: string
    wallColor: string
  }
  
  export type ViewMode = '3d' | 'floorplan'
  export type InteractionMode = 'select' | 'move-walls' | 'draw-walls'
  export type FurnitureType = 'Sofa' | 'Bed' | 'Table' | 'Chair'