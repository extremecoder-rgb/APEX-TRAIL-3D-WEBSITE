/* ============================================
   APEX TRAIL - Color Configurator
   ============================================ */

export function initColorConfigurator() {
  const colorOptions = document.querySelectorAll('.color-option');
  const colorName = document.querySelector('.selected-color-name');
  const colorMood = document.querySelector('.selected-color-mood');
  
  if (!colorOptions.length) return;
  
  // Color data
  const colorData = {
    'stealth-black': { name: 'Stealth Black', mood: 'Understated dominance', hex: '#1a1a1a' },
    'alpine-white': { name: 'Alpine White', mood: 'Pristine summit snow', hex: '#f5f5f5' },
    'lava-red': { name: 'Lava Red', mood: 'Volcanic intensity', hex: '#cc2200' },
    'electric-teal': { name: 'Electric Teal', mood: 'High-voltage energy', hex: '#00FFB2' },
    'obsidian-gray': { name: 'Obsidian Gray', mood: 'Timeless sophistication', hex: '#3d3d3d' },
    'neon-volt': { name: 'Neon Volt', mood: 'Unapologetic speed', hex: '#ccff00' }
  };
  
  // Set initial active state
  colorOptions[0].classList.add('active');
  
  // Handle color selection
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active from all
      colorOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active to clicked
      option.classList.add('active');
      
      // Get color data
      const colorKey = option.dataset.color;
      const data = colorData[colorKey];
      
      // Update text with animation
      updateColorInfo(data);
      
      // Dispatch custom event for 3D scene
      window.dispatchEvent(new CustomEvent('colorChange', {
        detail: { color: colorKey, hex: data.hex }
      }));
    });
  });
  
  function updateColorInfo(data) {
    // Animate out
    colorName.style.opacity = '0';
    colorMood.style.opacity = '0';
    colorName.style.transform = 'translateY(-10px)';
    colorMood.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      // Update text
      colorName.textContent = data.name;
      colorMood.textContent = data.mood;
      
      // Animate in
      colorName.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      colorMood.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s';
      colorName.style.opacity = '1';
      colorMood.style.opacity = '1';
      colorName.style.transform = 'translateY(0)';
      colorMood.style.transform = 'translateY(0)';
    }, 200);
  }
}