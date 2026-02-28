/* ============================================
   APEX TRAIL - Terrain 3D Scene
   Procedural terrain mesh with wireframe morphing
   ============================================ */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let scene, camera, renderer, terrain, bikeModel;
let terrainWireframe, terrainSolid;
let scrollProgress = 0;

export function initTerrainScene() {
  const canvas = document.getElementById('terrain-canvas');
  if (!canvas) return;
  
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080808);
  scene.fog = new THREE.Fog(0x080808, 10, 50);
  
  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 15);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true, 
    alpha: false 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Lighting
  setupLighting();
  
  // Create terrain
  createTerrain();
  
  // Create bike representation
  createBikeRepresentation();
  
  // Setup scroll animation
  setupScrollAnimation();
  
  // Event listeners
  window.addEventListener('resize', onResize);
  
  // Start animation loop
  animate();
}

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0x00FFB2, 0.8);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);
  
  const fillLight = new THREE.DirectionalLight(0x445566, 0.4);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);
}

function createTerrain() {
  // Create terrain geometry
  const geometry = new THREE.PlaneGeometry(60, 60, 64, 64);
  
  // Generate height data
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    // Create mountainous terrain using multiple sine waves
    let z = 0;
    z += Math.sin(x * 0.1) * 2;
    z += Math.cos(y * 0.1) * 2;
    z += Math.sin(x * 0.3 + y * 0.2) * 1;
    z += Math.cos(x * 0.5) * 0.5;
    
    // Add some noise
    z += (Math.random() - 0.5) * 0.3;
    
    positions.setZ(i, z);
  }
  
  geometry.computeVertexNormals();
  
  // Wireframe material
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00FFB2,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  
  terrainWireframe = new THREE.Mesh(geometry, wireframeMaterial);
  terrainWireframe.rotation.x = -Math.PI / 2;
  terrainWireframe.position.y = -2;
  scene.add(terrainWireframe);
  
  // Solid material
  const solidMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true
  });
  
  terrainSolid = new THREE.Mesh(geometry, solidMaterial);
  terrainSolid.rotation.x = -Math.PI / 2;
  terrainSolid.position.y = -2.01;
  terrainSolid.visible = false;
  scene.add(terrainSolid);
}

function createBikeRepresentation() {
  // Simplified bike model for the terrain scene
  bikeModel = new THREE.Group();
  
  // Main body
  const bodyGeo = new THREE.BoxGeometry(0.8, 0.3, 1.8);
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  bikeModel.add(body);
  
  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  
  const wheel1 = new THREE.Mesh(wheelGeo, wheelMat);
  wheel1.rotation.z = Math.PI / 2;
  wheel1.position.set(0, -0.3, 0.7);
  bikeModel.add(wheel1);
  
  const wheel2 = new THREE.Mesh(wheelGeo, wheelMat);
  wheel2.rotation.z = Math.PI / 2;
  wheel2.position.set(0, -0.3, -0.7);
  bikeModel.add(wheel2);
  
  // Add glow effect
  const glowGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00FFB2,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  bikeModel.add(glow);
  
  bikeModel.position.set(0, 2, 0);
  scene.add(bikeModel);
}

function setupScrollAnimation() {
  const terrainSection = document.querySelector('.terrain-section');
  if (!terrainSection) return;
  
  // Scroll-driven terrain morph and bike movement
  ScrollTrigger.create({
    trigger: terrainSection,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => {
      scrollProgress = self.progress;
      
      // Morph from wireframe to solid
      if (terrainWireframe && terrainSolid) {
        terrainWireframe.material.opacity = 0.3 - (scrollProgress * 0.3);
        terrainSolid.visible = scrollProgress > 0.3;
        terrainSolid.material.opacity = Math.min(1, (scrollProgress - 0.3) * 2);
      }
      
      // Move bike along terrain
      if (bikeModel) {
        const pathProgress = scrollProgress * 40 - 20;
        bikeModel.position.z = pathProgress;
        
        // Calculate height at current position
        const x = bikeModel.position.x;
        const z = bikeModel.position.z;
        let y = 0;
        y += Math.sin(x * 0.1) * 2;
        y += Math.cos(z * 0.1) * 2;
        y += Math.sin(x * 0.3 + z * 0.2) * 1;
        bikeModel.position.y = y + 1;
        
        // Rotate bike to follow terrain
        bikeModel.rotation.x = Math.sin(z * 0.2) * 0.1;
        bikeModel.rotation.z = Math.cos(z * 0.15) * 0.05;
      }
      
      // Move camera to follow bike
      if (camera) {
        camera.position.z = 15 + scrollProgress * 10;
        camera.lookAt(0, bikeModel ? bikeModel.position.y : 0, bikeModel ? bikeModel.position.z : 0);
      }
    }
  });
}

function onResize() {
  if (!camera || !renderer) return;
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  // Animate terrain vertices for subtle movement
  if (terrainWireframe) {
    const positions = terrainWireframe.geometry.attributes.position;
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Subtle wave animation
      const wave = Math.sin(x * 0.2 + time) * 0.1 + Math.cos(y * 0.2 + time * 0.8) * 0.1;
      
      // Don't modify the base height too much
      let z = 0;
      z += Math.sin(x * 0.1) * 2;
      z += Math.cos(y * 0.1) * 2;
      z += Math.sin(x * 0.3 + y * 0.2) * 1;
      z += wave * 0.1;
      
      positions.setZ(i, z);
    }
    
    positions.needsUpdate = true;
    terrainWireframe.geometry.computeVertexNormals();
  }
  
  // Rotate bike wheels
  if (bikeModel) {
    bikeModel.children.forEach((child, i) => {
      if (i > 0 && i < 3) { // Wheel meshes
        child.rotation.x += 0.1;
      }
    });
  }
  
  renderer.render(scene, camera);
}