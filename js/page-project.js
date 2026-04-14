// js/page-project.js - Logic for project.html

import { renderContent, copyLink, slugify, setupScrollProgress, setupToc, setupSmoothScroll, projectBadge } from './utils.js';

function showNotFound() {
  const contentWrap = document.getElementById('content-wrap');
  const notFound = document.getElementById('not-found');
  if (contentWrap) contentWrap.classList.add('hidden');
  if (notFound) notFound.classList.remove('hidden');
}

export async function initProjectPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (!id) { showNotFound(); return; }
  
  try {
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const allProjects = await res.json();
    const project = allProjects.find(p => p.id === id);
    
    if (!project) { showNotFound(); return; }
    
    // Update page title
    document.title = `${project.name} — BucketHQ`;
    
    // Header meta
    const metaEl = document.getElementById('project-meta');
    if (metaEl) {
      metaEl.innerHTML = `<span>${project.stars || '0'} ⭐</span><span>•</span><span>Open Source</span>`;
    }
    
    // Title and description
    const titleEl = document.getElementById('project-title');
    const descEl = document.getElementById('project-long-desc');
    if (titleEl) titleEl.textContent = project.name;
    if (descEl) descEl.textContent = project.longDescription || project.shortDescription || '';
    
    // Action buttons in header
    const actionsEl = document.getElementById('project-actions');
    if (actionsEl) {
      const actions = [];
      if (project.links?.demo) {
        actions.push(`<a href="${project.links.demo}" onclick="event.stopPropagation()" class="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-dim transition text-sm font-medium">Live Demo</a>`);
      }
      if (project.links?.source) {
        actions.push(`<a href="${project.links.source}" onclick="event.stopPropagation()" class="px-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-high transition text-sm font-medium">View Source</a>`);
      }
      actionsEl.innerHTML = actions.join(' ');
    }
    
    // Tags
    const tagsEl = document.getElementById('project-tags');
    if (tagsEl && Array.isArray(project.tags)) {
      tagsEl.innerHTML = project.tags.map(projectBadge).join('');
    }
    
    // Body content
    const bodyEl = document.getElementById('project-body');
    if (bodyEl && Array.isArray(project.content)) {
      bodyEl.innerHTML = renderContent(project.content);
    }
    
    // Footer action buttons
    const footerSource = document.getElementById('footer-source');
    const footerDemo = document.getElementById('footer-demo');
    if (footerSource) {
      if (project.links?.source) {
        footerSource.href = project.links.source;
        footerSource.classList.remove('hidden');
      } else {
        footerSource.classList.add('hidden');
      }
    }
    if (footerDemo) {
      if (project.links?.demo) {
        footerDemo.href = project.links.demo;
        footerDemo.classList.remove('hidden');
      } else {
        footerDemo.classList.add('hidden');
      }
    }
    
    // TOC
    const tocEl = document.getElementById('toc');
    if (tocEl && Array.isArray(project.content)) {
      const headings = project.content.filter(b => b && (b.type === 'h2' || b.type === 'h3'));
      setupToc(headings, tocEl);
    }
    
    // Share on X
    const shareX = document.getElementById('share-x');
    if (shareX) {
      shareX.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${project.name}`)}&url=${encodeURIComponent(window.location.href)}`;
    }
    
    // Related projects
    const relatedEl = document.getElementById('related');
    if (relatedEl) {
      const related = allProjects.filter(p => p.id !== id).slice(0, 2);
      relatedEl.innerHTML = related.map(p => `
        <a href="project.html?id=${p.id}" class="group p-5 rounded-xl border border-outline-variant/20 hover:border-primary/30 bg-surface-container-lowest transition">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-on-surface-variant">${p.tags?.[0] || 'Project'}</span>
            <span class="text-xs text-on-surface-variant">${p.stars || '0'} ⭐</span>
          </div>
          <h3 class="text-sm font-semibold text-on-background group-hover:text-primary transition leading-snug">${p.name}</h3>
          <p class="text-xs text-on-surface-variant mt-1 line-clamp-2">${p.shortDescription || ''}</p>
        </a>`).join('');
    }
    
    // Show content, hide skeleton
    const skeleton = document.getElementById('skeleton');
    const projectWrap = document.getElementById('project-wrap');
    if (skeleton) skeleton.classList.add('hidden');
    if (projectWrap) projectWrap.classList.remove('hidden');
    
    // Init scroll progress
    setupScrollProgress();
    
    // Smooth scroll for TOC
    setupSmoothScroll();
    
  } catch (err) {
    console.error('Failed to load project:', err);
    showNotFound();
  }
}

// Auto-init if loaded directly
if (import.meta.url.endsWith('page-project.js')) {
  document.addEventListener('DOMContentLoaded', initProjectPage);
}