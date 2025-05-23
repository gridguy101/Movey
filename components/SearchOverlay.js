// components/SearchOverlay.js
import { openShowModal, openMovieModal } from './ShowModal.js';
import { searchMulti } from './TMDB.js';

export function initSearchOverlay() {
  const overlay = document.getElementById('searchOverlay');
  const openBtn = document.getElementById('searchOpen');
  const closeBtn = document.getElementById('searchClose');
  const input   = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  openBtn.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    input.value = '';
    results.innerHTML = '';
    input.focus();
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  async function doSearch() {
    const q = input.value.trim();
    if (!q) return;
    results.innerHTML = `<p style="color:var(--subtle)">Searching…</p>`;

    try {
      const { results: items = [] } = await searchMulti(q);
      renderResults(items);
    } catch {
      results.innerHTML = `<p style="color:var(--error)">Error fetching results.</p>`;
    }
  }

  function renderResults(items) {
    if (!items.length) {
      results.innerHTML = `<p style="color:var(--subtle)">No results.</p>`;
      return;
    }
    results.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'search-card';
      const title = item.media_type === 'movie' ? item.title : item.name;
      const imgPath = item.poster_path || item.backdrop_path;

      card.innerHTML = `
        ${imgPath
          ? `<img src="https://image.tmdb.org/t/p/w300${imgPath}" alt="${title}" />`
          : `<div class="placeholder-img"><span class="placeholder-icon">🎥</span></div>`}
        <h4>${title}</h4>
      `;

      card.addEventListener('click', () => {
        overlay.classList.add('hidden');
        if (item.media_type === 'tv') openShowModal(item.id);
        else openMovieModal(item.id);
      });

      results.appendChild(card);
    });
  }
}
