// components/ShowModal.js
import { renderTVSeriesView } from './TVSeriesView.js';
import { openPlayerView } from './PlayerView.js';

export function openShowModal(tmdbId) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  content.innerHTML = '<p>Loading show info…</p>';
  overlay.classList.remove('hidden');
  renderTVSeriesView(content, tmdbId);
}

export function openMovieModal(movieId) {
  closeShowModal();
  openPlayerView({ type: 'movie', id: movieId });
}

export function openEpisodeModal(tvId, season, episode) {
  closeShowModal();
  openPlayerView({ type: 'tv', id: tvId, season: +season, episode: +episode });
}

export function closeShowModal() {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  content.innerHTML = '';
  overlay.classList.add('hidden');
}

// Wire up the close button and ESC key
document.getElementById('modalClose').addEventListener('click', closeShowModal);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeShowModal();
});
