/* ============================================
   APEX TRAIL - Particle System
   Ambient dust/dust particles for hero section
   ============================================ */

export function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  
  const particleCount = 50;
  const particles = [];
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    createParticle(container, particles);
  }
  
  // Animation loop
  let animationId;
  let isVisible = true;
  
  function animate() {
    if (!isVisible) return;
    
    particles.forEach(particle => {
      updateParticle(particle);
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  animate();
  
  // Pause when not visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationId) {
        animate();
      }
    });
  });
  
  observer.observe(container);
  
  // Cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isVisible = false;
      cancelAnimationFrame(animationId);
      animationId = null;
    } else {
      isVisible = true;
      animate();
    }
  });
}

function createParticle(container, particles) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  // Random properties
  const size = Math.random() * 3 + 1;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  
  particle.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${startX}%;
    top: ${startY}%;
    opacity: ${Math.random() * 0.5 + 0.1};
  `;
  
  container.appendChild(particle);
  
  const particleData = {
    element: particle,
    x: startX,
    y: startY,
    speedX: (Math.random() - 0.5) * 0.02,
    speedY: -Math.random() * 0.05 - 0.01,
    opacity: parseFloat(particle.style.opacity),
    phase: Math.random() * Math.PI * 2
  };
  
  particles.push(particleData);
  
  return particleData;
}

function updateParticle(particle) {
  // Update position
  particle.x += particle.speedX;
  particle.y += particle.speedY;
  
  // Add subtle wobble
  particle.x += Math.sin(Date.now() * 0.001 + particle.phase) * 0.01;
  
  // Wrap around
  if (particle.y < -5) {
    particle.y = 105;
    particle.x = Math.random() * 100;
  }
  
  if (particle.x < -5) particle.x = 105;
  if (particle.x > 105) particle.x = -5;
  
  // Apply transform
  particle.element.style.left = `${particle.x}%`;
  particle.element.style.top = `${particle.y}%`;
  
  // Fade based on height
  const fadeOpacity = particle.y < 20 ? particle.y / 20 * particle.opacity : particle.opacity;
  particle.element.style.opacity = Math.max(0, fadeOpacity);
}