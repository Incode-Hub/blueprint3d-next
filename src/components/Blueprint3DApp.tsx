"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Home, 
  Square, 
  MousePointer, 
  Trash2, 
  Move, 
  RotateCcw, 
  Save, 
  Upload,
  Settings,
  Sofa,
  Bed,
  Table,
  Car,
  Lock,
  Unlock,
  Eye,
  Camera,
  Lightbulb
} from 'lucide-react';
import * as THREE from 'three';

// 3D Scene Component with Three.js
const Scene3D = ({ mode, walls, furniture, selectedItem, onItemSelect, onItemMove, onWallDraw, viewMode }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const furnitureObjectsRef = useRef([]);
  const wallObjectsRef = useRef([]);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    
    if (viewMode === 'floorplan') {
      // Top-down orthographic view for floorplan editing
      camera.position.set(0, 50, 0);
      camera.lookAt(0, 0, 0);
    } else {
      // 3D perspective view
      camera.position.set(15, 15, 15);
      camera.lookAt(0, 0, 0);
    }
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
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
    
    // Add some point lights for better lighting
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
    
    // Mouse controls for camera (simple orbit controls implementation)
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseDown = (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
      
      // Raycasting for object selection
      if (mode === 'select') {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(furnitureObjectsRef.current);
        
        if (intersects.length > 0) {
          const selectedObject = intersects[0].object;
          const furnitureItem = furniture.find(item => item.id === selectedObject.userData.id);
          onItemSelect(furnitureItem);
        } else {
          onItemSelect(null);
        }
      }
    };
    
    const handleMouseMove = (event) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      if (viewMode !== 'floorplan') {
        // Simple orbit camera controls
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
    
    const handleMouseUp = () => {
      isMouseDown = false;
    };
    
    const handleWheel = (event) => {
      if (viewMode !== 'floorplan') {
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        camera.position.multiplyScalar(scale);
      }
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    
    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [viewMode]);
  
  // Update walls
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Clear existing walls
    wallObjectsRef.current.forEach(wall => sceneRef.current.remove(wall));
    wallObjectsRef.current = [];
    
    // Add new walls
    walls.forEach((wall, index) => {
      const wallGeometry = new THREE.BoxGeometry(
        Math.sqrt(Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)) / 50,
        3,
        0.2
      );
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      
      // Position wall
      wallMesh.position.x = (wall.start.x + wall.end.x) / 100;
      wallMesh.position.y = 1.5;
      wallMesh.position.z = (wall.start.z + wall.end.z) / 100;
      
      // Rotate wall to match direction
      const angle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);
      wallMesh.rotation.y = angle;
      
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      
      sceneRef.current.add(wallMesh);
      wallObjectsRef.current.push(wallMesh);
    });
  }, [walls]);
  
  // Update furniture
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Clear existing furniture
    furnitureObjectsRef.current.forEach(item => sceneRef.current.remove(item));
    furnitureObjectsRef.current = [];
    
    // Add new furniture
    furniture.forEach(item => {
      let geometry, material;
      
      // Create different geometries based on furniture type
      switch (item.name.toLowerCase()) {
        case 'sofa':
          geometry = new THREE.BoxGeometry(item.width / 50, 0.8, item.height / 50);
          material = new THREE.MeshLambertMaterial({ 
            color: item.locked ? 0xff4444 : (selectedItem?.id === item.id ? 0x3b82f6 : 0x8b5cf6)
          });
          break;
        case 'bed':
          geometry = new THREE.BoxGeometry(item.width / 50, 0.6, item.height / 50);
          material = new THREE.MeshLambertMaterial({ 
            color: item.locked ? 0xff4444 : (selectedItem?.id === item.id ? 0x3b82f6 : 0x654321)
          });
          break;
        case 'table':
          // Table with legs
          const tableGroup = new THREE.Group();
          
          // Table top
          const topGeometry = new THREE.BoxGeometry(item.width / 50, 0.1, item.height / 50);
          const topMaterial = new THREE.MeshLambertMaterial({ 
            color: item.locked ? 0xff4444 : (selectedItem?.id === item.id ? 0x3b82f6 : 0x8B4513)
          });
          const tableTop = new THREE.Mesh(topGeometry, topMaterial);
          tableTop.position.y = 0.75;
          tableGroup.add(tableTop);
          
          // Table legs
          const legGeometry = new THREE.BoxGeometry(0.1, 0.75, 0.1);
          const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
          
          const positions = [
            [-item.width/100, 0.375, -item.height/100],
            [item.width/100, 0.375, -item.height/100],
            [-item.width/100, 0.375, item.height/100],
            [item.width/100, 0.375, item.height/100]
          ];
          
          positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            tableGroup.add(leg);
          });
          
          tableGroup.position.set(item.x / 50, 0, item.y / 50);
          tableGroup.userData = { id: item.id };
          tableGroup.castShadow = true;
          tableTop.castShadow = true;
          
          sceneRef.current.add(tableGroup);
          furnitureObjectsRef.current.push(tableGroup);
          return;
          
        case 'chair':
          // Chair with back
          const chairGroup = new THREE.Group();
          
          // Seat
          const seatGeometry = new THREE.BoxGeometry(item.width / 50, 0.1, item.height / 50);
          const seatMaterial = new THREE.MeshLambertMaterial({ 
            color: item.locked ? 0xff4444 : (selectedItem?.id === item.id ? 0x3b82f6 : 0x8b5cf6)
          });
          const seat = new THREE.Mesh(seatGeometry, seatMaterial);
          seat.position.y = 0.45;
          chairGroup.add(seat);
          
          // Back
          const backGeometry = new THREE.BoxGeometry(item.width / 50, 0.8, 0.1);
          const back = new THREE.Mesh(backGeometry, seatMaterial);
          back.position.y = 0.8;
          back.position.z = -item.height / 100;
          chairGroup.add(back);
          
          // Legs
          const chairLegGeometry = new THREE.BoxGeometry(0.08, 0.45, 0.08);
          const chairLegMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
          
          const chairLegPositions = [
            [-item.width/120, 0.225, -item.height/120],
            [item.width/120, 0.225, -item.height/120],
            [-item.width/120, 0.225, item.height/120],
            [item.width/120, 0.225, item.height/120]
          ];
          
          chairLegPositions.forEach(pos => {
            const leg = new THREE.Mesh(chairLegGeometry, chairLegMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            chairGroup.add(leg);
          });
          
          chairGroup.position.set(item.x / 50, 0, item.y / 50);
          chairGroup.userData = { id: item.id };
          seat.castShadow = true;
          back.castShadow = true;
          
          sceneRef.current.add(chairGroup);
          furnitureObjectsRef.current.push(chairGroup);
          return;
          
        default:
          geometry = new THREE.BoxGeometry(item.width / 50, 0.5, item.height / 50);
          material = new THREE.MeshLambertMaterial({ 
            color: item.locked ? 0xff4444 : (selectedItem?.id === item.id ? 0x3b82f6 : 0x888888)
          });
      }
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(item.x / 50, geometry.parameters.height / 2, item.y / 50);
      mesh.userData = { id: item.id };
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      sceneRef.current.add(mesh);
      furnitureObjectsRef.current.push(mesh);
    });
  }, [furniture, selectedItem]);
  
  return <div ref={mountRef} className="w-full h-full" style={{ minHeight: '600px' }} />;
};

export default function Blueprint3DApp() {
  const [activeTab, setActiveTab] = useState('floorplan');
  const [mode, setMode] = useState('select');
  const [viewMode, setViewMode] = useState('3d'); // '3d' or 'floorplan'
  
  const [walls, setWalls] = useState([
    { start: { x: -500, z: -500 }, end: { x: 500, z: -500 } },
    { start: { x: 500, z: -500 }, end: { x: 500, z: 500 } },
    { start: { x: 500, z: 500 }, end: { x: -500, z: 500 } },
    { start: { x: -500, z: 500 }, end: { x: -500, z: -500 } }
  ]);
  
  const [furniture, setFurniture] = useState([
    { id: 1, name: 'Sofa', x: 0, y: -200, width: 160, height: 80, locked: false },
    { id: 2, name: 'Table', x: 0, y: 100, width: 120, height: 120, locked: false },
    { id: 3, name: 'Chair', x: -150, y: 100, width: 60, height: 60, locked: false },
    { id: 4, name: 'Chair', x: 150, y: 100, width: 60, height: 60, locked: false },
    { id: 5, name: 'Bed', x: 300, y: 0, width: 140, height: 200, locked: false }
  ]);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDimensions, setItemDimensions] = useState({ width: 0, height: 0, depth: 0 });
  const [floorMaterial, setFloorMaterial] = useState('hardwood');
  const [wallColor, setWallColor] = useState('#ffffff');
  
  const furnitureTypes = [
    { name: 'Sofa', icon: Sofa, width: 160, height: 80 },
    { name: 'Bed', icon: Bed, width: 140, height: 200 },
    { name: 'Table', icon: Table, width: 120, height: 120 },
    { name: 'Chair', icon: Car, width: 60, height: 60 }
  ];
  
  useEffect(() => {
    if (selectedItem) {
      setItemDimensions({
        width: selectedItem.width,
        height: selectedItem.height,
        depth: selectedItem.height // Using height as depth for simplicity
      });
    }
  }, [selectedItem]);
  
  const addFurniture = (type) => {
    const newItem = {
      id: Date.now(),
      name: type.name,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      width: type.width,
      height: type.height,
      locked: false
    };
    setFurniture([...furniture, newItem]);
  };
  
  const deleteSelectedItem = () => {
    if (selectedItem && !selectedItem.locked) {
      setFurniture(furniture.filter(item => item.id !== selectedItem.id));
      setSelectedItem(null);
    }
  };
  
  const toggleLockItem = () => {
    if (selectedItem) {
      const updated = furniture.map(item =>
        item.id === selectedItem.id ? { ...item, locked: !item.locked } : item
      );
      setFurniture(updated);
      setSelectedItem({ ...selectedItem, locked: !selectedItem.locked });
    }
  };
  
  const updateItemDimensions = (dimension, value) => {
    if (selectedItem && !selectedItem.locked) {
      const numValue = parseFloat(value) || 0;
      const updated = furniture.map(item =>
        item.id === selectedItem.id 
          ? { 
              ...item, 
              [dimension === 'depth' ? 'height' : dimension]: numValue 
            }
          : item
      );
      setFurniture(updated);
      setSelectedItem({
        ...selectedItem,
        [dimension === 'depth' ? 'height' : dimension]: numValue
      });
      setItemDimensions({
        ...itemDimensions,
        [dimension]: numValue
      });
    }
  };
  
  const saveProject = () => {
    const project = { walls, furniture, floorMaterial, wallColor };
    localStorage.setItem('blueprint3d-project', JSON.stringify(project));
    alert('Project saved!');
  };
  
  const loadProject = () => {
    const saved = localStorage.getItem('blueprint3d-project');
    if (saved) {
      const project = JSON.parse(saved);
      setWalls(project.walls || walls);
      setFurniture(project.furniture || []);
      setFloorMaterial(project.floorMaterial || 'hardwood');
      setWallColor(project.wallColor || '#ffffff');
      setSelectedItem(null);
      alert('Project loaded!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Blueprint3D - Full 3D</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={viewMode === '3d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('3d')}
              >
                <Camera className="h-4 w-4 mr-2" />
                3D View
              </Button>
              <Button
                variant={viewMode === 'floorplan' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('floorplan')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Top View
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={saveProject}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={loadProject}>
              <Upload className="h-4 w-4 mr-2" />
              Load
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700">
              <TabsTrigger value="floorplan" className="data-[state=active]:bg-gray-600">Walls</TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:bg-gray-600">Design</TabsTrigger>
              <TabsTrigger value="items" className="data-[state=active]:bg-gray-600">Items</TabsTrigger>
            </TabsList>
            
            <TabsContent value="floorplan" className="space-y-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-white">Wall Tools</h3>
                  <div className="space-y-2">
                    <Button
                      variant={mode === 'select' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setMode('select')}
                    >
                      <MousePointer className="h-4 w-4 mr-2" />
                      Select Items
                    </Button>
                    <Button
                      variant={mode === 'move-walls' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setMode('move-walls')}
                    >
                      <Move className="h-4 w-4 mr-2" />
                      Move Walls
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Use mouse to rotate camera. Scroll to zoom. Click items to select.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="design" className="space-y-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-white">Room Materials</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-300">Floor Material</Label>
                      <select 
                        className="w-full mt-1 p-2 bg-gray-600 border border-gray-500 rounded text-white"
                        value={floorMaterial}
                        onChange={(e) => setFloorMaterial(e.target.value)}
                      >
                        <option value="hardwood">Hardwood</option>
                        <option value="carpet">Carpet</option>
                        <option value="tile">Tile</option>
                        <option value="concrete">Concrete</option>
                        <option value="marble">Marble</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Wall Color</Label>
                      <input 
                        type="color" 
                        className="w-full mt-1 p-1 bg-gray-600 border border-gray-500 rounded h-10" 
                        value={wallColor}
                        onChange={(e) => setWallColor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Lighting</Label>
                      <div className="flex space-x-2 mt-1">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          Day
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          Night
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="items" className="space-y-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-white">Add Furniture</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {furnitureTypes.map((type) => (
                      <Button
                        key={type.name}
                        variant="outline"
                        size="sm"
                        className="h-16 flex-col bg-gray-600 hover:bg-gray-500 border-gray-500"
                        onClick={() => addFurniture(type)}
                      >
                        <type.icon className="h-6 w-6 mb-1" />
                        <span className="text-xs">{type.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {selectedItem && (
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">Selected: {selectedItem.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLockItem}
                        className="text-gray-300 hover:text-white"
                      >
                        {selectedItem.locked ? <Lock className="h-4 w-4 text-red-400" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Width (units)</Label>
                        <Input
                          type="number"
                          value={itemDimensions.width}
                          onChange={(e) => updateItemDimensions('width', e.target.value)}
                          disabled={selectedItem.locked}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Height (units)</Label>
                        <Input
                          type="number"
                          value={itemDimensions.height}
                          onChange={(e) => updateItemDimensions('height', e.target.value)}
                          disabled={selectedItem.locked}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Depth (units)</Label>
                        <Input
                          type="number"
                          value={itemDimensions.depth}
                          onChange={(e) => updateItemDimensions('depth', e.target.value)}
                          disabled={selectedItem.locked}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={deleteSelectedItem}
                        disabled={selectedItem.locked}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Item
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main 3D Canvas Area */}
        <div className="flex-1 bg-gray-900">
          <div className="h-full p-4">
            <div className="bg-gray-800 rounded-lg h-full border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {viewMode === '3d' ? '3D Room Designer' : 'Floor Plan View'}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Mode: {mode === 'select' ? 'Select' : 'Move Walls'}</span>
                    <span>•</span>
                    <span>Items: {furniture.length}</span>
                    <span>•</span>
                    <span>Walls: {walls.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="h-full">
                <Scene3D
                  mode={mode}
                  walls={walls}
                  furniture={furniture}
                  selectedItem={selectedItem}
                  onItemSelect={setSelectedItem}
                  onItemMove={() => {}}
                  onWallDraw={() => {}}
                  viewMode={viewMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Info Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-3">
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <MousePointer className="h-4 w-4" />
            <span>Left click: Select furniture</span>
          </div>
          <div className="flex items-center space-x-2">
            <Move className="h-4 w-4" />
            <span>Drag: Rotate camera</span>
          </div>
          <div className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4" />
            <span>Scroll: Zoom in/out</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Switch views: 3D ↔ Top</span>
          </div>
        </div>
      </div>
    </div>
  );
}