"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Home,
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
  Lightbulb,
} from "lucide-react";

import {
  createDefaultWalls,
  createDefaultFurniture,
} from "@/lib/utils/project-utils";
import { Mode, ViewMode, FloorMaterial, Wall, FurnitureType } from "@/types";
import { useFurniture } from "@/hooks/use-furniture";
import { useProject } from "@/hooks/use-project";
import Scene3D from "./scene-3d";

const Blueprint3DApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("floorplan");
  const [mode, setMode] = useState<Mode>("select");
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [walls, setWalls] = useState<Wall[]>(createDefaultWalls());
  const [floorMaterial, setFloorMaterial] = useState<FloorMaterial>("hardwood");
  const [wallColor, setWallColor] = useState<string>("#ffffff");

  const {
    furniture,
    selectedItem,
    itemDimensions,
    setFurniture,
    addFurniture,
    deleteFurniture,
    toggleLock,
    selectItem,
    updateDimensions,
  } = useFurniture(createDefaultFurniture());

  const { saveProject, loadProject } = useProject({
    walls,
    furniture,
    floorMaterial,
    wallColor,
    setWalls,
    setFurniture,
    setFloorMaterial,
    setWallColor,
    setSelectedItem: selectItem,
  });

  const furnitureTypes: FurnitureType[] = [
    { name: "Sofa", icon: Sofa, width: 160, height: 80 },
    { name: "Bed", icon: Bed, width: 140, height: 200 },
    { name: "Table", icon: Table, width: 120, height: 120 },
    { name: "Chair", icon: Car, width: 60, height: 60 },
  ];

  const handleDeleteSelected = (): void => {
    if (selectedItem && !selectedItem.locked) {
      deleteFurniture(selectedItem.id);
    }
  };

  const handleToggleLock = (): void => {
    if (selectedItem) {
      toggleLock(selectedItem.id);
    }
  };

  const handleDimensionChange = (
    dimension: "width" | "height" | "depth",
    value: string
  ): void => {
    const numValue = parseFloat(value) || 0;
    updateDimensions(dimension, numValue);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">
                Blueprint3D - TypeScript
              </h1>
            </div>

            <div className="flex space-x-2">
              <Button
                variant={viewMode === "3d" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("3d")}
              >
                <Camera className="h-4 w-4 mr-2" />
                3D View
              </Button>
              <Button
                variant={viewMode === "floorplan" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("floorplan")}
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-gray-700">
              <TabsTrigger
                value="floorplan"
                className="data-[state=active]:bg-gray-600"
              >
                Walls
              </TabsTrigger>
              <TabsTrigger
                value="design"
                className="data-[state=active]:bg-gray-600"
              >
                Design
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="data-[state=active]:bg-gray-600"
              >
                Items
              </TabsTrigger>
            </TabsList>

            <TabsContent value="floorplan" className="space-y-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-white">Wall Tools</h3>
                  <div className="space-y-2">
                    <Button
                      variant={mode === "select" ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setMode("select")}
                    >
                      <MousePointer className="h-4 w-4 mr-2" />
                      Select Items
                    </Button>
                    <Button
                      variant={mode === "move-walls" ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setMode("move-walls")}
                    >
                      <Move className="h-4 w-4 mr-2" />
                      Move Walls
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Use mouse to rotate camera. Scroll to zoom. Click items to
                    select.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-white">
                    Room Materials
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-300">Floor Material</Label>
                      <select
                        className="w-full mt-1 p-2 bg-gray-600 border border-gray-500 rounded text-white"
                        value={floorMaterial}
                        onChange={(e) =>
                          setFloorMaterial(e.target.value as FloorMaterial)
                        }
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
                  <h3 className="font-semibold mb-3 text-white">
                    Add Furniture
                  </h3>
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
                      <h3 className="font-semibold text-white">
                        Selected: {selectedItem.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleLock}
                        className="text-gray-300 hover:text-white"
                      >
                        {selectedItem.locked ? (
                          <Lock className="h-4 w-4 text-red-400" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Width (units)</Label>
                        <Input
                          type="number"
                          value={itemDimensions.width}
                          onChange={(e) =>
                            handleDimensionChange("width", e.target.value)
                          }
                          disabled={selectedItem.locked}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Height (units)</Label>
                        <Input
                          type="number"
                          value={itemDimensions.height}
                          onChange={(e) =>
                            handleDimensionChange("height", e.target.value)
                          }
                          disabled={selectedItem.locked}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Depth (units)</Label>
                        <Input
                          type="number"
                          value={itemDimensions.depth}
                          onChange={(e) =>
                            handleDimensionChange("depth", e.target.value)
                          }
                          disabled={selectedItem.locked}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={handleDeleteSelected}
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
                    {viewMode === "3d" ? "3D Room Designer" : "Floor Plan View"}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>
                      Mode: {mode === "select" ? "Select" : "Move Walls"}
                    </span>
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
                  onItemSelect={selectItem}
                  onItemMove={() => {}}
                  onWallDraw={() => {}}
                  viewMode={viewMode}
                  floorMaterial={floorMaterial}
                  wallColor={wallColor}
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
};

export default Blueprint3DApp;
