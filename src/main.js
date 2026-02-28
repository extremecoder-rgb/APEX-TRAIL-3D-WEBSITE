/* ============================================
   APEX TRAIL - Main Entry Point
   ============================================ */

import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initCursor } from './components/cursor.js';
import { initNavigation } from './components/navigation.js';
import { initParticles } from './components/particles.js';
import { initCounters } from './animations/counters.js';
import { initScrollAnimations } from './animations/scroll.js';
import { initColorConfigurator } from './components/configurator.js';
import { initRideModes } from './components/rideModes.js';

import { initHeroScene } from './three/heroScene.js';
import { initAssemblyScene } from './three/assemblyScene.js';
import { initTerrainScene } from './three/terrainScene.js';
import { initConfiguratorScene } from './three/configuratorScene.js';

gsap.registerPlugin(ScrollTrigger);

// Initialize smooth scrolling with Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Update todo progress
  updateProgress(1);
  
  // Initialize UI components
  initCursor();
  initNavigation();
  initParticles();
  initCounters();
  initScrollAnimations();
  initColorConfigurator();
  initRideModes();
  
  // Initialize 3D scenes
  initHeroScene();
  initAssemblyScene();
  initTerrainScene();
  initConfiguratorScene();
  
  // Hero entrance animations
  initHeroAnimations();
  
  // Scroll progress indicator
  initScrollProgress();
  
  console.log('APEX TRAIL initialized');
});

// Hero entrance animations
function initHeroAnimations() {
  const heroLines = document.querySelectorAll('.hero-title-line');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroCta = document.querySelector('.hero-cta');
  
  setTimeout(() => {
    heroLines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add('visible');
      }, i * 200);
    });
  }, 500);
  
  setTimeout(() => {
    heroSubtitle?.classList.add('visible');
  }, 900);
  
  setTimeout(() => {
    heroCta?.classList.add('visible');
  }, 1100);
}

// Scroll progress indicator
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  
  if (!progressBar) return;
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

// Progress tracking helper
function updateProgress(step) {
  // This function can be used to track implementation progress
  console.log(`Initialization step ${step} complete`);
}

// Handle resize
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});

// Preload critical assets
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});