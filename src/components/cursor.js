/* ============================================
   APEX TRAIL - Custom Cursor
   ============================================ */

export function initCursor() {
  const cursor = document.querySelector('.cursor');
  const cursorCrosshair = document.querySelector('.cursor-crosshair');
  
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;
  
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let isMoving = false;
  let moveTimeout;
  
  // Track mouse movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    isMoving = true;
    cursor.classList.add('moving');
    
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      isMoving = false;
      cursor.classList.remove('moving');
    }, 100);
  }, { passive: true });
  
  // Smooth cursor animation
  function animateCursor() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    
    cursorX += dx * 0.15;
    cursorY += dy * 0.15;
    
    cursor.style.transform = `translate(${cursorX - 12}px, ${cursorY - 12}px)`;
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
  
  // Hover states for interactive elements
  const interactiveElements = document.querySelectorAll('a, button, [role="button"], .ride-mode-card, .color-option');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
    });
  });
  
  // Magnetic effect on buttons
  const magneticElements = document.querySelectorAll('.hero-cta, .nav-cta');
  
  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}