/* ============================================
   APEX TRAIL - Ride Modes Horizontal Scroll
   ============================================ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initRideModes() {
  const container = document.querySelector('.ride-modes-container');
  const track = document.querySelector('.ride-modes-track');
  const cards = document.querySelectorAll('.ride-mode-card');
  const dots = document.querySelectorAll('.mode-dot');
  const progressFill = document.querySelector('.progress-fill');
  
  if (!container || !track || !cards.length) return;
  
  const cardCount = cards.length;
  
  // Create horizontal scroll animation
  const scrollTween = gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Update progress bar
        if (progressFill) {
          progressFill.style.width = `${self.progress * 100}%`;
        }
        
        // Update dots
        const activeIndex = Math.min(
          Math.floor(self.progress * cardCount),
          cardCount - 1
        );
        
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === activeIndex);
        });
      }
    }
  });
  
  // Click on dots to scroll
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const progress = i / (cardCount - 1);
      const scrollTrigger = scrollTween.scrollTrigger;
      const targetScroll = scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress;
      
      gsap.to(window, {
        scrollTo: targetScroll,
        duration: 1,
        ease: 'power2.inOut'
      });
    });
  });
  
  // 3D tilt effect on cards
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });
}