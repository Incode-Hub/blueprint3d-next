import { FloorMaterial, FurnitureItem, Project, Wall } from '@/types';
import { useCallback } from 'react';
import { saveProject as saveProjectUtil, loadProject as loadProjectUtil } from '@/lib/utils/project-utils';

interface UseProjectProps {
  walls: Wall[];
  furniture: FurnitureItem[];
  floorMaterial: FloorMaterial;
  wallColor: string;
  setWalls: (walls: Wall[]) => void;
  setFurniture: (furniture: FurnitureItem[]) => void;
  setFloorMaterial: (material: FloorMaterial) => void;
  setWallColor: (color: string) => void;
  setSelectedItem: (item: FurnitureItem | null) => void;
}

export const useProject = ({
  walls,
  furniture,
  floorMaterial,
  wallColor,
  setWalls,
  setFurniture,
  setFloorMaterial,
  setWallColor,
  setSelectedItem
}: UseProjectProps) => {
  const saveProject = useCallback(() => {
    try {
      const project: Project = { walls, furniture, floorMaterial, wallColor };
      saveProjectUtil(project);
      alert('Project saved successfully!');
    } catch (error) {
      alert('Failed to save project. Please try again.');
    }
  }, [walls, furniture, floorMaterial, wallColor]);

  const loadProject = useCallback(() => {
    try {
      const project = loadProjectUtil();
      if (project) {
        setWalls(project.walls);
        setFurniture(project.furniture);
        setFloorMaterial(project.floorMaterial as FloorMaterial);
        setWallColor(project.wallColor);
        setSelectedItem(null);
        alert('Project loaded successfully!');
      } else {
        alert('No saved project found.');
      }
    } catch (error) {
      alert('Failed to load project. Please try again.');
    }
  }, [setWalls, setFurniture, setFloorMaterial, setWallColor, setSelectedItem]);

  return { saveProject, loadProject };
};
