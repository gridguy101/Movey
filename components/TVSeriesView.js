import { fetchTVDetails, fetchSeasonDetails } from './TMDB.js';
import { getAllMedia } from './MediaStore.js';
import { openEpisodeModal } from './ShowModal.js';

export async function renderTVSeriesView(container, tmdbId) {
  const data = await fetchTVDetails(tmdbId);
  if (!data) return container.innerHTML = '<p>Show not found.</p>';

  const progressData = getAllMedia()[`t${tmdbId}`] || {};
  const seasonsList = data.seasons
    .filter(s => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const defaultSeason = seasonsList[0]?.season_number || 1;
  let currentSeason = seasonsList.some(s => s.season_number === progressData.last_season_watched)
    ? progressData.last_season_watched
    : defaultSeason;

  container.innerHTML = `
    <div class="tv-banner"
         style="background-image: url(https://image.tmdb.org/t/p/w1280${data.backdrop_path});">
      <div class="tv-banner-overlay">
        <h2 class="tv-title">${data.name}</h2>
        <p class="tv-description">${data.overview}</p>
      </div>
    </div>
    <div class="tv-controls">
      <label class="tv-label" for="seasonSelect">Season:</label>
      <select class="tv-select" id="seasonSelect">
        ${seasonsList.map(s =>
          `<option value="${s.season_number}">${s.name}</option>`).join('')}
      </select>
    </div>
    <div id="episodeList"></div>
  `;

  const seasonSelect = container.querySelector('#seasonSelect');
  seasonSelect.value = currentSeason;
  seasonSelect.addEventListener('change', () => {
    currentSeason = +seasonSelect.value;
    renderEpisodes();
  });

  async function renderEpisodes() {
    const season = await fetchSeasonDetails(tmdbId, currentSeason);
    const episodeList = container.querySelector('#episodeList');
    episodeList.innerHTML = '';

    season.episodes.forEach(ep => {
      const epKey = `s${ep.season_number}e${ep.episode_number}`;
      const epProg = progressData.show_progress?.[epKey]?.progress || null;
      const watchedPct = epProg
        ? Math.floor((epProg.watched / epProg.duration) * 100)
        : 0;

      const card = document.createElement('div');
      card.className = 'episode-card';
      card.innerHTML = `
        <div class="episode-thumb"
             style="background-image: url(https://image.tmdb.org/t/p/w300${ep.still_path});"></div>
        <div class="episode-info">
          <h3>Ep ${ep.episode_number} — ${ep.name}</h3>
          <p class="episode-meta">${ep.runtime || 45} min</p>
          <p class="episode-overview">${ep.overview || ''}</p>
          ${
            epProg
              ? `<div class="progress-bar"><div style="width:${watchedPct}%"></div></div>`
              : ''
          }
          <button class="play-btn"
                  data-season="${ep.season_number}"
                  data-episode="${ep.episode_number}">
            ▶ ${watchedPct>0?'Resume':'Play'}
          </button>
        </div>
      `;

      card.querySelector('.play-btn').addEventListener('click', (e) => {
        const s = e.currentTarget.dataset.season;
        const epNum = e.currentTarget.dataset.episode;
        openEpisodeModal(tmdbId, s, epNum);
      });

      episodeList.appendChild(card);
    });
  }

  renderEpisodes();
}
