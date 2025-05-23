import { loadContinueWatching } from './components/ContinueWatching.js';
import { initSearchOverlay }    from './components/SearchOverlay.js';
import { openShowModal, openMovieModal } from './components/ShowModal.js';

import { getAllMedia } from './components/MediaStore.js';
import {
  fetchSimilarMovies,
  fetchSimilarTV,
  fetchTrendingMovies,
  fetchTrendingTV
} from './components/TMDB.js';

import { createCarousel } from './components/Carousel.js';

const continueContainer      = document.getElementById('continue-watching-section');
const recommendedContainer   = document.getElementById('recommended-section');
const trendingMoviesContainer= document.getElementById('trending-movies-section');
const trendingTVContainer    = document.getElementById('trending-tv-section');

function refreshContinue() {
  loadContinueWatching(continueContainer, {
    onItemClick(item) {
      if (item.type === 'tv') openShowModal(item.id);
      else openMovieModal(item.id);
    }
  });
}

async function loadRecommended() {
  // grab last watched
  const all = getAllMedia();
  const items = Object.values(all)
    .sort((a, b) => b.last_updated - a.last_updated);
  if (!items.length) return;
  const last = items[0];

  // fetch similar
  let data;
  if (last.type === 'movie') data = await fetchSimilarMovies(last.id);
  else                         data = await fetchSimilarTV(last.id);

  const rows = (data.results || []).map(x => ({
    id: x.id,
    type: x.media_type || last.type,
    title: x.title || x.name,
    backdrop_path: x.backdrop_path,
    poster_path: x.poster_path
  }));

  if (!rows.length) return;
  recommendedContainer.innerHTML = `
    <h2 class="section-title">
      Recommended
    </h2>`;
  const carousel = createCarousel(rows, item => {
    item.type === 'tv' ? openShowModal(item.id) : openMovieModal(item.id);
  });
  recommendedContainer.appendChild(carousel);
}

async function loadTrending() {
  // Movies
  const tm = await fetchTrendingMovies('week');
  const mrows = (tm.results||[]).map(x => ({
    id: x.id, type: 'movie', title: x.title,
    backdrop_path: x.backdrop_path, poster_path: x.poster_path
  }));
  if (mrows.length) {
    trendingMoviesContainer.innerHTML = `<h2 class="section-title">Trending Movies</h2>`;
    trendingMoviesContainer.appendChild(
      createCarousel(mrows, i => openMovieModal(i.id))
    );
  }

  // TV
  const tv = await fetchTrendingTV('week');
  const trows = (tv.results||[]).map(x => ({
    id: x.id, type: 'tv', title: x.name,
    backdrop_path: x.backdrop_path, poster_path: x.poster_path
  }));
  if (trows.length) {
    trendingTVContainer.innerHTML = `<h2 class="section-title">Trending TV Shows</h2>`;
    trendingTVContainer.appendChild(
      createCarousel(trows, i => openShowModal(i.id))
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  refreshContinue();
  initSearchOverlay();
  loadRecommended();
  loadTrending();
  window.addEventListener('watch-data-updated', refreshContinue);
});
