// js/utils.js - Shared utilities for all pages

export const CATEGORY_COLORS = {
  'Tutorial': 'bg-primary/10 text-primary',
  'Opinion': 'bg-rose-100 text-rose-700',
  'Deep Dive': 'bg-blue-100 text-blue-700',
  'Notes': 'bg-amber-100 text-amber-700',
};

export function fmt(iso, options = {}) {
  const defaults = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(iso).toLocaleDateString('en-US', { ...defaults, ...options });
}

export function slugify(t) {
  return t.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function escHtml(s) {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
}

export function copyLink(btnId = 'share-btn') {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById(btnId);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1800);
    }
  });
}

export function renderContent(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(b => {
    if (!b || !b.type) return '';
    switch (b.type) {
      case 'p': return `<p>${b.text || ''}</p>`;
      case 'h2': return `<h2 id="${b.id || slugify(b.text)}">${b.text || ''}</h2>`;
      case 'h3': return `<h3 id="${b.id || slugify(b.text)}">${b.text || ''}</h3>`;
      case 'blockquote': return `<blockquote>${b.text || ''}</blockquote>`;
      case 'code': return `<pre><code>${escHtml(b.text || '')}</code></pre>`;
      case 'ul': 
        if (!Array.isArray(b.items)) return '';
        return `<ul>${b.items.map(i => `<li>${i || ''}</li>`).join('')}</ul>`;
      case 'ol':
        if (!Array.isArray(b.items)) return '';
        return `<ol>${b.items.map(i => `<li>${i || ''}</li>`).join('')}</ol>`;
      default: return '';
    }
  }).filter(Boolean).join('\n');
}

export function badge(cat, type = 'blog') {
  if (!cat) return '';
  const cls = type === 'blog' 
    ? (CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700')
    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20';
  return `<span class="px-2 py-0.5 rounded ${cls} font-medium">${cat}</span>`;
}

export function projectBadge(tag) {
  if (!tag) return '';
  return `<span class="px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-medium border border-outline-variant/20">${tag}</span>`;
}

export function createSkeletonGrid({ cols = [8, 4, 4, 4], heights = ['h-64', 'h-40', 'h-40', 'h-40'] } = {}) {
  return `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      ${cols.map((col, i) => `
        <div class="md:col-span-${col} skeleton ${heights[i] || 'h-40'}"></div>
      `).join('')}
    </div>`;
}

export function setupScrollProgress(progressElId = 'read-progress') {
  const el = document.getElementById(progressElId);
  if (!el) return;
  
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (window.scrollY / h * 100) : 0;
    el.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial
  return () => window.removeEventListener('scroll', onScroll);
}

export function setupToc(headings, tocEl, contentEl = '.prose') {
  if (!headings || !tocEl) return;
  
  tocEl.innerHTML = '';
  headings.forEach(h => {
    const hid = h.id || slugify(h.text);
    const a = document.createElement('a');
    a.href = `#${hid}`;
    a.className = `toc-link block text-sm text-on-surface-variant hover:text-primary transition ${h.type === 'h3' ? 'pl-3' : ''}`;
    a.textContent = h.text;
    tocEl.appendChild(a);
  });
  
  // Active link highlighting
  const sections = document.querySelectorAll(`${contentEl} h2[id], ${contentEl} h3[id]`);
  const links = tocEl.querySelectorAll('.toc-link');
  
  if (sections.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.remove('active'));
        const active = tocEl.querySelector(`[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }
}

export function setupSmoothScroll() {
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
}