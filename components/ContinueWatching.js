// components/ContinueWatching.js
import { getAllMedia } from './MediaStore.js';
import { fetchMediaDetails } from './TMDB.js';
import { createCarousel } from './Carousel.js';

export async function loadContinueWatching(container, options = {}) {
  const all = getAllMedia();
  const mediaItems = Object.values(all);
  if (!mediaItems.length) {
    container.innerHTML = ''; 
    return;
  }

  // build rows
  const rows = await Promise.all(mediaItems.map(async item => {
    let meta = null;
    try { meta = await fetchMediaDetails(item.type, item.id); } catch {}
    return {
      id: item.id,
      type: item.type,
      title:        item.title       || meta?.title || meta?.name || 'Untitled',
      backdrop_path: meta?.backdrop_path || item.backdrop_path,
      poster_path:   meta?.poster_path   || item.poster_path,
      last_updated:  item.last_updated || 0
    };
  }));

  if (!rows.length) {
    container.innerHTML = '';
    return;
  }

  // sort
  rows.sort((a, b) => b.last_updated - a.last_updated);

  // render
  container.innerHTML = '';
  const section = document.createElement('div');
  section.innerHTML = `<h2 class="section-title">Continue Watching</h2>`;
  const carousel = createCarousel(rows, options.onItemClick, {
    removable: true,
    onRemove: options.onRemove
  });
  section.appendChild(carousel);
  container.appendChild(section);
}
