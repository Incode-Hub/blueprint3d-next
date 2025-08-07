/* src/lib/items.ts
   ------------------------------------------------------------------ */
   export interface CatalogueItem {
    /** Display name in the UI */
    name: string;
    /** Public path to thumbnail (goes in the <img src>) */
    thumbnail: string;
    /** Public path to the glTF model */
    modelUrl: string;
    /** Blueprint3D item-type. 7 = door, 6 = window, 0 = furniture … */
    type: number;
  }
  
  export const items: CatalogueItem[] = [
    {
      name      : 'Closed Door 28×80',
      thumbnail : '/models/thumbnails/closed-door.png',
      modelUrl  : '/models/closed-door28x80_baked.gltf',
      type      : 7,
    },
    {
      name      : 'Open Door 28×80',
      thumbnail : '/models/thumbnails/open-door.png',
      modelUrl  : '/models/open-door28x80_baked.gltf',
      type      : 7,
    },
    {
      name      : 'Window 48×48',
      thumbnail : '/models/thumbnails/window-48x48.png',
      modelUrl  : '/models/window48x48_baked.gltf',
      type      : 6,
    },
    {
      name      : 'Sofa 2-Seater',
      thumbnail : '/models/thumbnails/sofa.png',
      modelUrl  : '/models/sofa_baked.gltf',
      type      : 0,
    },
    {
      name      : 'Dining Table 6-Seat',
      thumbnail : '/models/thumbnails/dining-table.png',
      modelUrl  : '/models/dining-table_baked.gltf',
      type      : 0,
    },
    // 👉 keep adding entries here …
  ];
  