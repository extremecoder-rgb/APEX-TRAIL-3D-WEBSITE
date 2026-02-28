/* ============================================
   APEX TRAIL - Animated Counters
   ============================================ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCounters() {
  const counters = document.querySelectorAll('.spec-counter');
  const specsSection = document.querySelector('.specs-section');
  
  if (!counters.length || !specsSection) return;
  
  const counterData = [];
  
  counters.forEach(counter => {
    const valueEl = counter.querySelector('.counter-value');
    const target = parseFloat(counter.dataset.target);
    const decimals = parseInt(counter.dataset.decimals) || 0;
    
    if (!valueEl || isNaN(target)) return;
    
    counterData.push({ element: counter, valueEl, target, decimals, animated: false });
  });
  
  ScrollTrigger.create({
    trigger: specsSection,
    start: 'top 60%',
    end: 'bottom 40%',
    onUpdate: (self) => {
      counterData.forEach(data => {
        if (data.animated) return;
        
        if (self.progress > 0.1) {
          data.animated = true;
          const obj = { value: 0 };
          gsap.to(obj, {
            value: data.target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              data.valueEl.textContent = obj.value.toFixed(data.decimals);
            }
          });
        }
      });
    }
  });
}