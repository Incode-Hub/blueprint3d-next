import * as THREE from 'three'

export const createBasicMaterial = (color: string | number, opacity = 1) => {
  return new THREE.MeshLambertMaterial({ 
    color, 
    transparent: opacity < 1,
    opacity 
  })
}

export const createFurnitureGeometry = (type: string, width: number, height: number) => {
  switch (type.toLowerCase()) {
    case 'table':
      return new THREE.BoxGeometry(width / 50, 0.1, height / 50)
    case 'chair':
      return new THREE.BoxGeometry(width / 50, 0.1, height / 50)
    case 'sofa':
      return new THREE.BoxGeometry(width / 50, 0.8, height / 50)
    case 'bed':
      return new THREE.BoxGeometry(width / 50, 0.6, height / 50)
    default:
      return new THREE.BoxGeometry(width / 50, 0.5, height / 50)
  }
}

export const setupLighting = (scene: THREE.Scene) => {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)
  
  // Main directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(20, 20, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 500
  scene.add(directionalLight)
  
  // Point lights for fill lighting
  const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 100)
  pointLight1.position.set(10, 10, 10)
  scene.add(pointLight1)
  
  const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 100)
  pointLight2.position.set(-10, 10, -10)
  scene.add(pointLight2)
  
  return { ambientLight, directionalLight, pointLight1, pointLight2 }
}