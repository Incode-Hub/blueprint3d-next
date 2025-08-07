import { FloorMaterial, FurnitureItem, Wall } from '@/types';
import * as THREE from 'three';

export const createFurnitureGeometry = (item: FurnitureItem): THREE.Group | THREE.Mesh => {
  switch (item.name.toLowerCase()) {
    case 'table':
      return createTableGeometry(item);
    case 'chair':
      return createChairGeometry(item);
    case 'sofa':
      return createSofaGeometry(item);
    case 'bed':
      return createBedGeometry(item);
    default:
      return createDefaultGeometry(item);
  }
};

const createTableGeometry = (item: FurnitureItem): THREE.Group => {
  const tableGroup = new THREE.Group();
  
  // Table top
  const topGeometry = new THREE.BoxGeometry(item.width / 50, 0.1, item.height / 50);
  const topMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const tableTop = new THREE.Mesh(topGeometry, topMaterial);
  tableTop.position.y = 0.75;
  tableTop.castShadow = true;
  tableGroup.add(tableTop);
  
  // Table legs
  const legGeometry = new THREE.BoxGeometry(0.1, 0.75, 0.1);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
  
  const legPositions = [
    [-item.width/100, 0.375, -item.height/100],
    [item.width/100, 0.375, -item.height/100],
    [-item.width/100, 0.375, item.height/100],
    [item.width/100, 0.375, item.height/100]
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    tableGroup.add(leg);
  });
  
  tableGroup.position.set(item.x / 50, 0, item.y / 50);
  tableGroup.userData = { id: item.id };
  
  return tableGroup;
};

const createChairGeometry = (item: FurnitureItem): THREE.Group => {
  const chairGroup = new THREE.Group();
  
  // Seat
  const seatGeometry = new THREE.BoxGeometry(item.width / 50, 0.1, item.height / 50);
  const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 });
  const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  seat.position.y = 0.45;
  seat.castShadow = true;
  chairGroup.add(seat);
  
  // Back
  const backGeometry = new THREE.BoxGeometry(item.width / 50, 0.8, 0.1);
  const back = new THREE.Mesh(backGeometry, seatMaterial);
  back.position.y = 0.8;
  back.position.z = -item.height / 100;
  back.castShadow = true;
  chairGroup.add(back);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.08, 0.45, 0.08);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
  
  const legPositions = [
    [-item.width/120, 0.225, -item.height/120],
    [item.width/120, 0.225, -item.height/120],
    [-item.width/120, 0.225, item.height/120],
    [item.width/120, 0.225, item.height/120]
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    chairGroup.add(leg);
  });
  
  chairGroup.position.set(item.x / 50, 0, item.y / 50);
  chairGroup.userData = { id: item.id };
  
  return chairGroup;
};

const createSofaGeometry = (item: FurnitureItem): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(item.width / 50, 0.8, item.height / 50);
  const material = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 });
  const mesh = new THREE.Mesh(geometry, material);
  
  mesh.position.set(item.x / 50, 0.4, item.y / 50);
  mesh.userData = { id: item.id };
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
};

const createBedGeometry = (item: FurnitureItem): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(item.width / 50, 0.6, item.height / 50);
  const material = new THREE.MeshLambertMaterial({ color: 0x654321 });
  const mesh = new THREE.Mesh(geometry, material);
  
  mesh.position.set(item.x / 50, 0.3, item.y / 50);
  mesh.userData = { id: item.id };
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
};

const createDefaultGeometry = (item: FurnitureItem): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(item.width / 50, 0.5, item.height / 50);
  const material = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const mesh = new THREE.Mesh(geometry, material);
  
  mesh.position.set(item.x / 50, 0.25, item.y / 50);
  mesh.userData = { id: item.id };
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
};

export const getItemColor = (item: FurnitureItem, isSelected: boolean): number => {
  if (item.locked) return 0xff4444;
  if (isSelected) return 0x3b82f6;
  
  switch (item.name.toLowerCase()) {
    case 'sofa': return 0x8b5cf6;
    case 'bed': return 0x654321;
    case 'table': return 0x8B4513;
    case 'chair': return 0x8b5cf6;
    default: return 0x888888;
  }
};

export const getFloorMaterial = (material: FloorMaterial): THREE.MeshLambertMaterial => {
  const materials: Record<FloorMaterial, { color: number; opacity?: number }> = {
    hardwood: { color: 0x8B4513, opacity: 0.8 },
    carpet: { color: 0x654321, opacity: 0.9 },
    tile: { color: 0xcccccc, opacity: 0.8 },
    concrete: { color: 0x666666, opacity: 0.8 },
    marble: { color: 0xf5f5f5, opacity: 0.9 }
  };
  
  const config = materials[material];
  return new THREE.MeshLambertMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity || 0.8
  });
};

export const createWallGeometry = (wall: Wall): THREE.Mesh => {
  const length = Math.sqrt(
    Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
  ) / 50;
  
  const geometry = new THREE.BoxGeometry(length, 3, 0.2);
  const material = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
  const mesh = new THREE.Mesh(geometry, material);
  
  // Position wall
  mesh.position.x = (wall.start.x + wall.end.x) / 100;
  mesh.position.y = 1.5;
  mesh.position.z = (wall.start.z + wall.end.z) / 100;
  
  // Rotate wall to match direction
  const angle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);
  mesh.rotation.y = angle;
  
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
};
