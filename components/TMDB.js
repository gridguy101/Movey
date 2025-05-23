// components/TMDB.js
export const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYmRmYTVjNzMyMTc2NzFmNjgxY2JlZThlYjlhZjUxMiIsIm5iZiI6MTc0NDQzODg0OS45MzIsInN1YiI6IjY3ZmEwNjQxZGU1ZTRkZWM2MmFkYTJiMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PmOMFeH2cb4LxnvzyMkCq3nVMnBY4aX5l_xZ9Q4CzgA";

async function callTMDB(path) {
  const res = await fetch(`https://api.themoviedb.org/3${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export function fetchMediaDetails(type, id) {
  return callTMDB(`/${type}/${id}`);
}

export function fetchTVDetails(id) {
  return callTMDB(`/tv/${id}`);
}

export function fetchSeasonDetails(id, season) {
  return callTMDB(`/tv/${id}/season/${season}`);
}

// NEW: multi-search
export function searchMulti(query) {
  return callTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
}
export function fetchSimilarMovies(id)  { return callTMDB(`/movie/${id}/similar`); }
export function fetchSimilarTV(id)      { return callTMDB(`/tv/${id}/similar`); }
export function fetchTrendingMovies(tw = 'week') { return callTMDB(`/trending/movie/${tw}`); }
export function fetchTrendingTV(tw = 'week')     { return callTMDB(`/trending/tv/${tw}`); }