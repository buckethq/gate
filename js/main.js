// js/main.js - Component loader and global init

export async function loadComponent(selector, filePath) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const el = document.querySelector(selector);
    if (el) {
      el.innerHTML = html;
      // Post-load hooks
      if (filePath.includes('footer')) {
        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
      }
      if (filePath.includes('nav')) {
        setupNavActiveState();
      }
    }
  } catch (err) {
    console.error(`Failed to load component ${filePath}:`, err);
    // Fallback: hide placeholder to avoid broken UI
    const el = document.querySelector(selector);
    if (el) el.style.display = 'none';
  }
}

function setupNavActiveState() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;
  
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const hash = window.location.hash;
  
  const navItems = [
    { href: 'index.html', label: 'Home', match: p => p === 'index.html' || p === '' },
    { href: 'blogs.html', label: 'Blogs', match: p => p === 'blogs.html' },
    { href: 'index.html#projects', label: 'Projects', match: p => p === 'index.html' && hash === '#projects' },
    { href: 'index.html#about', label: 'About', match: p => p === 'index.html' && hash === '#about' },
    { href: 'index.html#contact', label: 'Contact', match: p => p === 'index.html' && hash === '#contact' },
  ];
  
  navLinks.innerHTML = navItems.map(item => {
    const isActive = item.match(path);
    const classes = isActive 
      ? 'text-primary font-semibold' 
      : 'hover:text-primary transition-colors';
    return `<a class="${classes}" href="${item.href}">${item.label}</a>`;
  }).join('');
}

export function initGlobal() {
  // Set up smooth scrolling for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Close mobile menu if needed (placeholder for future expansion)
}

// Auto-init if this script is loaded directly (for simple pages)
if (import.meta.url.endsWith('main.js')) {
  document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('#nav-placeholder', 'components/nav.html');
    await loadComponent('#footer-placeholder', 'components/footer.html');
    initGlobal();
  });
}