// components/MediaStore.js

// Read all keys starting with "m" or "t"
export function getAllMedia() {
  const results = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (/^[mt]\d+$/.test(key)) {
      try {
        results[key] = JSON.parse(localStorage.getItem(key));
      } catch {
        // skip invalid JSON
      }
    }
  }
  return results;
}

// Save MEDIA_DATA or PLAYER_EVENT payload
export function saveMediaData(payload) {
  // payload may be full data.data (MEDIA_DATA) or PLAYER_EVENT.data
  const id   = payload.id   ?? payload.tmdbId;
  const type = payload.type ?? payload.mediaType;
  const key  = (type === 'movie' ? 'm' : 't') + id;

  const existing =
    JSON.parse(localStorage.getItem(key)) ||
    { id, type };

  // Merge in metadata if present
  if (payload.title       ) existing.title        = payload.title;
  if (payload.poster_path ) existing.poster_path  = payload.poster_path;
  if (payload.backdrop_path) existing.backdrop_path = payload.backdrop_path;

  // Update progress
  existing.progress = {
    watched: payload.currentTime,
    duration: payload.duration
  };

  if (type === 'tv') {
    existing.show_progress = existing.show_progress || {};
    const epKey = `s${payload.season}e${payload.episode}`;
    existing.show_progress[epKey] = {
      season: payload.season,
      episode: payload.episode,
      progress: {
        watched: payload.currentTime,
        duration: payload.duration
      },
      last_updated: Date.now()
    };
    existing.last_season_watched  = payload.season;
    existing.last_episode_watched = payload.episode;
  }

  existing.last_updated = Date.now();
  localStorage.setItem(key, JSON.stringify(existing));

  // Notify UI to refresh
  window.dispatchEvent(new Event('watch-data-updated'));
}
