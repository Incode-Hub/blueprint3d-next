"use client"

import React, { useRef, useEffect } from 'react';
import { Scene3DProps } from '../types';
import { useThreeScene } from '../hooks/use-three-scene';
import { createFurnitureGeometry, createWallGeometry, getFloorMaterial, getItemColor } from '@/lib/utils/three-utils';
import * as THREE from 'three';

const Scene3D: React.FC<Scene3DProps> = ({
  mode,
  walls,
  furniture,
  selectedItem,
  onItemSelect,
  onItemMove,
  onWallDraw,
  viewMode,
  floorMaterial,
  wallColor
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useThreeScene({
    mountRef: mountRef as React.RefObject<HTMLDivElement>,
    viewMode,
    mode,
    onItemSelect,
    furniture
  });

  // Update walls
  useEffect(() => {
    if (!sceneRefs.scene) return;

    // Clear existing walls
    sceneRefs.wallObjects.forEach(wall => sceneRefs.scene?.remove(wall));
    sceneRefs.wallObjects = [];

    // Add new walls
    walls.forEach(wall => {
      const wallMesh = createWallGeometry(wall);
      sceneRefs.scene?.add(wallMesh);
      sceneRefs.wallObjects.push(wallMesh);
    });
  }, [walls, sceneRefs]);

  // Update furniture
  useEffect(() => {
    if (!sceneRefs.scene) return;

    // Clear existing furniture
    sceneRefs.furnitureObjects.forEach(item => sceneRefs.scene?.remove(item));
    sceneRefs.furnitureObjects = [];

    // Add new furniture
    furniture.forEach(item => {
      const furnitureObject = createFurnitureGeometry(item);
      
      // Update colors based on selection and lock status
      const color = getItemColor(item, selectedItem?.id === item.id);
      
      if (furnitureObject instanceof THREE.Mesh) {
        (furnitureObject.material as THREE.MeshLambertMaterial).color.setHex(color);
      } else if (furnitureObject instanceof THREE.Group) {
        furnitureObject.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
            child.material.color.setHex(color);
          }
        });
      }

      sceneRefs.scene?.add(furnitureObject);
      sceneRefs.furnitureObjects.push(furnitureObject);
    });
  }, [furniture, selectedItem, sceneRefs]);

  // Update floor material
  useEffect(() => {
    if (!sceneRefs.scene) return;

    const floor = sceneRefs.scene.children.find(
      child => child instanceof THREE.Mesh && 
      child.geometry instanceof THREE.PlaneGeometry
    ) as THREE.Mesh;

    if (floor) {
      floor.material = getFloorMaterial(floorMaterial);
    }
  }, [floorMaterial, sceneRefs]);

  return <div ref={mountRef} className="w-full h-full" style={{ minHeight: '600px' }} />;
};

export default Scene3D;
