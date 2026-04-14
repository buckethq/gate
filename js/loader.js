// js/loader.js - Functions to load and render cards on index.html

import { fmt, badge, createSkeletonGrid } from './utils.js';

export function renderBlogCard(post, variant = 'small') {
  if (variant === 'featured') {
    return `
      <article onclick="location.href='blog-post.html?id=${post.id}'"
        class="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition group cursor-pointer">
        <div class="flex items-center gap-3 text-xs text-on-surface-variant mb-4">
          ${badge(post.category)}
          <span>•</span><time>${fmt(post.date)}</time>
          <span>•</span><span>${post.readTime} read</span>
        </div>
        <h3 class="text-2xl font-bold tracking-tight mb-3 text-on-background group-hover:text-primary transition">${post.title}</h3>
        <p class="text-on-surface-variant leading-relaxed font-light mb-6">${post.excerpt}</p>
        <div class="flex items-center text-sm font-medium text-primary">Read article <span class="ml-1 group-hover:translate-x-0.5 transition-transform">→</span></div>
      </article>`;
  }
  
  // Small card
  return `
    <article onclick="location.href='blog-post.html?id=${post.id}'"
      class="md:col-span-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition group cursor-pointer">
      <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-3">
        ${badge(post.category)}
        <time>${fmt(post.date)}</time>
      </div>
      <h3 class="text-lg font-bold tracking-tight mb-2 text-on-background group-hover:text-primary transition">${post.title}</h3>
      <p class="text-on-surface-variant text-sm font-light leading-relaxed">${post.excerpt}</p>
    </article>`;
}

export function renderProjectCard(project, variant = 'small') {
  const tagBadges = (project.tags || []).map(tag => 
    `<span class="px-2 py-0.5 text-xs rounded bg-surface-container-high text-on-surface-variant">${tag}</span>`
  ).join('');
  
  if (variant === 'featured') {
    const features = (project.features || []).map(f => 
      `<li class="flex items-start"><span class="mr-2">•</span>${f}</li>`
    ).join('');
    const demoLink = project.links?.demo 
      ? `<a href="${project.links.demo}" onclick="event.stopPropagation()" class="px-3 py-1.5 text-xs font-medium rounded-md bg-on-background text-on-primary hover:opacity-90 transition">Live Demo</a>` 
      : '';
    const sourceLink = project.links?.source 
      ? `<a href="${project.links.source}" onclick="event.stopPropagation()" class="px-3 py-1.5 text-xs font-medium rounded-md border border-outline-variant hover:bg-surface-container-high transition">Source</a>` 
      : '';
    
    return `
      <article onclick="location.href='project.html?id=${project.id}'" 
        class="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition group cursor-pointer">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <h3 class="text-2xl font-bold tracking-tight text-on-background group-hover:text-primary transition">${project.name}</h3>
            <p class="text-on-surface-variant font-light mt-1">${project.shortDescription}</p>
          </div>
          <div class="flex gap-2" onclick="event.stopPropagation()">
            ${demoLink}
            ${sourceLink}
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-6">
          ${tagBadges}
        </div>
        ${features ? `<ul class="space-y-2 text-on-surface-variant font-light text-sm">${features}</ul>` : ''}
      </article>`;
  }
  
  // Small project card
  return `
    <article onclick="location.href='project.html?id=${project.id}'" 
      class="md:col-span-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition group cursor-pointer">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold tracking-tight text-on-background group-hover:text-primary transition">${project.name}</h3>
        <span class="text-xs text-on-surface-variant">${project.stars || '0'} ⭐</span>
      </div>
      <p class="text-on-surface-variant text-sm font-light leading-relaxed mb-4">${project.shortDescription}</p>
      <div class="flex flex-wrap gap-1.5">
        ${tagBadges}
      </div>
    </article>`;
}

export async function loadBlogs(gridId = 'blog-grid', skeletonId = 'blog-skeleton', limit = 4) {
  const skeletonEl = document.getElementById(skeletonId);
  const gridEl = document.getElementById(gridId);
  
  if (!gridEl) return;
  
  try {
    const res = await fetch('blogs.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();
    const latest = posts.slice(0, limit);
    const [featured, ...rest] = latest;
    
    let html = '';
    if (featured) html += renderBlogCard(featured, 'featured');
    rest.forEach(p => { html += renderBlogCard(p, 'small'); });
    
    if (skeletonEl) skeletonEl.classList.add('hidden');
    gridEl.innerHTML = html;
    gridEl.classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load blogs:', err);
    if (skeletonEl) skeletonEl.classList.add('hidden');
  }
}

export async function loadProjects(gridId = 'project-grid', skeletonId = 'project-skeleton', limit = 4) {
  const skeletonEl = document.getElementById(skeletonId);
  const gridEl = document.getElementById(gridId);
  
  if (!gridEl) return;
  
  try {
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = await res.json();
    
    const featured = projects.find(p => p.featured) || projects[0];
    const small = projects.filter(p => p.id !== featured?.id).slice(0, limit - 1);
    
    let html = '';
    if (featured) html += renderProjectCard(featured, 'featured');
    small.forEach(p => { html += renderProjectCard(p, 'small'); });
    
    if (skeletonEl) skeletonEl.classList.add('hidden');
    gridEl.innerHTML = html;
    gridEl.classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load projects:', err);
    if (skeletonEl) skeletonEl.classList.add('hidden');
  }
}