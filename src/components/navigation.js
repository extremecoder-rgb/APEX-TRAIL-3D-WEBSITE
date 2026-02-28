/* ============================================
   APEX TRAIL - Navigation
   ============================================ */

export function initNavigation() {
  const nav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (!nav) return;
  
  // Add scrolled class on scroll
  let lastScrollY = 0;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScrollY = scrollY;
  }, { passive: true });
  
  // Smooth scroll to sections
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // CTA button scroll to configurator
  const navCta = document.querySelector('.nav-cta');
  if (navCta) {
    navCta.addEventListener('click', () => {
      const configurator = document.querySelector('#configurator');
      if (configurator) {
        configurator.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  // Hero CTA scroll to assembly
  const heroCta = document.querySelector('.hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', () => {
      const assembly = document.querySelector('#assembly');
      if (assembly) {
        assembly.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}