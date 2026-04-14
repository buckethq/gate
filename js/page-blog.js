// js/page-blog.js - Logic for blog-post.html

import { fmt, badge, renderContent, copyLink, slugify, setupScrollProgress, setupToc, setupSmoothScroll } from './utils.js';

const CATEGORY_COLORS = {
  'Tutorial': 'bg-primary/10 text-primary',
  'Opinion': 'bg-rose-100 text-rose-700',
  'Deep Dive': 'bg-blue-100 text-blue-700',
  'Notes': 'bg-amber-100 text-amber-700',
};

function showNotFound() {
  const contentWrap = document.getElementById('content-wrap');
  const notFound = document.getElementById('not-found');
  if (contentWrap) contentWrap.classList.add('hidden');
  if (notFound) notFound.classList.remove('hidden');
}

export async function initBlogPost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (!id) { showNotFound(); return; }
  
  try {
    const res = await fetch('blogs.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const allPosts = await res.json();
    const post = allPosts.find(p => p.id === id);
    
    if (!post) { showNotFound(); return; }
    
    // Update page title
    document.title = `${post.title} — BucketHQ`;
    
    // Meta row
    const catCls = CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700';
    const metaEl = document.getElementById('meta');
    if (metaEl) {
      metaEl.innerHTML = `
        <span class="px-2 py-0.5 rounded ${catCls} font-medium">${post.category}</span>
        <time>${fmt(post.date, { month: 'long' })}</time>
        <span>•</span>
        <span>${post.readTime} read</span>`;
    }
    
    // Title
    const titleEl = document.getElementById('post-title');
    if (titleEl) titleEl.textContent = post.title;
    
    // Body content
    const bodyEl = document.getElementById('post-body');
    if (bodyEl && Array.isArray(post.content)) {
      bodyEl.innerHTML = renderContent(post.content);
    }
    
    // Tags
    const tagsEl = document.getElementById('post-tags');
    if (tagsEl && Array.isArray(post.tags)) {
      tagsEl.innerHTML = post.tags.map(t => 
        `<span class="px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-medium border border-outline-variant/20">${t}</span>`
      ).join('');
    }
    
    // TOC
    const tocEl = document.getElementById('toc');
    if (tocEl && Array.isArray(post.content)) {
      const headings = post.content.filter(b => b && (b.type === 'h2' || b.type === 'h3'));
      setupToc(headings, tocEl);
    }
    
    // Share on X
    const shareX = document.getElementById('share-x');
    if (shareX) {
      shareX.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`;
    }
    
    // Related posts
    const relatedEl = document.getElementById('related');
    if (relatedEl) {
      const related = allPosts.filter(p => p.id !== id).slice(0, 2);
      relatedEl.innerHTML = related.map(p => `
        <a href="blog-post.html?id=${p.id}" class="group p-5 rounded-xl border border-outline-variant/20 hover:border-primary/30 bg-surface-container-lowest transition">
          <span class="text-xs text-on-surface-variant">${p.category} • ${fmt(p.date)}</span>
          <h3 class="text-sm font-semibold text-on-background mt-1 group-hover:text-primary transition leading-snug">${p.title}</h3>
        </a>`).join('');
    }
    
    // Show content, hide skeleton
    const skeleton = document.getElementById('skeleton');
    const articleWrap = document.getElementById('article-wrap');
    if (skeleton) skeleton.classList.add('hidden');
    if (articleWrap) articleWrap.classList.remove('hidden');
    
    // Init scroll progress
    setupScrollProgress();
    
    // Smooth scroll for TOC
    setupSmoothScroll();
    
  } catch (err) {
    console.error('Failed to load blog post:', err);
    showNotFound();
  }
}

// Auto-init if loaded directly
if (import.meta.url.endsWith('page-blog.js')) {
  document.addEventListener('DOMContentLoaded', initBlogPost);
}