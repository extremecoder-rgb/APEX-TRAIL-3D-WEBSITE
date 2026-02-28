/* ============================================
   APEX TRAIL - Scroll Animations
   ============================================ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  initAssemblyLabels();
  initParallaxLayers();
  initRevealAnimations();
  initNavScroll();
}

// Assembly section part labels
function initAssemblyLabels() {
  const partLabels = document.querySelectorAll('.part-label');
  
  partLabels.forEach((label, i) => {
    ScrollTrigger.create({
      trigger: label,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to(label, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out'
        });
      }
    });
  });
}

// Parallax background layers in assembly section
function initParallaxLayers() {
  const layers = document.querySelectorAll('.parallax-layer');
  
  layers.forEach((layer, i) => {
    const speed = parseFloat(layer.dataset.speed) || 0.2;
    
    gsap.to(layer, {
      opacity: 1,
      scrollTrigger: {
        trigger: '.assembly-section',
        start: 'top bottom',
        end: 'center center',
        scrub: true
      }
    });
  });
  
  // Parallax movement
  gsap.utils.toArray('.parallax-layer').forEach((layer, i) => {
    const speed = parseFloat(layer.dataset.speed) || 0.2;
    
    gsap.to(layer, {
      y: () => window.innerHeight * speed * 0.5,
      scrollTrigger: {
        trigger: '.assembly-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

// General reveal animations
function initRevealAnimations() {
  // Section titles
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 80%',
        once: true
      }
    });
  });
  
  // Section subtitles
  gsap.utils.toArray('.section-subtitle').forEach(subtitle => {
    gsap.from(subtitle, {
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: subtitle,
        start: 'top 80%',
        once: true
      }
    });
  });
  
  // Material cards
  gsap.utils.toArray('.material-card').forEach((card, i) => {
    gsap.from(card, {
      y: 80,
      opacity: 0,
      duration: 1,
      delay: i * 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      }
    });
  });
  
  // Color options
  gsap.utils.toArray('.color-option').forEach((option, i) => {
    gsap.from(option, {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: option,
        start: 'top 85%',
        once: true
      }
    });
  });
}

// Navigation background on scroll
function initNavScroll() {
  const nav = document.querySelector('.main-nav');
  
  if (!nav) return;
  
  ScrollTrigger.create({
    start: 'top -100',
    end: 99999,
    toggleClass: { className: 'scrolled', targets: nav }
  });
}