import * as THREE from 'three';

export interface Wall {
  id?: string;
  start: { x: number; z: number };
  end: { x: number; z: number };
}

export interface FurnitureItem {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
}

export interface FurnitureType {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  width: number;
  height: number;
}

export interface ItemDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Project {
  walls: Wall[];
  furniture: FurnitureItem[];
  floorMaterial: string;
  wallColor: string;
}

export type ViewMode = '3d' | 'floorplan';
export type Mode = 'select' | 'move-walls' | 'draw-walls';
export type FloorMaterial = 'hardwood' | 'carpet' | 'tile' | 'concrete' | 'marble';

export interface Scene3DProps {
  mode: Mode;
  walls: Wall[];
  furniture: FurnitureItem[];
  selectedItem: FurnitureItem | null;
  onItemSelect: (item: FurnitureItem | null) => void;
  onItemMove: (id: number, x: number, y: number) => void;
  onWallDraw: (wall: Wall) => void;
  viewMode: ViewMode;
  floorMaterial: FloorMaterial;
  wallColor: string;
}

export interface ThreeRefs {
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  furnitureObjects: THREE.Object3D[];
  wallObjects: THREE.Object3D[];
}
