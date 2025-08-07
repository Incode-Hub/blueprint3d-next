import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { ViewMode, Mode, FurnitureItem } from '@/types';
import { ThreeRefs } from '@/types';

interface UseThreeSceneProps {
  mountRef: React.RefObject<HTMLDivElement>;
  viewMode: ViewMode;
  mode: Mode;
  onItemSelect: (item: FurnitureItem | null) => void;
  furniture: FurnitureItem[];
}

export const useThreeScene = ({
  mountRef,
  viewMode,
  mode,
  onItemSelect,
  furniture
}: UseThreeSceneProps) => {
  const refs = useRef<ThreeRefs>({
    scene: null,
    renderer: null,
    camera: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    furnitureObjects: [],
    wallObjects: []
  });

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!refs.current.renderer || !refs.current.camera || mode !== 'select') return;

    const rect = refs.current.renderer.domElement.getBoundingClientRect();
    refs.current.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    refs.current.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    refs.current.raycaster.setFromCamera(refs.current.mouse, refs.current.camera);
    const intersects = refs.current.raycaster.intersectObjects(refs.current.furnitureObjects, true);

    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;
      let userData = selectedObject.userData;
      
      // Check parent if current object doesn't have userData
      if (!userData.id && selectedObject.parent) {
        userData = selectedObject.parent.userData;
      }
      
      const furnitureItem = furniture.find(item => item.id === userData.id);
      onItemSelect(furnitureItem || null);
    } else {
      onItemSelect(null);
    }
  }, [mode, onItemSelect, furniture]);

  const setupScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    refs.current.scene = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    if (viewMode === 'floorplan') {
      camera.position.set(0, 50, 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(15, 15, 15);
      camera.lookAt(0, 0, 0);
    }
    refs.current.camera = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    refs.current.renderer = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight2.position.set(-10, 10, -10);
    scene.add(pointLight2);

    // Grid helper for floorplan mode
    if (viewMode === 'floorplan') {
      const gridHelper = new THREE.GridHelper(50, 50, 0xcccccc, 0xeeeeee);
      scene.add(gridHelper);
    }

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B4513,
      transparent: true,
      opacity: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Mouse controls
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      if (viewMode !== 'floorplan') {
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
      }

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseDownInternal = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
      handleMouseDown(event);
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (viewMode !== 'floorplan') {
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        camera.position.multiplyScalar(scale);
      }
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDownInternal);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.domElement.removeEventListener('mousedown', handleMouseDownInternal);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [viewMode, handleMouseDown]);

  useEffect(() => {
    return setupScene();
  }, [setupScene]);

  return refs.current;
};
