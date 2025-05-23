// components/PlayerView.js
import { fetchTVDetails, fetchSeasonDetails } from './TMDB.js';
import { saveMediaData } from './MediaStore.js';

window.addEventListener('message', ({ origin, data }) => {
  if (origin !== 'https://vidfast.pro' || !data) return;
  if (data.type === 'MEDIA_DATA' || data.type === 'PLAYER_EVENT') {
    saveMediaData(data.data);
  }
});

const overlay = document.getElementById('playerOverlay');
const backBtn = document.getElementById('playerBack');
const titleEl = document.getElementById('playerTitle');
const controls = document.getElementById('playerControls');
const wrapper = document.getElementById('playerWrapper');

backBtn.addEventListener('click', closePlayerView);

export async function openPlayerView({ type, id, season = 1, episode = 1 }) {
  overlay.classList.remove('hidden');

  if (type === 'movie') {
    titleEl.textContent = '';
    controls.innerHTML = '';
    wrapper.innerHTML = `
      <div class="video-container">
        <iframe
          src="https://vidfast.pro/movie/${id}"
          sandbox="allow-same-origin allow-scripts"
          allowfullscreen
        ></iframe>
      </div>`;
    return;
  }

  // TV branch
  const show = await fetchTVDetails(id);
  titleEl.textContent = show.name;

  // inject selectors
  controls.innerHTML = `
    <label class="player-label" for="playerSeason">Season:</label>
    <select class="player-select" id="playerSeason"></select>
    <label class="player-label" for="playerEpisode">Episode:</label>
    <select class="player-select" id="playerEpisode"></select>
  `;

  const seasonSelect  = controls.querySelector('#playerSeason');
  const episodeSelect = controls.querySelector('#playerEpisode');

  // populate seasons
  const seasons = show.seasons.filter(s => s.season_number > 0);
  seasonSelect.innerHTML = seasons
    .map(s => `<option value="${s.season_number}">${s.name}</option>`)
    .join('');
  seasonSelect.value = season;

  // load episodes AND play
  async function loadAndPlay(seasonNum, epNum) {
    const seasonData = await fetchSeasonDetails(id, seasonNum);
    episodeSelect.innerHTML = seasonData.episodes
      .map(ep =>
        `<option value="${ep.episode_number}">Ep ${ep.episode_number} — ${ep.name}</option>`
      )
      .join('');
    episodeSelect.value = epNum;
    playIFrame(seasonNum, epNum);
  }

  function playIFrame(seasonNum, epNum) {
    wrapper.innerHTML = `
      <div class="video-container">
        <iframe
          src="https://vidfast.pro/tv/${id}/${seasonNum}/${epNum}"
          sandbox="allow-same-origin allow-scripts"
          allowfullscreen
        ></iframe>
      </div>`;
  }

  // wire selection changes
  seasonSelect.addEventListener('change', () =>
    loadAndPlay(+seasonSelect.value, 1)
  );
  episodeSelect.addEventListener('change', () =>
    playIFrame(+seasonSelect.value, +episodeSelect.value)
  );

  // initial load
  await loadAndPlay(season, episode);
}

export function closePlayerView() {
  overlay.classList.add('hidden');
  wrapper.innerHTML = '';
  controls.innerHTML = '';
  titleEl.textContent = '';
}
