/* eslint-disable @typescript-eslint/no-explicit-any */
import { FurnitureItem, Project, Wall } from "@/types";

const STORAGE_KEY = 'blueprint3d-project';

export const saveProject = (project: Project): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (error) {
    console.error('Failed to save project:', error);
    throw new Error('Failed to save project');
  }
};

export const loadProject = (): Project | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const project = JSON.parse(saved) as Project;
    return validateProject(project) ? project : null;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
};

const validateProject = (project: any): project is Project => {
  return (
    project &&
    Array.isArray(project.walls) &&
    Array.isArray(project.furniture) &&
    typeof project.floorMaterial === 'string' &&
    typeof project.wallColor === 'string'
  );
};

export const createDefaultWalls = (): Wall[] => [
  { start: { x: -500, z: -500 }, end: { x: 500, z: -500 } },
  { start: { x: 500, z: -500 }, end: { x: 500, z: 500 } },
  { start: { x: 500, z: 500 }, end: { x: -500, z: 500 } },
  { start: { x: -500, z: 500 }, end: { x: -500, z: -500 } }
];

export const createDefaultFurniture = (): FurnitureItem[] => [
  { id: 1, name: 'Sofa', x: 0, y: -200, width: 160, height: 80, locked: false },
  { id: 2, name: 'Table', x: 0, y: 100, width: 120, height: 120, locked: false },
  { id: 3, name: 'Chair', x: -150, y: 100, width: 60, height: 60, locked: false },
  { id: 4, name: 'Chair', x: 150, y: 100, width: 60, height: 60, locked: false },
  { id: 5, name: 'Bed', x: 300, y: 0, width: 140, height: 200, locked: false }
];

export const generateFurnitureId = (): number => Date.now();

export const createFurnitureItem = (
  name: string,
  width: number,
  height: number,
  x?: number,
  y?: number
): FurnitureItem => ({
  id: generateFurnitureId(),
  name,
  x: x ?? Math.random() * 200 - 100,
  y: y ?? Math.random() * 200 - 100,
  width,
  height,
  locked: false
});
