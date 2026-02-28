/* ============================================
   APEX TRAIL - Configurator 3D Scene
   Interactive color picker with real-time material updates
   ============================================ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, bikeModel, frameMesh;
let currentColor = new THREE.Color(0x1a1a1a);
let targetColor = new THREE.Color(0x1a1a1a);

// Color options
const colorOptions = {
  'stealth-black': 0x1a1a1a,
  'alpine-white': 0xf5f5f5,
  'lava-red': 0xcc2200,
  'electric-teal': 0x00FFB2,
  'obsidian-gray': 0x3d3d3d,
  'neon-volt': 0xccff00
};

export function initConfiguratorScene() {
  const canvas = document.getElementById('configurator-canvas');
  if (!canvas) return;
  
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080808);
  
  // Camera
  camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(3, 2, 5);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true, 
    alpha: false 
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  
  // Lighting
  setupLighting();
  
  // Load bike model
  loadBikeModel();
  
  // Listen for color change events
  window.addEventListener('colorChange', onColorChange);
  
  // Event listeners
  window.addEventListener('resize', onResize);
  
  // Start animation loop
  animate();
}

function setupLighting() {
  // Ambient
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  // Main light
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(5, 10, 7);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  scene.add(mainLight);
  
  // Rim light (accent color)
  const rimLight = new THREE.DirectionalLight(0x00FFB2, 1);
  rimLight.position.set(-5, 2, -5);
  scene.add(rimLight);
  
  // Fill
  const fillLight = new THREE.DirectionalLight(0x445566, 0.5);
  fillLight.position.set(-5, 0, 5);
  scene.add(fillLight);
  
  // Point lights for highlights
  const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 20);
  pointLight1.position.set(3, 5, 3);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0x00FFB2, 0.5, 20);
  pointLight2.position.set(-3, 3, -3);
  scene.add(pointLight2);
}

function loadBikeModel() {
  const loader = new GLTFLoader();
  
  loader.load(
    '/mountain_bike.glb',
    (gltf) => {
      bikeModel = gltf.scene;
      
      // Center and scale
      const box = new THREE.Box3().setFromObject(bikeModel);
      const center = box.getCenter(new THREE.Vector3());
      bikeModel.position.sub(center);
      
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 4 / maxDim;
      bikeModel.scale.setScalar(scale);
      
      // Find and store frame mesh for color changes
      bikeModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Clone material to avoid sharing
          child.material = child.material.clone();
          
          // Identify frame by name or geometry
          const name = child.name.toLowerCase();
          if (name.includes('frame') || name.includes('main') || name.includes('body')) {
            frameMesh = child;
            // Set initial color
            child.material.color.copy(currentColor);
            child.material.metalness = 0.6;
            child.material.roughness = 0.3;
            child.material.envMapIntensity = 1.5;
          } else if (name.includes('wheel') || name.includes('tire')) {
            child.material.color.setHex(0x111111);
            child.material.roughness = 0.9;
          } else if (name.includes('metal') || name.includes('bolt') || name.includes('screw')) {
            child.material.metalness = 0.9;
            child.material.roughness = 0.2;
          }
        }
      });
      
      // If no frame identified, use the largest mesh
      if (!frameMesh) {
        let largestArea = 0;
        bikeModel.traverse((child) => {
          if (child.isMesh) {
            const box = new THREE.Box3().setFromObject(child);
            const size = box.getSize(new THREE.Vector3());
            const area = size.x * size.y * size.z;
            if (area > largestArea) {
              largestArea = area;
              frameMesh = child;
            }
          }
        });
        
        if (frameMesh) {
          frameMesh.material = frameMesh.material.clone();
          frameMesh.material.color.copy(currentColor);
          frameMesh.material.metalness = 0.6;
          frameMesh.material.roughness = 0.3;
        }
      }
      
      scene.add(bikeModel);
    },
    undefined,
    (error) => {
      console.error('Error loading bike model for configurator:', error);
      createFallbackConfigurator();
    }
  );
}

function createFallbackConfigurator() {
  // Create simplified bike representation
  bikeModel = new THREE.Group();
  
  // Frame
  const frameGeo = new THREE.TorusGeometry(0.8, 0.08, 16, 50, Math.PI);
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: currentColor,
    metalness: 0.6,
    roughness: 0.3
  });
  frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.name = 'frame';
  bikeModel.add(frameMesh);
  
  // Wheels
  const wheelGeo = new THREE.TorusGeometry(0.5, 0.05, 16, 50);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  
  const wheel1 = new THREE.Mesh(wheelGeo, wheelMat);
  wheel1.position.set(-0.6, -0.3, 0);
  bikeModel.add(wheel1);
  
  const wheel2 = new THREE.Mesh(wheelGeo, wheelMat);
  wheel2.position.set(0.6, -0.3, 0);
  bikeModel.add(wheel2);
  
  bikeModel.scale.setScalar(1.5);
  scene.add(bikeModel);
}

function onColorChange(event) {
  const colorKey = event.detail.color;
  const hexColor = colorOptions[colorKey];
  
  if (hexColor !== undefined) {
    targetColor.setHex(hexColor);
  }
}

function onResize() {
  const canvas = document.getElementById('configurator-canvas');
  if (!canvas || !camera || !renderer) return;
  
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  if (bikeModel) {
    // Slow rotation
    bikeModel.rotation.y += 0.003;
    
    // Smooth color transition
    if (frameMesh && frameMesh.material) {
      currentColor.lerp(targetColor, 0.05);
      frameMesh.material.color.copy(currentColor);
    }
  }
  
  renderer.render(scene, camera);
}