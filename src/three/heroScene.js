/* ============================================
   APEX TRAIL - Hero 3D Scene
   ============================================ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

let scene, camera, renderer, bikeModel, bikeGroup;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let isHovering = false;

export function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  
  // Scene setup
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);
  
  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1, 5);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true, 
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Lighting
  setupLighting();
  
  // Load bike model
  loadBikeModel();
  
  // Add ambient fog particles
  addFogParticles();
  
  // Event listeners
  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('mouseenter', () => isHovering = true);
  canvas.addEventListener('mouseleave', () => isHovering = false);
  window.addEventListener('resize', onResize);
  
  // Start animation loop
  animate();
}

function setupLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  
  // Main directional light (golden hour simulation)
  const mainLight = new THREE.DirectionalLight(0xffaa77, 2);
  mainLight.position.set(5, 10, 7);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  scene.add(mainLight);
  
  // Rim light for dramatic effect
  const rimLight = new THREE.DirectionalLight(0x00FFB2, 1);
  rimLight.position.set(-5, 2, -5);
  scene.add(rimLight);
  
  // Fill light
  const fillLight = new THREE.DirectionalLight(0x445566, 0.5);
  fillLight.position.set(-5, 0, 5);
  scene.add(fillLight);
}

function loadBikeModel() {
  const loader = new GLTFLoader();
  
  loader.load(
    '/mountain_bike.glb',
    (gltf) => {
      bikeModel = gltf.scene;
      bikeGroup = new THREE.Group();
      bikeGroup.add(bikeModel);
      
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(bikeModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      bikeModel.position.sub(center);
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.5 / maxDim;
      bikeGroup.scale.setScalar(scale);
      
      // Adjust position
      bikeGroup.position.y = 0.2;
      bikeGroup.rotation.y = Math.PI / 4;
      
      // Apply materials
      bikeModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Enhance materials
          if (child.material) {
            child.material.metalness = 0.8;
            child.material.roughness = 0.2;
            child.material.envMapIntensity = 1.5;
          }
        }
      });
      
      scene.add(bikeGroup);
    },
    (progress) => {
      const percent = (progress.loaded / progress.total * 100).toFixed(0);
      console.log(`Loading bike model: ${percent}%`);
    },
    (error) => {
      console.error('Error loading bike model:', error);
      // Create fallback bike representation
      createFallbackBike();
    }
  );
}

function createFallbackBike() {
  // Procedural bike representation if GLB fails
  bikeGroup = new THREE.Group();
  
  // Frame
  const frameGeometry = new THREE.TorusGeometry(0.8, 0.05, 16, 100, Math.PI);
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    metalness: 0.8, 
    roughness: 0.2 
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  bikeGroup.add(frame);
  
  // Wheels
  const wheelGeometry = new THREE.TorusGeometry(0.5, 0.03, 16, 100);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  
  const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  backWheel.position.set(-0.6, -0.3, 0);
  bikeGroup.add(backWheel);
  
  const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  frontWheel.position.set(0.6, -0.3, 0);
  bikeGroup.add(frontWheel);
  
  bikeGroup.scale.setScalar(1.5);
  bikeGroup.position.y = 0;
  scene.add(bikeGroup);
}

function addFogParticles() {
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0x00FFB2,
    size: 0.05,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
  // Animate particles
  const animateParticles = () => {
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] += 0.005;
      if (positions[i * 3 + 1] > 5) {
        positions[i * 3 + 1] = -5;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    requestAnimationFrame(animateParticles);
  };
  animateParticles();
}

function onMouseMove(event) {
  const rect = event.target.getBoundingClientRect();
  mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onResize() {
  if (!camera || !renderer) return;
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  if (!bikeGroup) {
    renderer.render(scene, camera);
    return;
  }
  
  // Auto rotation
  const autoRotationSpeed = 0.008;
  bikeGroup.rotation.y += autoRotationSpeed;
  
  // Mouse interaction
  if (isHovering) {
    targetRotationX = mouseY * 0.5;
    targetRotationY = mouseX * 0.5;
    
    bikeGroup.rotation.x += (targetRotationX - bikeGroup.rotation.x) * 0.05;
    bikeGroup.rotation.z += (-targetRotationY - bikeGroup.rotation.z) * 0.05;
  }
  
  renderer.render(scene, camera);
}