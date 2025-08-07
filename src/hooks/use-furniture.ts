import { useState, useCallback } from 'react';
import { FurnitureItem, FurnitureType, ItemDimensions } from '@/types';
import { createFurnitureItem } from '@/lib/utils/project-utils';

export const useFurniture = (initialFurniture: FurnitureItem[] = []) => {
  const [furniture, setFurniture] = useState<FurnitureItem[]>(initialFurniture);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [itemDimensions, setItemDimensions] = useState<ItemDimensions>({
    width: 0,
    height: 0,
    depth: 0
  });

  const addFurniture = useCallback((type: FurnitureType) => {
    const newItem = createFurnitureItem(type.name, type.width, type.height);
    setFurniture(prev => [...prev, newItem]);
  }, []);

  const deleteFurniture = useCallback((id: number) => {
    setFurniture(prev => prev.filter(item => item.id !== id));
    setSelectedItem(prev => prev?.id === id ? null : prev);
  }, []);

  const updateFurniture = useCallback((id: number, updates: Partial<FurnitureItem>) => {
    setFurniture(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    
    setSelectedItem(prev => 
      prev?.id === id ? { ...prev, ...updates } : prev
    );
  }, []);

  const toggleLock = useCallback((id: number) => {
    updateFurniture(id, { locked: !furniture.find(item => item.id === id)?.locked });
  }, [furniture, updateFurniture]);

  const selectItem = useCallback((item: FurnitureItem | null) => {
    setSelectedItem(item);
    if (item) {
      setItemDimensions({
        width: item.width,
        height: item.height,
        depth: item.height
      });
    }
  }, []);

  const updateDimensions = useCallback((dimension: keyof ItemDimensions, value: number) => {
    if (!selectedItem || selectedItem.locked) return;

    const updates: Partial<FurnitureItem> = {};
    if (dimension === 'width') updates.width = value;
    if (dimension === 'height') updates.height = value;
    if (dimension === 'depth') updates.height = value; // Using height as depth

    updateFurniture(selectedItem.id, updates);
    setItemDimensions(prev => ({ ...prev, [dimension]: value }));
  }, [selectedItem, updateFurniture]);

  return {
    furniture,
    selectedItem,
    itemDimensions,
    setFurniture,
    addFurniture,
    deleteFurniture,
    updateFurniture,
    toggleLock,
    selectItem,
    updateDimensions
  };
};
