/* ============================================
   APEX TRAIL - Assembly 3D Scene
   Scroll-driven bike assembly animation
   ============================================ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let scene, camera, renderer, bikeModel;
let bikeParts = {};

export function initAssemblyScene() {
  const canvas = document.getElementById('assembly-canvas');
  if (!canvas) return;
  
  // Scene setup
  scene = new THREE.Scene();
  
  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true, 
    alpha: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  
  // Lighting
  setupLighting();
  
  // Load bike model
  loadBikeModel();
  
  // Event listeners
  window.addEventListener('resize', onResize);
  
  // Start animation loop
  animate();
}

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(5, 10, 7);
  mainLight.castShadow = true;
  scene.add(mainLight);
  
  const accentLight = new THREE.DirectionalLight(0x00FFB2, 0.5);
  accentLight.position.set(-5, 0, -5);
  scene.add(accentLight);
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
      const scale = 2.5 / maxDim;
      bikeModel.scale.setScalar(scale);
      
      // Identify and store parts for assembly animation
      categorizeParts(bikeModel);
      
      // Initially hide all parts
      Object.values(bikeParts).forEach(parts => {
        parts.forEach(part => {
          part.visible = false;
          // Store original position
          part.userData.originalPosition = part.position.clone();
          part.userData.originalRotation = part.rotation.clone();
        });
      });
      
      scene.add(bikeModel);
      
      // Setup scroll-driven assembly
      setupAssemblyAnimation();
    },
    undefined,
    (error) => {
      console.error('Error loading bike model for assembly:', error);
      createFallbackAssembly();
    }
  );
}

function categorizeParts(model) {
  // Categorize parts based on name or position
  model.traverse((child) => {
    if (!child.isMesh) return;
    
    const name = child.name.toLowerCase();
    
    if (name.includes('frame') || name.includes('main')) {
      if (!bikeParts.frame) bikeParts.frame = [];
      bikeParts.frame.push(child);
    } else if (name.includes('wheel') || name.includes('tire') || name.includes('rim')) {
      if (!bikeParts.wheels) bikeParts.wheels = [];
      bikeParts.wheels.push(child);
    } else if (name.includes('fork') || name.includes('suspension')) {
      if (!bikeParts.fork) bikeParts.fork = [];
      bikeParts.fork.push(child);
    } else if (name.includes('chain') || name.includes('gear') || name.includes('crank') || name.includes('pedal')) {
      if (!bikeParts.drivetrain) bikeParts.drivetrain = [];
      bikeParts.drivetrain.push(child);
    } else if (name.includes('handle') || name.includes('bar') || name.includes('stem') || name.includes('seat')) {
      if (!bikeParts.cockpit) bikeParts.cockpit = [];
      bikeParts.cockpit.push(child);
    } else {
      // Default to frame
      if (!bikeParts.frame) bikeParts.frame = [];
      bikeParts.frame.push(child);
    }
    
    child.castShadow = true;
    child.receiveShadow = true;
  });
}

function createFallbackAssembly() {
  // Create simplified representation if GLB fails
  const geometries = [];
  
  // Frame
  const frameGeo = new THREE.TorusGeometry(0.8, 0.08, 16, 50, Math.PI);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.name = 'frame';
  geometries.push(frame);
  
  // Wheels
  const wheelGeo = new THREE.TorusGeometry(0.5, 0.05, 16, 50);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  
  const wheel1 = new THREE.Mesh(wheelGeo, wheelMat);
  wheel1.position.set(-0.6, -0.3, 0);
  wheel1.name = 'wheel_back';
  geometries.push(wheel1);
  
  const wheel2 = new THREE.Mesh(wheelGeo, wheelMat);
  wheel2.position.set(0.6, -0.3, 0);
  wheel2.name = 'wheel_front';
  geometries.push(wheel2);
  
  // Fork
  const forkGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.8);
  const forkMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.9 });
  const fork = new THREE.Mesh(forkGeo, forkMat);
  fork.position.set(0.6, 0.2, 0);
  fork.name = 'fork';
  geometries.push(fork);
  
  bikeParts = {
    frame: [frame],
    wheels: [wheel1, wheel2],
    fork: [fork]
  };
  
  geometries.forEach(geo => {
    geo.visible = false;
    geo.userData.originalPosition = geo.position.clone();
    scene.add(geo);
  });
  
  setupAssemblyAnimation();
}

function setupAssemblyAnimation() {
  const assemblySection = document.querySelector('.assembly-section');
  if (!assemblySection) return;
  
  const partOrder = ['frame', 'wheels', 'fork', 'drivetrain', 'cockpit'];
  
  partOrder.forEach((partName, index) => {
    const parts = bikeParts[partName] || [];
    const startPercent = index / partOrder.length;
    const endPercent = (index + 1) / partOrder.length;
    
    parts.forEach(part => {
      // Entry animation
      gsap.fromTo(part,
        { 
          visible: false,
          position: {
            x: part.userData.originalPosition.x + (Math.random() - 0.5) * 2,
            y: part.userData.originalPosition.y + 2,
            z: part.userData.originalPosition.z + (Math.random() - 0.5) * 2
          }
        },
        {
          visible: true,
          position: {
            x: part.userData.originalPosition.x,
            y: part.userData.originalPosition.y,
            z: part.userData.originalPosition.z
          },
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: assemblySection,
            start: `${startPercent * 100}% top`,
            end: `${endPercent * 100}% top`,
            scrub: true,
            onUpdate: (self) => {
              part.visible = self.progress > 0.1;
            }
          }
        }
      );
    });
    
    // Trigger part label visibility
    const label = document.querySelector(`.part-label[data-part="${partName}"]`);
    if (label) {
      ScrollTrigger.create({
        trigger: assemblySection,
        start: `${(startPercent + 0.1) * 100}% center`,
        once: true,
        onEnter: () => label.classList.add('visible')
      });
    }
  });
  
  // Background blur-to-sharp transition
  const layers = document.querySelectorAll('.parallax-layer');
  layers.forEach((layer, i) => {
    gsap.to(layer, {
      opacity: 1 - (i * 0.2),
      scrollTrigger: {
        trigger: assemblySection,
        start: 'top top',
        end: 'center center',
        scrub: true
      }
    });
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
  
  if (bikeModel) {
    bikeModel.rotation.y += 0.001;
  }
  
  renderer.render(scene, camera);
}