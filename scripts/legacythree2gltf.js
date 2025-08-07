#!/usr/bin/env node
'use strict';

/* ── CLI + config ──────────────────────────────────────────── */

const KEEP_TEXTURES = true;          // ← flip to true if you want textures
const fs            = require('fs');
const path          = require('path');
const { createCanvas, loadImage } = require('canvas');
const { Blob, FileReader } = require('vblob');
const THREE         = global.THREE = require('three');

require('three/examples/js/loaders/deprecated/LegacyJSONLoader.js');
require('three/examples/js/exporters/GLTFExporter.js');
require('three/examples/js/utils/BufferGeometryUtils.js');

/* ── usage check ───────────────────────────────────────────── */

if (process.argv.length <= 2) {
  console.log(`Usage: ${path.basename(__filename)} model.[js|json] [--optimize]`);
  process.exit(-1);
}
const file     = process.argv[2];
const optimize = process.argv.includes('--optimize');
const outPath  = path.join(path.dirname(file), path.parse(file).name + '.gltf');

/* ── fake-browser stubs (enough for THREE inside Node) ─────── */

global.window     = global;
global.Blob       = Blob;
global.FileReader = FileReader;
global.document   = { createElement: t => (t === 'canvas' ? createCanvas(16, 16) : null) };
global.Image      = function () {};          // stub — overwritten if KEEP_TEXTURES

/* ── optional texture support inside Node.js ──────────────── */

if (KEEP_TEXTURES) {
  THREE.ImageLoader.prototype.load = function (url, onLoad, onProgress, onError) {
    const abs = path.resolve(path.dirname(file), url);
    loadImage(abs)
      .then(img => onLoad(img))
      .catch(err => {
        console.warn('⚠️  Could not load', url, '— exporting without it');
        onError && onError(err);
        onLoad(new Image());                 // fallback 1×1
      });
    return {};                               // dummy object (not used)
  };
}

/* ── read legacy JSON model ───────────────────────────────── */

let txt = fs.readFileSync(file, 'utf8').trim();
if (!txt.startsWith('{')) txt = txt.replace(/^[^{]+/, '');   // strip wrappers

let json;
try   { json = JSON.parse(txt); }
catch (e) {
  console.error(`✗ ${path.basename(file)}: ${e.message}`);
  process.exit(1);
}

/* ── build mesh ───────────────────────────────────────────── */

const loader                 = new THREE.LegacyJSONLoader();
let    { geometry, materials } = loader.parse(json, path.dirname(file));

geometry = new THREE.BufferGeometry().fromGeometry(geometry);
if (optimize) geometry = THREE.BufferGeometryUtils.mergeVertices(geometry);

/* --- upgrade / sanitise materials -------------------------- */

if (!KEEP_TEXTURES) {
  // strip legacy stuff → single grey MeshStandardMaterial
  const grey = new THREE.Color(0x888888);
  materials  = new THREE.MeshStandardMaterial({ color: grey });
} else {
  // convert legacy/simple materials → MeshStandardMaterial instances
  materials = (Array.isArray(materials) ? materials : [materials]).map(old => {
    // texture maps already loaded via patched ImageLoader
    const mat = new THREE.MeshStandardMaterial({
      name      : old.name,
      color     : new THREE.Color(...(old.colorDiffuse || [1, 1, 1])),
      emissive  : new THREE.Color(...(old.colorEmissive || [0, 0, 0])),
      metalness : 0.0,
      roughness : 0.9,
      map       : old.mapDiffuse || undefined,
      transparent : old.transparent || false,
      opacity     : old.transparency !== undefined ? old.transparency : 1
    });
    return mat;
  });
  if (materials.length === 1) materials = materials[0];
}

/* ── mesh + glTF export ───────────────────────────────────── */

const mesh = new THREE.Mesh(geometry, materials);

new THREE.GLTFExporter().parse(
  mesh,
  gltf => {
    fs.writeFileSync(outPath, JSON.stringify(gltf));
    console.log('✓', path.relative(process.cwd(), outPath));
  },
  { binary: false }                              // JSON (.gltf, not .glb)
);
